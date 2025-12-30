// AI Player Logic for Practice Mode
// Smart and challenging decision-making with full game awareness

import { CITIES, ROUTES, TRAVEL_TYPE, expandMapGraph } from '../constants/mapData';
import { TOKEN_TYPES } from '../constants/tokens';

const { nodes: EXPANDED_NODES, edges: EXPANDED_EDGES } = expandMapGraph();

/**
 * GAME SITUATION ANALYZER
 * Gives AI full awareness of the game state
 */
export function analyzeGameSituation(state, aiPlayer) {
    const tokens = state.tokens || {};
    const situation = {
        // Token statistics
        totalTokens: Object.keys(tokens).length,
        revealedTokens: 0,
        unrevealedTokens: 0,
        unrevealedCities: [],

        // What's been found
        starFound: state.starFound || false,
        horseshoeFound: false,
        robberLocations: [],
        emptyLocations: [],
        valuableLocations: [], // Cities where gems were found

        // Player status
        aiHasStar: aiPlayer.hasDiamond || false,
        aiHasHorseshoe: aiPlayer.hasHorseshoe || false,
        aiMoney: aiPlayer.money,
        opponentHasStar: false,
        opponentHasHorseshoe: false,
        opponentMoney: 0,
        opponentLocation: null,

        // Strategic info
        capeTownBonusAvailable: !state.capeTownFirstArrived,
        gamePhase: 'early', // 'early', 'mid', 'late', 'endgame'
    };

    // Analyze all tokens
    Object.entries(tokens).forEach(([cityId, token]) => {
        if (token.revealed) {
            situation.revealedTokens++;
            if (token.type === TOKEN_TYPES.HORSESHOE) {
                situation.horseshoeFound = true;
            }
            if (token.type === TOKEN_TYPES.ROBBER) {
                situation.robberLocations.push(cityId);
            }
            if (token.type === TOKEN_TYPES.BLANK) {
                situation.emptyLocations.push(cityId);
            }
            if ([TOKEN_TYPES.RUBY, TOKEN_TYPES.EMERALD, TOKEN_TYPES.TOPAZ].includes(token.type)) {
                situation.valuableLocations.push(cityId);
            }
        } else {
            situation.unrevealedTokens++;
            situation.unrevealedCities.push(cityId);
        }
    });

    // Analyze opponent
    const opponent = state.players.find(p => !p.isAI);
    if (opponent) {
        situation.opponentHasStar = opponent.hasDiamond || false;
        situation.opponentHasHorseshoe = opponent.hasHorseshoe || false;
        situation.opponentMoney = opponent.money;
        situation.opponentLocation = opponent.currentNode;
    }

    // Determine game phase
    const revealedRatio = situation.revealedTokens / situation.totalTokens;
    if (revealedRatio < 0.25) {
        situation.gamePhase = 'early';
    } else if (revealedRatio < 0.5) {
        situation.gamePhase = 'mid';
    } else if (revealedRatio < 0.75) {
        situation.gamePhase = 'late';
    } else {
        situation.gamePhase = 'endgame';
    }

    return situation;
}

/**
 * Calculate distance between two nodes using BFS
 */
function calculateDistance(fromId, toId) {
    if (fromId === toId) return 0;

    const visited = new Set([fromId]);
    const queue = [{ id: fromId, distance: 0 }];

    while (queue.length > 0) {
        const { id, distance } = queue.shift();

        const neighbors = EXPANDED_EDGES.filter(r =>
            (r.from === id || r.to === id) &&
            (r.type === TRAVEL_TYPE.LAND || r.type === TRAVEL_TYPE.SEA)
        );

        for (const route of neighbors) {
            const neighborId = route.from === id ? route.to : route.from;
            if (neighborId === toId) return distance + 1;
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push({ id: neighborId, distance: distance + 1 });
            }
        }
    }
    return Infinity;
}

/**
 * Find the closest unrevealed token city to a location
 */
function findClosestTokenCity(fromId, tokenCities) {
    let closest = null;
    let minDist = Infinity;

    tokenCities.forEach(cityId => {
        const dist = calculateDistance(fromId, cityId);
        if (dist < minDist) {
            minDist = dist;
            closest = cityId;
        }
    });

    return { cityId: closest, distance: minDist };
}

/**
 * Find the next immediate node to move to in order to reach a target node
 * Uses BFS to find shortest path
 */
export function getNextMoveTowards(currentId, targetId) {
    if (currentId === targetId) return null;

    const queue = [{ id: currentId, path: [] }];
    const visited = new Set([currentId]);

    while (queue.length > 0) {
        const { id, path } = queue.shift();

        if (id === targetId) {
            return path[0]; // Return the first step of the path
        }

        const neighbors = EXPANDED_EDGES.filter(r =>
            (r.from === id || r.to === id) &&
            (r.type === TRAVEL_TYPE.LAND || r.type === TRAVEL_TYPE.SEA || r.type === TRAVEL_TYPE.AIR)
        );

        for (const route of neighbors) {
            const neighborId = route.from === id ? route.to : route.from;
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                // We only care about the *immediate* next step from start
                // So if path is empty, adjacent node IS the first step
                const newPath = path.length === 0 ? [neighborId] : path;
                queue.push({ id: neighborId, path: newPath });
            }
        }
    }
    return null; // No path found
}

// Helper to find valid moves that minimize distance to target
function getDistance(startId, endId) {
    if (startId === endId) return 0;
    const queue = [{ id: startId, dist: 0 }];
    const visited = new Set([startId]);

    while (queue.length > 0) {
        const { id, dist } = queue.shift();
        if (id === endId) return dist;

        const neighbors = EXPANDED_EDGES.filter(r => (r.from === id || r.to === id));
        for (const route of neighbors) {
            const neighborId = route.from === id ? route.to : route.from;
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push({ id: neighborId, dist: dist + 1 });
            }
        }
    }
    return Infinity;
}

export function getBestMoveTowards(validMoves, targetId, tokens = {}) {
    if (!validMoves || validMoves.length === 0) return null;
    if (!targetId) return null;

    // Filter for affordable moves only
    const affordableMoves = validMoves.filter(m => m.canAfford !== false);
    if (affordableMoves.length === 0) return null;

    let bestMoves = [];
    let minDistance = Infinity;

    for (const move of affordableMoves) {
        // Evaluate distance from the move's destination to the target
        const dist = getDistance(move.to, targetId);

        // We prefer the move that gets us closest
        if (dist < minDistance) {
            minDistance = dist;
            bestMoves = [move]; // Reset list with new best
        } else if (dist === minDistance) {
            bestMoves.push(move); // Add to tie list
        }
    }

    if (bestMoves.length === 0) return null;
    if (bestMoves.length === 1) return bestMoves[0];

    // Break Ties intelligently
    // Prioritize: 1. Unrevealed Token, 2. City, 3. Random
    const scoredTies = bestMoves.map(move => {
        let score = 0;
        const node = EXPANDED_NODES[move.to] || CITIES[move.to];

        // Bonus for unrevealed token
        const token = tokens[move.to];
        if (token && !token.revealed) {
            score += 10;
        }

        // Bonus for City (vs Dot)
        if (node && (node.type === 'city' || node.type === 'start')) {
            score += 2;
        }

        return { move, score };
    });

    // Sort by score descending
    scoredTies.sort((a, b) => b.score - a.score);

    // Pick randomly from the top scorers (in case multiple cities/tokens have same value)
    const bestScore = scoredTies[0].score;
    const finalCandidates = scoredTies.filter(item => item.score === bestScore);

    return finalCandidates[Math.floor(Math.random() * finalCandidates.length)].move;
}

// Simulate opponent's potential moves to check for threats
function simulateOpponentResponse(state, situation) {
    if (!situation.opponentLocation) return 0;

    // Simplified simulation:
    // Assume opponent rolls average (4) + has money
    // What can they reach?
    const opponentNode = EXPANDED_NODES[situation.opponentLocation] || CITIES[situation.opponentLocation];
    if (!opponentNode) return 0;

    // We can't know exact roll, so we check "reachable within X moves"
    // "Threat" is defined as:
    // 1. Winning the game (reaching home with Star)
    // 2. Finding a Horseshoe (if we have Star)
    // 3. Flipping a token we might want (Racing)

    let threatScore = 0;

    // 1. WINNING THREAT
    if (situation.opponentHasStar) {
        const distToHome = Math.min(
            calculateDistance(situation.opponentLocation, 'cairo'),
            calculateDistance(situation.opponentLocation, 'tangier')
        );
        // If they are close, massive threat!
        threatScore += (20 - distToHome) * 100;
        if (distToHome <= 4) threatScore += 5000; // IMPENDING DOOM
    }

    // 2. HORSESHOE THREAT (If we have Star)
    if (situation.aiHasStar && !situation.horseshoeFound) {
        // If they are close to unrevealed tokens, they might find a horseshoe
        // We penalized this in "Winning Priority" but here we quantify their efficiency
        const { distance } = findClosestTokenCity(situation.opponentLocation, situation.unrevealedCities);
        if (distance <= 4) {
            threatScore += 200; // They are hunting!
        }
    }

    // 3. RACING THREAT (Token Denial)
    // This is relative to EACH AI move, so we might need to pass the AI's target.
    // But as a general "Board Danger" score:

    // Find closest token to opponent
    const closestToken = findClosestTokenCity(situation.opponentLocation, situation.unrevealedCities);
    if (closestToken.cityId && closestToken.distance <= 4) {
        // They are about to get a token.
        threatScore += 50;
    }

    return threatScore;
}

/**
 * Strategy Re-evaluator
 * Returns TRUE if the current strategy should be abandoned
 */
export function shouldAbandonStrategy(state, player) {
    if (!player.aiTarget) return false;

    // 1. INVALID TARGET
    // If target token is already revealed (and we haven't reached it, obviously),
    // and it wasn't the Star (which we'd want to chase if opponent has it, but that's handled elsewhere),
    // then it's a waste of time unless it's a Strategic Location (Gold Coast/Capetown).
    const targetToken = state.tokens[player.aiTarget];
    const isStrategic = ['gold_coast', 'capetown', 'cairo', 'tangier'].includes(player.aiTarget);

    if (targetToken && targetToken.revealed && !isStrategic) {
        // If it's revealed and not special, why go there?
        // Exception: If we are literally 1 step away, might as well invoke chaos? No, save turns.
        console.log(`[AI Strategy] Abandoning: Target ${player.aiTarget} was revealed by someone else.`);
        return true;
    }

    // 2. POOR & FAR
    // If we are broke and the trip is long, we might get stuck or waste time
    // Money < 100 means we can't buy, must roll. Risky if far.
    const distToTarget = calculateDistance(player.currentNode, player.aiTarget);
    if (player.money < 100 && distToTarget > 6) {
        console.log(`[AI Strategy] Abandoning: Too poor (${player.money}) for long journey (${distToTarget} steps).`);
        return true;
    }

    // 3. OPPORTUNITY COST (Distraction)
    // If we are walking past a hidden treasure on our way to a distant goal, STOP!
    // Condition: Target is far (> 4), but another unrevealed city is VERY close (<= 2).
    if (distToTarget > 4) {
        // Check for nearby distractions
        const situation = analyzeGameSituation(state, player);
        const { distance } = findClosestTokenCity(player.currentNode, situation.unrevealedCities);

        if (distance <= 2 && distance > 0) { // >0 means we aren't ON it (that handles automatically)
            console.log(`[AI Strategy] Abandoning: Found closer opportunity (${distance} steps) vs Target (${distToTarget} steps).`);
            return true;
        }
    }

    return false;
}

/**
 * AI Decision: Choose best move from valid moves
 * FULLY AWARE STRATEGY using game situation analysis
 */
export function chooseAIMove(validMoves, state, aiPlayer) {
    if (!validMoves || validMoves.length === 0) return null;

    // Analyze the full game situation
    const situation = analyzeGameSituation(state, aiPlayer);

    // Log AI awareness (for debugging)
    console.log('[AI] Game Situation:', {
        phase: situation.gamePhase,
        tokensLeft: situation.unrevealedTokens,
        starFound: situation.starFound,
        aiHasStar: situation.aiHasStar,
        opponentHasStar: situation.opponentHasStar,
        capeTownBonus: situation.capeTownBonusAvailable
    });

    // Filter to affordable moves first
    const affordableMoves = validMoves.filter(m => m.canAfford);
    const movesToConsider = affordableMoves.length > 0 ? affordableMoves : validMoves;

    // Score each move with FULL AWARENESS + LOOKAHEAD
    const scoredMoves = movesToConsider.map(move => {
        let score = 0;
        const targetNode = EXPANDED_NODES[move.to] || CITIES[move.to];

        // ========== WINNING PRIORITY ==========

        // If AI has Star → GO HOME NOW!
        if (situation.aiHasStar) {
            if (move.to === 'cairo' || move.to === 'tangier') {
                score += 1000; // HIGHEST - WIN!
            }
            // Prefer moves closer to home
            const homeDist = Math.min(
                calculateDistance(move.to, 'cairo'),
                calculateDistance(move.to, 'tangier')
            );
            score += (20 - homeDist) * 20;
        }

        // If AI has Horseshoe and Star is found → Also go home
        if (situation.gamePhase === 'endgame' && situation.aiHasHorseshoe && situation.starFound) {
            if (move.to === 'cairo' || move.to === 'tangier') {
                score += 800;
            }
        }

        // ========== DEFENSIVE/BLOCKING ==========

        // If opponent has Star → EMERGENCY! Chase them!
        if (situation.opponentHasStar) {
            const distToOpponent = calculateDistance(move.to, situation.opponentLocation);
            if (distToOpponent <= 2) {
                score += 300; // Get close to block
            }
            // Also try to cut off their path home
            const opponentHomeDist = Math.min(
                calculateDistance(situation.opponentLocation, 'cairo'),
                calculateDistance(situation.opponentLocation, 'tangier')
            );
            const myHomeDist = Math.min(
                calculateDistance(move.to, 'cairo'),
                calculateDistance(move.to, 'tangier')
            );
            if (myHomeDist < opponentHomeDist) {
                score += 100; // We're closer to their destination
            }
        }

        // ========== TOKEN HUNTING (Context-Aware) ==========

        // Does this move land on an unrevealed token?
        if (situation.unrevealedCities.includes(move.to)) {
            // Base score for any token
            score += 100;

            // SMART: In late game, tokens are more valuable (Star might be there)
            if (situation.gamePhase === 'late' || situation.gamePhase === 'endgame') {
                score += 50;
            }

            // Prefer cities that are far from revealed empty locations
            const nearbyEmpty = situation.emptyLocations.filter(emptyCity =>
                calculateDistance(move.to, emptyCity) <= 3
            ).length;
            score -= nearbyEmpty * 10;

            // Prefer cities far from robber locations
            const nearbyRobbers = situation.robberLocations.filter(robberCity =>
                calculateDistance(move.to, robberCity) <= 2
            ).length;
            score -= nearbyRobbers * 20;

            // RACING: If Opponent is closer to this token than us, REDUCE score (Lost cause)
            // But if we are roughly same distance or closer, KEEP score.
            if (situation.opponentLocation) {
                const oppDist = calculateDistance(situation.opponentLocation, move.to);
                // "move" is our *next* step.
                // Our total distance roughly 1 (this step). 
                // Wait, "move.to" IS the destination if it's a token city.
                // So my distance is 1 (if I reach it).

                // If opponent is also distance 1 or 2, it's a race!
                if (oppDist <= 2) {
                    score += 20; // Fight for it!
                } else if (oppDist > 5) {
                    score += 10; // Safe pick
                }
            }
        }

        // Prefer cities over dots
        if (targetNode?.type === 'city' || targetNode?.type === 'start') {
            score += 20;
        }

        // ========== STRATEGIC LOCATIONS ==========

        // Cape Town bonus
        if (move.to === 'capetown' && situation.capeTownBonusAvailable) {
            score += 80;
        }

        // Gold Coast (2x jewel value)
        if (move.to === 'gold_coast' && situation.unrevealedCities.includes('gold_coast')) {
            score += 40;
        }

        // ========== TRAP AVOIDANCE (Smart) ==========

        if (move.to === 'st_helena' || move.to === 'sahara') {
            if (situation.unrevealedCities.includes(move.to) && situation.unrevealedTokens <= 5) {
                score += 30;
            } else {
                score -= 80;
            }
        }

        // ========== EFFICIENCY ==========
        if (move.cost === 0) {
            score += 15;
        } else if (move.cost === 100) {
            score -= 10;
        } else if (move.cost === 300) {
            if (!situation.aiHasStar && !situation.opponentHasStar) {
                score -= 30;
            }
        }

        // ========== EXPLORATION EFFICIENCY ==========
        let reachableTokens = 0;
        situation.unrevealedCities.forEach(cityId => {
            const dist = calculateDistance(move.to, cityId);
            if (dist <= 4) reachableTokens++;
        });
        score += reachableTokens * 8;

        // ========== OPPONENT SIMULATION / LOOKAHEAD ==========
        // Evaluate the "Danger" of the *FUTURE* board state if we take this move
        // Note: Currently we only update 'aiLocation' in the mental model
        // A full simulation would update turn, move opponent etc.
        // We will do a shallow check:
        // "Does moving here put me in a bad spot relative to opponent?"

        // Example: Moving to a dead-end far from opponent might be bad if they are winning.
        if (situation.opponentHasStar) {
            const distAfterMove = calculateDistance(move.to, situation.opponentLocation);
            // We want to be CLOSE to them (to block/intercept logic above).
        }

        // RACE CHECK:
        // If we move to 'move.to', are we letting opponent grab a BETTER token?
        // (Hard to calc without full minimax).

        // Let's use the 'simulateOpponentResponse' function purely to see if board is dangerous
        // We pass the hypothetical state where WE are at move.to?
        // Actually, opponent state doesn't change based on where we go (unless we block).
        // So the 'threatScore' is currently constant for all moves unless we affect opponent.
        // BUT, our *position* relative to the threat changes.

        // If generic threat is high (Opponent winning), we should prioritize Interception or Winning.
        const threatLevel = simulateOpponentResponse(state, situation);
        if (threatLevel > 1000) {
            // Panic Mode! PRIORITIZE WINNING/INTERCEPTING
            // Validated by the huge bonuses in "Winning Priority" and "Defensive" sections.
        }

        // Small random factor for variety
        score += Math.random() * 5;

        return { move, score, reasoning: `${move.to}: ${score.toFixed(0)}` };
    });

    // Sort by score
    scoredMoves.sort((a, b) => b.score - a.score);

    // Log top choices
    console.log('[AI] Top moves:', scoredMoves.slice(0, 3).map(s => s.reasoning));

    return scoredMoves[0]?.move || movesToConsider[0];
}

/**
 * AI Decision: Should buy token or roll for it?
 */
export function chooseTokenAction(aiPlayer, hasRolled) {
    if (hasRolled) return 'roll';
    if (aiPlayer.money < 100) return 'roll';

    // Always buy if can afford (100% vs 50%)
    return 'buy';
}

/**
 * Continue AI turn after state update
 */
export function continueAITurn(dispatch, state) {
    const aiPlayer = state.players[state.currentPlayerIndex];
    if (!aiPlayer?.isAI) return false;

    const validMoves = state.validMoves || [];

    if (state.diceResult != null && validMoves.length > 0) {
        const bestMove = chooseAIMove(validMoves, state, aiPlayer);
        if (bestMove) {
            setTimeout(() => {
                dispatch({ type: 'MOVE_PLAYER', payload: { targetNodeId: bestMove.to } });
            }, 1200);
            return true;
        }
    }

    if (state.turnPhase === 'action') {
        const token = state.tokens[aiPlayer.currentNode];
        if (token && !token.revealed) {
            const action = chooseTokenAction(aiPlayer, state.diceResult != null);
            setTimeout(() => {
                dispatch({
                    type: 'FLIP_TOKEN',
                    payload: { cityId: aiPlayer.currentNode, method: action }
                });
            }, 1200);
            return true;
        }
    }

    if (state.diceResult != null && state.turnPhase !== 'action') {
        setTimeout(() => {
            dispatch({ type: 'END_TURN' });
        }, 800);
        return true;
    }

    return false;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
