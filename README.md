# Dashamoolam Challenge App

An AI-powered web app that lets you point your camera at any object or person and get a unique, nonsensical challenge or roast in the persona of the famous movie character, Dashamoolam Damu.

<img width="1919" height="1017" alt="image" src="https://github.com/user-attachments/assets/d9d493f5-643e-4b28-aedf-0c5a642f2cf0" />
<img width="1919" height="1007" alt="image" src="https://github.com/user-attachments/assets/b900d408-0d25-4ed9-9310-85eaba605027" />


*(You can replace the URL above with a link to a screenshot of your app)*

---
## About The Project

This project was built to explore the integration of real-time object detection with creative text generation from large language models. The app uses your device's camera to identify what it's looking at and then calls a powerful AI to generate a humorous, in-character response in Manglish.

The core challenge was to create a seamless pipeline from a live video feed to a specific, culturally-nuanced AI persona, all served through a simple and interactive web interface.

## Features

* **Real-time Object Detection:** Uses a Python backend with OpenCV and a YOLOv3 model to identify objects from the camera feed.
* **AI Persona Generation:** Leverages the **Google Gemini API** to generate challenges and roasts in the specific style of Dashamoolam Damu.
* **Dual AI Modes:** The AI has a special "ookal" (roast) mode when it detects a person.
* **Interactive UI:** A polished, animated, and mobile-friendly user interface with a homepage and a scanner view.
* **Full Camera Control:** Features include switching between front/back cameras, mirroring the display horizontally, and adjusting the video brightness.
* **On-demand Translation:** Challenges generated in Manglish can be translated to English with the click of a button.

## Tech Stack

* **Frontend:** HTML, CSS, Vanilla JavaScript
* **Backend:** Node.js, Express.js
* **Object Detection:** Python, OpenCV
* **AI Text Generation:** **Google Gemini API**

---
## Getting Started

Follow these steps to get the project running locally.

### Prerequisites

You must have the following software installed on your computer:
* Git
* Node.js and npm
* Python and pip

### Installation

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/YourUsername/damu-challenge-app.git](https://github.com/YourUsername/damu-challenge-app.git)
    cd damu-challenge-app
    ```

2.  **Setup Backend Dependencies:**
    Navigate into the `backend` folder and install the necessary Node.js and Python packages.
    ```bash
    cd backend
    npm install
    pip install opencv-python numpy
    ```

3.  **Download the YOLOv3 Model:**
    * Inside the `backend` folder, create a new folder named `yolo`.
    * Download `yolov3.weights`, `yolov3.cfg`, and `coco.names` and place them inside the `backend/yolo` folder.

4.  **Set Up Credentials:**
    * In the `backend` folder, create a new file named `.env`.
    * Go to **Google AI Studio** to get your Gemini API Key.
    * Add your key to the `.env` file:
        ```
        GEMINI_API_KEY=your_gemini_api_key_here
        ```
    * **Important:** Ensure the **Vertex AI API** is enabled in your Google Cloud project.

---
## Usage

1.  Navigate to the `backend` folder in your terminal.
2.  Start the server:
    ```bash
    node server.js
    ```
3.  Open your browser and go to **`http://localhost:3000`**.

## Deployment Note

This application's architecture (Node.js with a Python child process for OpenCV) is not suitable for standard serverless platforms like Vercel or Netlify. It is designed to be deployed on a persistent server environment like a VPS (e.g., DigitalOcean, Linode, AWS EC2) where you have full control to install system dependencies.
