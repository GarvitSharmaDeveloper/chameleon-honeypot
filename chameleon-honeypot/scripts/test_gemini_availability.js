const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

async function run() {
    const apiKey = envConfig.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    console.log("Fetching available models via REST...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });

            // Test gemini-flash-latest
            console.log("\nTesting gemini-flash-latest...");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const result = await model.generateContent("Reply with 'OK'");
            console.log("SUCCESS: gemini-flash-latest responded:", result.response.text());

        } else {
            console.error("No models found or error:", data);
        }

    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

run();
