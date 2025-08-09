require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// --- INITIALIZE GEMINI CLIENT ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- HELPER FUNCTIONS ---

function detectObjectWithPython(imageBase64) {
    // This function remains the same
    return new Promise((resolve, reject) => {
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const tempImagePath = path.join(__dirname, `temp_image_${Date.now()}.jpg`);
        fs.writeFileSync(tempImagePath, imageBuffer);

        const pythonProcess = spawn('python', [path.join(__dirname, 'detector.py'), tempImagePath]);
        let detectedObject = '';
        pythonProcess.stdout.on('data', (data) => {
            detectedObject += data.toString().trim();
        });
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
            fs.unlinkSync(tempImagePath);
            reject(new Error(`Python script error: ${data}`));
        });
        pythonProcess.on('close', (code) => {
            fs.unlinkSync(tempImagePath);
            if (code !== 0) {
                return reject(new Error(`Python script exited with code ${code}`));
            }
            resolve(detectedObject || 'mysterious object');
        });
    });
}

async function generateChallengeWithGemini(objectLabel) {
    console.log("Generating challenge with Gemini API...");
    // --- USING THE LATEST MODEL ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    let prompt;
    
    const baseInstruction = "You are an actor playing the Malayalam movie character Dashamoolam Damu. Your only job is to create a funny, 1-2 sentence roast or challenge in Manglish. Your response must be ONLY the Manglish text. No explanation, no translation, no extra text, no brackets, and no Malayalam script.";

    if (objectLabel.toLowerCase() === 'person') {
        prompt = `${baseInstruction} The target is the person in front of you. Roast them.`;
    } else {
        prompt = `${baseInstruction} The target is an object. Challenge the ${objectLabel}.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

// --- MAIN API ENDPOINT ---
app.post('/challenge', async (req, res) => {
    try {
        console.log('Received a challenge request...');
        const imageBase64 = req.body.image.replace(/^data:image\/jpeg;base64,/, "");

        const objectLabel = await detectObjectWithPython(imageBase64);
        const challengeText = await generateChallengeWithGemini(objectLabel);
        
        console.log(`Gemini generated: "${challengeText}"`);
        
        res.json({ text: challengeText });

    } catch (error) {
        console.error('ERROR in /challenge endpoint:', error);
        res.status(500).send('Failed to process challenge.');
    }
});

// --- TRANSLATE API ENDPOINT ---
app.post('/translate', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'No text provided to translate.' });
        }

        console.log(`Received request to translate: "${text}"`);
        // --- USING THE LATEST MODEL ---
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

        const prompt = `Translate the following Manglish text into simple, natural-sounding English. Provide ONLY the English translation, with no extra phrases like 'The translation is:'. Manglish text: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text();
        
        console.log(`Translation generated: "${translatedText}"`);

        res.json({ translatedText });

    } catch (error) {
        console.error('ERROR in /translate endpoint:', error);
        res.status(500).send('Failed to process translation.');
    }
});

// --- START THE SERVER ---
app.listen(port, () => {
    console.log(`Dashamoolam's server (Powered by Gemini) is now live at http://localhost:${port}`);
});