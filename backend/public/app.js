document.addEventListener('DOMContentLoaded', () => {

    // --- Page Views ---
    const homeView = document.getElementById('home-view');
    const scannerView = document.getElementById('scanner-view');

    // --- Buttons ---
    const startScanBtn = document.getElementById('start-scan-btn');
    const backBtn = document.getElementById('back-btn');
    const challengeBtn = document.getElementById('challenge-btn');
    const closeBtn = document.querySelector('.close-btn');
    const translateBtn = document.getElementById('translate-btn');
    const flipCameraBtn = document.getElementById('flip-camera-btn');
    const mirrorBtn = document.getElementById('mirror-btn');
    const brightnessSlider = document.getElementById('brightness-slider');

    const homeButton = document.querySelector('.home-button');
    if (homeButton) {
        homeButton.addEventListener('mousemove', e => {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.target.style.setProperty('--x', `${x}px`);
            e.target.style.setProperty('--y', `${y}px`);
        });
    }

    // --- Modal Elements ---
    const modalContainer = document.getElementById('modal-container');
    const modalTextOriginal = document.getElementById('modal-text-original');
    const modalTextTranslated = document.getElementById('modal-text-translated');

    // --- Other Elements ---
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('camera-capture');
    const statusDisplay = document.getElementById('status-display');
    const statusText = document.getElementById('status-text');
    
    const BACKEND_URL = ''; 
    let cameraStream = null;
    let originalTextToTranslate = "";
    let currentFacingMode = 'environment';
    let isMirrored = false;

    // --- Camera Logic ---
    async function startCamera(facingMode) {
        if (cameraStream) {
            stopCamera();
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
            cameraStream = stream;
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            };
        } catch (err) {
            console.error("Error accessing camera:", err);
            modalTextOriginal.textContent = "Could not access camera. Please grant permission.";
            modalContainer.style.display = 'flex';
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
            video.srcObject = null;
        }
    }

    // --- Page Navigation ---
    startScanBtn.addEventListener('click', () => {
        homeView.style.display = 'none';
        scannerView.style.display = 'block';
        startCamera(currentFacingMode);
    });

    backBtn.addEventListener('click', () => {
        scannerView.style.display = 'none';
        homeView.style.display = 'block';
        stopCamera();
    });

    // --- Camera Controls ---
    flipCameraBtn.addEventListener('click', () => {
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        startCamera(currentFacingMode);
    });

    mirrorBtn.addEventListener('click', () => {
        isMirrored = !isMirrored;
        video.classList.toggle('mirrored');
    });

    brightnessSlider.addEventListener('input', () => {
        const brightnessValue = brightnessSlider.value / 100;
        video.style.filter = `brightness(${brightnessValue})`;
    });

    // --- Challenge Logic ---
    challengeBtn.addEventListener('click', async (event) => {
        event.preventDefault(); 
        challengeBtn.disabled = true;

        try {
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageBase64 = canvas.toDataURL('image/jpeg');
            
            const response = await fetch(`${BACKEND_URL}/challenge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageBase64 }),
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            originalTextToTranslate = data.text;
            modalTextOriginal.textContent = `"${originalTextToTranslate}"`;
            modalTextTranslated.style.display = 'none';
            modalTextTranslated.textContent = "";
            translateBtn.style.display = 'inline-block';
            modalContainer.style.display = 'flex';

        } catch (error) {
            console.error('An error was caught in the main block:', error);
            modalTextOriginal.textContent = "An error occurred. Check the console for details.";
            modalContainer.style.display = 'flex';
        } finally {
            challengeBtn.disabled = false;
        }
    });

    // --- Translate Button Logic ---
    translateBtn.addEventListener('click', async () => {
        translateBtn.disabled = true;
        translateBtn.textContent = 'Translating...';

        try {
            const response = await fetch(`${BACKEND_URL}/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: originalTextToTranslate }),
            });

            if (!response.ok) {
                throw new Error('Translation failed');
            }

            const data = await response.json();
            modalTextTranslated.textContent = data.translatedText;
            modalTextTranslated.style.display = 'block';
            translateBtn.style.display = 'none';

        } catch (error) {
            console.error('Translation error:', error);
            modalTextTranslated.textContent = 'Could not translate.';
            modalTextTranslated.style.display = 'block';
        } finally {
            translateBtn.disabled = false;
            translateBtn.textContent = 'Translate';
        }
    });

    closeBtn.addEventListener('click', () => {
        modalContainer.style.display = 'none';
    });
});