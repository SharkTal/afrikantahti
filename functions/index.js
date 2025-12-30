const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

admin.initializeApp();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

/**
 * Callable function to get a move suggestion from Gemini AI.
 * The API key is stored in Firebase config (functions.config().gemini.key).
 */
exports.getGeminiMove = functions.https.onCall(async (data, context) => {
    // Basic validation
    if (!data.prompt) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "prompt" argument.');
    }

    // Get API Key from environment configuration
    // Run: firebase functions:config:set gemini.key="YOUR_API_KEY"
    const apiKey = functions.config().gemini.key;

    // Fallback for local testing (optional, remove in production if strict)
    // const apiKey = functions.config().gemini.key || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Gemini API key is not configured.");
        throw new functions.https.HttpsError('failed-precondition', 'Gemini API key is not configured on the server.');
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: data.prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 150,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", response.status, errorText);
            throw new functions.https.HttpsError('internal', `Gemini API returned status ${response.status}`);
        }

        const responseData = await response.json();

        // Pass the raw Gemini response back to the client
        // The client already has logic to parse the JSON text from the candidate
        return responseData;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new functions.https.HttpsError('internal', 'Failed to call Gemini API.');
    }
});
