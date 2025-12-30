// Gemini AI Service for Afrikan Tähti
// Provides LLM-powered game analysis and decision making via Firebase Cloud Functions (Gemini 2.5 Flash-Lite)

import { functions, httpsCallable, database, ref, get, push, set } from '../firebase';

// Memory Logic
async function fetchAIMemory() {
    try {
        const memoryRef = ref(database, 'ai_memory/lessons');
        // Get last 10 lessons
        const snapshot = await get(memoryRef); // In a real app we'd use query limits
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.values(data).slice(-5).map(l => l.text); // Last 5 lessons
        }
    } catch (error) {
        console.warn('Failed to fetch AI memory:', error);
    }
    return [];
}

export async function saveAIMemory(lessonText, outcome) {
    try {
        const memoryRef = ref(database, 'ai_memory/lessons');
        const newLessonRef = push(memoryRef);
        await set(newLessonRef, {
            text: lessonText,
            timestamp: Date.now(),
            outcome: outcome
        });
        console.log('[AI Memory] Saved lesson:', lessonText);
    } catch (error) {
        console.warn('Failed to save AI memory:', error);
    }
}

/**
 * Generate a lesson from a finished game
 */
export async function generatePostGameLesson(state, winner) {
    console.log('[Gemini] Reflecting on game...');
    const aiPlayer = state.players.find(p => p.isAI);
    const won = winner && winner.id === aiPlayer.id;

    // Simple prompt for reflection
    const prompt = `
    The game of Afrikan Tähti just ended.
    AI Player (${won ? 'WON' : 'LOST'}).
    Win Reason: ${state.winReason || 'Unknown'}.
    AI Money: ${aiPlayer.money}.
    AI Position: ${aiPlayer.currentNode}.
    
    Briefly analyze why the AI ${won ? 'succeeded' : 'failed'} and provide ONE short, specific strategic tip (max 15 words) for the next game.
    Example: "Don't fly to Cape Town if you have less than 500 dollars."
    `;

    try {
        const getGeminiMoveFn = httpsCallable(functions, 'getGeminiMove');
        // Re-using the move function but ignoring the JSON requirement for now, or we can just ask for text.
        // Actually, our cloud function expects JSON back from Gemini usually? 
        // Let's modify the prompt to ask for JSON to be safe with existing parser logic, 
        // OR just rely on the text extraction in the client.

        const jsonPrompt = `${prompt}
        Reply with JSON: {"lesson": "your tip here"}`;

        const result = await getGeminiMoveFn({ prompt: jsonPrompt });
        const response = result.data;
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            const data = JSON.parse(match[0]);
            if (data.lesson) {
                await saveAIMemory(data.lesson, won ? 'win' : 'loss');
                return data.lesson;
            }
        }
    } catch (e) {
        console.error('Reflection failed:', e);
    }
}

/**
 * Format game state into a prompt for Gemini
 */
function formatGamePrompt(state, aiPlayer, validMoves, situation, memory = []) {
    const opponent = state.players.find(p => !p.isAI);

    // Build move options list
    const moveOptions = validMoves.map((move, i) => {
        const hasToken = situation.unrevealedCities.includes(move.to);
        return `${i + 1}. ${move.to}${hasToken ? ' (has hidden token)' : ''}${move.cost > 0 ? ` (costs £${move.cost})` : ''}`;
    }).join('\n');

    let memorySection = '';
    if (memory && memory.length > 0) {
        memorySection = `
LONG-TERM MEMORY (Lessons from past games):
${memory.map(m => `- ${m}`).join('\n')}
(Use these lessons to guide your decision if relevant)
`;
    }
    let prompt = `
You are playing the board game "Afrikan Tähti" (Star of Africa). 
Your goal is to find the Star of Africa and return to Cairo or Tangier.

CURRENT SITUATION:
- You are at: ${aiPlayer.currentNode}
- Money: ${aiPlayer.money} (Crucial for flying/sailing)
- Opponent is at: ${opponent.currentNode} (Has Star: ${opponent.hasDiamond ? 'YES' : 'NO'})
- Game Phase: ${situation.gamePhase}
- Unrevealed Tokens Left: ${situation.unrevealedTokens}
`;

    // CRITICAL CONTEXT INJECTION
    if (aiPlayer.money < 100) {
        prompt += `
CRITICAL WARNING: 
You are POOR (Money < 100). You cannot fly or take sea routes easily.
You MUST prioritize a target that is CLOSE (within 3-5 steps).
DO NOT suggest distant cities like Cairo, Tunis, or St. Marie.
Find the nearest City with an unrevealed token to get money.
`;
    }

    prompt += `
VALID MOVES:
${JSON.stringify(validMoves.map(m => m.to))}

UNREVEALED CITIES (Candidates):
${JSON.stringify(situation.unrevealedCities.slice(0, 15))}... (and more)

TASK:
1. Select a "Target City" from the map (it doesn't have to be in Valid Moves, it's a long-term goal).
2. If you are Poor (< 100), choose a Close target.
3. If you found the Star, your Target MUST be 'cairo' or 'tangier'.
4. Explain your reasoning.

Respond ONLY in JSON format:
{
  "target": "city_id",
  "reason": "short explanation"
}
`;

    return prompt;
}

/**
 * Get AI move using Gemini LLM via Cloud Function
 * Returns the chosen move or null if API fails
 */
export async function getGeminiMove(state, aiPlayer, validMoves, situation) {
    if (!validMoves || validMoves.length === 0) return null;

    console.log('[Gemini] Analyzing game situation (via Cloud Function)...');

    // Fetch memory first
    const memory = await fetchAIMemory();
    if (memory.length > 0) {
        console.log('[Gemini] Recalled memories:', memory);
    }

    try {
        const prompt = formatGamePrompt(state, aiPlayer, validMoves, situation, memory);

        const getGeminiMoveFn = httpsCallable(functions, 'getGeminiMove');
        const result = await getGeminiMoveFn({ prompt });
        const response = result.data;

        let moveData = null;

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            moveData = JSON.parse(jsonMatch[0]);
        }

        if (moveData && moveData.target) {
            console.log(`[Gemini] Selected Strategy: Target ${moveData.target} - ${moveData.reason}`);
            return {
                target: moveData.target,
                reason: moveData.reason,
                source: 'gemini'
            };
        }
    } catch (error) {
        console.error('[Gemini] Cloud Function Error:', error);
        return null; // Fallback to rule-based AI
    }

    console.log('[Gemini] Could not parse response, falling back to rule-based AI');
    return null;
}

/**
 * Check if Gemini is available
 */
export function isGeminiAvailable() {
    return true;
}
