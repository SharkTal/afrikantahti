import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { CITIES, ROUTES, TRAVEL_TYPE, TRAVEL_COSTS, expandMapGraph } from '../constants/mapData';
import { TOKEN_TYPES, TOKEN_COUNTS as TOKENS, TOKEN_VALUES } from '../constants/tokens';
import { database, ref, set, onValue, getGameStateRef } from '../firebase';

const GameContext = createContext();

// INITIALIZE THE EXPANDED MAP GRAPH (With Dots)
const { nodes: EXPANDED_NODES, edges: EXPANDED_EDGES } = expandMapGraph();

// Helper to shuffle tokens and assign to cities
function shuffleTokens() {
    const cityIds = Object.keys(CITIES);
    const tokens = [];

    // Create token pool
    Object.entries(TOKENS).forEach(([type, count]) => {
        for (let i = 0; i < count; i++) tokens.push({ type, revealed: false });
    });

    // Shuffle
    for (let i = tokens.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
    }

    const distribution = {};
    const validCities = cityIds.filter(id => CITIES[id].type !== 'start');

    validCities.forEach((cityId, index) => {
        if (index < tokens.length) {
            distribution[cityId] = tokens[index];
        }
    });

    return distribution;
}

const initialState = {
    players: [
        { id: 1, name: 'Player 1', color: '#e74c3c', money: 300, currentNode: Math.random() < 0.5 ? 'cairo' : 'tangier', hasDiamond: false, hasHorseshoe: false, aiTarget: null },
        { id: 2, name: 'Player 2', color: '#3498db', money: 300, currentNode: Math.random() < 0.5 ? 'cairo' : 'tangier', hasDiamond: false, hasHorseshoe: false, aiTarget: null },
    ],
    currentPlayerIndex: 0,
    gameStatus: 'setup',
    diceResult: null,
    validMoves: [],
    tokens: shuffleTokens(),
    starFound: false,
    lastRevealedToken: null,
    turnPhase: 'rolling', // 'rolling' | 'moving' | 'action' | 'trapped'
    winner: null,
    winReason: null,
    // Special Location State
    capeTownFirstArrived: false,
    trappedPlayer: null, // { playerId, trapType: 'pirates' | 'bedouins' }
};

// Helper to get direct flight moves (No Dice)
function getFlightMoves(currentNodeId, money) {
    const moves = [];
    ROUTES.filter(r => r.type === TRAVEL_TYPE.AIR && (r.from === currentNodeId || r.to === currentNodeId)).forEach(route => {
        const targetId = route.from === currentNodeId ? route.to : route.from;
        const cost = 300;
        if (money >= cost) {
            moves.push({
                to: targetId,
                type: 'air',
                cost: cost,
                canAfford: true
            });
        }
    });
    return moves;
}

// Helper to find reachable nodes based on dice roll range
function getReachableNodes(startNodeId, range) {
    const reachable = new Map();
    const queue = [{ id: startNodeId, distance: 0 }];
    const visited = new Set([startNodeId]);

    while (queue.length > 0) {
        const { id, distance } = queue.shift();

        if (distance > 0) {
            const node = EXPANDED_NODES[id] || CITIES[id];
            if (!node) continue;

            const isRealCity = (node.type === 'city' || node.type === 'start');
            const isDot = (node.type === 'dot');
            const canStop = (isRealCity && distance <= range) || (isDot && distance === range);

            if (canStop) {
                if (!reachable.has(id)) {
                    reachable.set(id, distance);
                }
            }
        }

        if (distance >= range) continue;

        const neighbors = EXPANDED_EDGES.filter(r =>
            (r.from === id || r.to === id) && (r.type === TRAVEL_TYPE.LAND || r.type === TRAVEL_TYPE.SEA)
        );

        for (const route of neighbors) {
            const neighborId = route.from === id ? route.to : route.from;
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push({ id: neighborId, distance: distance + 1 });
            }
        }
    }
    return reachable;
}

function getReachableMovesWithCost(startNodeId, range, money) {
    const moves = [];
    const queue = [{ id: startNodeId, distance: 0, firstStepType: null }];
    const visited = new Map();
    visited.set(startNodeId, null);

    while (queue.length > 0) {
        const { id, distance, firstStepType } = queue.shift();

        if (distance > 0) {
            const node = EXPANDED_NODES[id] || CITIES[id];
            if (node) {
                const isRealCity = (node.type === 'city' || node.type === 'start');
                const isDot = (node.type === 'dot');
                const canStop = (isRealCity && distance <= range) || (isDot && distance === range);

                if (canStop) {
                    let cost = 0;
                    const startNodeCtx = EXPANDED_NODES[startNodeId] || CITIES[startNodeId];
                    const alreadyAtSea = (startNodeCtx.type === 'dot' && startNodeCtx.dotType === TRAVEL_TYPE.SEA);

                    if (!alreadyAtSea && firstStepType === TRAVEL_TYPE.SEA) {
                        cost = 100;
                    }

                    const existing = moves.find(m => m.to === id);
                    if (!existing) {
                        moves.push({ to: id, type: 'step', cost, canAfford: money >= cost });
                    }
                }
            }
        }

        if (distance >= range) continue;

        const neighbors = EXPANDED_EDGES.filter(r => (r.from === id || r.to === id) && (r.type === TRAVEL_TYPE.LAND || r.type === TRAVEL_TYPE.SEA));

        for (const route of neighbors) {
            const neighborId = route.from === id ? route.to : route.from;
            if (!visited.has(neighborId)) {
                let nextFirstStepType = firstStepType;
                if (distance === 0) {
                    nextFirstStepType = route.type;
                }
                visited.set(neighborId, nextFirstStepType);
                queue.push({ id: neighborId, distance: distance + 1, firstStepType: nextFirstStepType });
            }
        }
    }

    return moves;
}

// Helper for Sea Rescue (Players with < £100 can move 2 steps by Sea for free)
function getSeaRescueMoves(startNodeId) {
    const moves = [];
    const queue = [{ id: startNodeId, distance: 0 }];
    const visited = new Set([startNodeId]);

    while (queue.length > 0) {
        const { id, distance } = queue.shift();

        if (distance > 0) {
            const node = EXPANDED_NODES[id] || CITIES[id];
            if (node) {
                moves.push({ to: id, type: 'rescue_sea', cost: 0, canAfford: true });
            }
        }

        if (distance >= 2) continue;

        const neighbors = EXPANDED_EDGES.filter(r =>
            (r.from === id || r.to === id) && r.type === TRAVEL_TYPE.SEA
        );

        for (const route of neighbors) {
            const neighborId = route.from === id ? route.to : route.from;
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push({ id: neighborId, distance: distance + 1 });
            }
        }
    }
    return moves;
}

function gameReducer(state, action) {
    switch (action.type) {
        case 'START_GAME':
            // Initial moves for P1
            const p1 = state.players[0];
            return {
                ...state,
                gameStatus: 'playing',
                tokens: shuffleTokens(),
                turnPhase: 'rolling',
                validMoves: getFlightMoves(p1.currentNode, p1.money)
            };

        case 'ROLL_DICE':
            const dice = Math.floor(Math.random() * 6) + 1;
            const pNow = state.players[state.currentPlayerIndex];
            let moves = getReachableMovesWithCost(pNow.currentNode, dice, pNow.money);

            // Sea Rescue Rule (2005 Amendment): < £100 -> Free 2 steps by Sea
            if (pNow.money < 100) {
                const rescueMoves = getSeaRescueMoves(pNow.currentNode);
                // Merge unique moves. Priority to Rescue (free) if duplicate?
                // Usually moves are distinct by destination.
                // If a destination is reachable by both (unlikely given different ranges), prefer free?
                // Rescue moves are max 2 steps. Dice moves are 'dice' steps.
                // Just add them.
                rescueMoves.forEach(rm => {
                    if (!moves.find(m => m.to === rm.to)) {
                        moves.push(rm);
                    }
                });
            }

            return {
                ...state,
                diceResult: dice,
                validMoves: moves,
                turnPhase: 'moving'
            };

        case 'END_TURN':
            const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
            const nextPlayer = state.players[nextIndex];
            const flightMoves = getFlightMoves(nextPlayer.currentNode, nextPlayer.money);

            return {
                ...state,
                diceResult: null,
                validMoves: flightMoves,
                currentPlayerIndex: nextIndex,
                turnPhase: 'rolling'
            };

        case 'MOVE_PLAYER':
            const { targetNodeId } = action.payload;
            const pIndex = state.currentPlayerIndex;
            const p = state.players[pIndex];

            const move = state.validMoves.find(m => m.to === targetNodeId);
            // Safety check
            if (!move) return state;
            if (!move.canAfford) return state;

            let newMoney = p.money - move.cost;
            let capeTownFirstArrived = state.capeTownFirstArrived;

            // Cape Town First Arrival Bonus
            if (targetNodeId === 'capetown' && !state.capeTownFirstArrived) {
                newMoney += 500;
                capeTownFirstArrived = true;
            }

            const updatedPlayersMove = [...state.players];
            updatedPlayersMove[pIndex] = {
                ...p,
                currentNode: targetNodeId,
                money: newMoney,
                aiTarget: (p.aiTarget === targetNodeId) ? null : p.aiTarget // Clear target if reached
            };

            let newStatus = state.gameStatus;
            const isAtHome = (targetNodeId === 'cairo' || targetNodeId === 'tangier');

            if (isAtHome) {
                if (p.hasDiamond) {
                    newStatus = 'finished';
                    // Trigger AI Learning if AI is playing
                    // We need to do this via a side-effect, but we can't do it in reducer.
                    // We'll rely on the useEffect in Provider to catch the 'finished' status change?
                    // OR we add a flag. 
                    // Actually, the reducer just sets state. The useEffect will need to detect the transition.
                    // But waiting for useEffect might be easier.
                    // Let's defer to the AI turn handler in useEffect? No, that runs during 'playing'.
                    // We'll add a new useEffect for Game Over.
                    return {
                        ...state,
                        gameStatus: 'finished',
                        players: updatedPlayersMove,
                        winner: p,
                        winReason: 'Found the Star of Africa!',
                        diceResult: null,
                        validMoves: [],
                        turnPhase: 'game_over',
                        capeTownFirstArrived
                    };
                } else if (p.hasHorseshoe && state.starFound) {
                    newStatus = 'finished';
                    return {
                        ...state,
                        gameStatus: 'finished',
                        players: updatedPlayersMove,
                        winner: p,
                        winReason: 'Returned with a Horseshoe!',
                        diceResult: null,
                        validMoves: [],
                        turnPhase: 'game_over',
                        capeTownFirstArrived
                    };
                }
            }

            // St. Helena Pirates Trap
            if (targetNodeId === 'st_helena') {
                return {
                    ...state,
                    gameStatus: newStatus,
                    players: updatedPlayersMove,
                    diceResult: null,
                    validMoves: [],
                    turnPhase: 'trapped',
                    trappedPlayer: { playerId: p.id, trapType: 'pirates' },
                    capeTownFirstArrived
                };
            }

            // Sahara Bedouins Trap
            if (targetNodeId === 'sahara') {
                return {
                    ...state,
                    gameStatus: newStatus,
                    players: updatedPlayersMove,
                    diceResult: null,
                    validMoves: [],
                    turnPhase: 'trapped',
                    trappedPlayer: { playerId: p.id, trapType: 'bedouins' },
                    capeTownFirstArrived
                };
            }

            const targetToken = state.tokens[targetNodeId];
            const hasHiddenToken = targetToken && !targetToken.revealed;

            if (hasHiddenToken && newStatus !== 'finished') {
                return {
                    ...state,
                    gameStatus: newStatus,
                    players: updatedPlayersMove,
                    diceResult: null,
                    validMoves: [],
                    turnPhase: 'action',
                    capeTownFirstArrived
                };
            } else {
                const nextPIndex = (state.currentPlayerIndex + 1) % state.players.length;
                const nextP = state.players[nextPIndex];
                const nextFlightMoves = getFlightMoves(nextP.currentNode, nextP.money);

                return {
                    ...state,
                    gameStatus: newStatus,
                    players: updatedPlayersMove,
                    diceResult: null,
                    validMoves: nextFlightMoves,
                    currentPlayerIndex: nextPIndex,
                    turnPhase: 'rolling',
                    capeTownFirstArrived
                };
            }

        case 'FLIP_TOKEN':
            const { cityId, method } = action.payload;
            const fpIndex = state.currentPlayerIndex;
            const fp = state.players[fpIndex];

            if (fp.currentNode !== cityId) return state;

            const token = state.tokens[cityId];
            if (!token || token.revealed) return state;

            let cost = 0;
            let shouldReveal = false;
            let endTurn = false;

            if (method === 'buy') {
                if (fp.money < 100) return state;
                cost = 100;
                shouldReveal = true;
                endTurn = true;
            } else if (method === 'roll') {
                if (state.diceResult === null) return state;
                if (state.diceResult >= 4) {
                    shouldReveal = true;
                    endTurn = true;
                } else {
                    alert(`Rolled ${state.diceResult}. Need 4, 5, or 6 to open. Turn Ends.`);
                    endTurn = true;
                }
            } else {
                shouldReveal = true;
            }

            if (endTurn && !shouldReveal) {
                const nextIndexEnd = (state.currentPlayerIndex + 1) % state.players.length;
                const nextPlayerEnd = state.players[nextIndexEnd];
                const flightMovesEnd = getFlightMoves(nextPlayerEnd.currentNode, nextPlayerEnd.money);

                return {
                    ...state,
                    diceResult: null,
                    validMoves: flightMovesEnd,
                    currentPlayerIndex: nextIndexEnd,
                    turnPhase: 'rolling'
                };
            }

            if (!shouldReveal) return state;

            let playerUpdate = { ...fp, money: fp.money - cost };
            const newTokens = {
                ...state.tokens,
                [cityId]: { ...token, revealed: true }
            };

            const value = TOKEN_VALUES[token.type] || 0;
            let gameStarFound = state.starFound;

            // Gold Coast 2x Jewel Value
            const isJewel = [TOKEN_TYPES.RUBY, TOKEN_TYPES.EMERALD, TOKEN_TYPES.TOPAZ].includes(token.type);
            const jewelMultiplier = (cityId === 'gold_coast' && isJewel) ? 2 : 1;

            if (token.type === TOKEN_TYPES.ROBBER) {
                playerUpdate.money = 0;
            } else if (token.type === TOKEN_TYPES.STAR) {
                playerUpdate.hasDiamond = true;
                gameStarFound = true;
            } else if (token.type === TOKEN_TYPES.HORSESHOE) {
                playerUpdate.hasHorseshoe = true;
            } else {
                playerUpdate.money += value * jewelMultiplier;
            }

            const updatedPlayersFlip = [...state.players];
            updatedPlayersFlip[fpIndex] = playerUpdate;

            const nextIndexFlip = (state.currentPlayerIndex + 1) % state.players.length;
            const nextPlayerFlip = updatedPlayersFlip[nextIndexFlip];
            const flightMovesFlip = getFlightMoves(nextPlayerFlip.currentNode, nextPlayerFlip.money);

            return {
                ...state,
                tokens: newTokens,
                players: updatedPlayersFlip,
                starFound: gameStarFound,
                lastRevealedToken: { ...token, value },
                diceResult: null,
                validMoves: flightMovesFlip,
                currentPlayerIndex: nextIndexFlip,
                turnPhase: 'rolling'
            };

        case 'CLEAR_REVEAL':
            return {
                ...state,
                lastRevealedToken: null
            };

        case 'ESCAPE_TRAP':
            // Player rolls dice to try to escape trap
            const escapeDice = Math.floor(Math.random() * 6) + 1;
            const escaped = escapeDice <= 2;

            if (escaped) {
                // Freed! Check for token at current location
                const escapedPlayer = state.players[state.currentPlayerIndex];
                const locationToken = state.tokens[escapedPlayer.currentNode];
                const hasToken = locationToken && !locationToken.revealed;

                if (hasToken) {
                    // Escaped and has token to flip - stay on current player
                    return {
                        ...state,
                        diceResult: null, // Reset dice for token action
                        trappedPlayer: null,
                        turnPhase: 'action'
                    };
                } else {
                    // Escaped but no token - pass turn to next player
                    const nextIdxEscape = (state.currentPlayerIndex + 1) % state.players.length;
                    const nextPEscape = state.players[nextIdxEscape];
                    const flightMovesEscape = getFlightMoves(nextPEscape.currentNode, nextPEscape.money);

                    return {
                        ...state,
                        diceResult: null, // FIXED: Reset dice for next player
                        trappedPlayer: null,
                        validMoves: flightMovesEscape,
                        currentPlayerIndex: nextIdxEscape,
                        turnPhase: 'rolling'
                    };
                }
            } else {
                // Still trapped, end turn - pass to next player
                const nextIdxTrapped = (state.currentPlayerIndex + 1) % state.players.length;
                const nextPTrapped = state.players[nextIdxTrapped];
                const flightMovesTrapped = getFlightMoves(nextPTrapped.currentNode, nextPTrapped.money);

                return {
                    ...state,
                    diceResult: null, // FIXED: Reset dice for next player
                    validMoves: flightMovesTrapped,
                    currentPlayerIndex: nextIdxTrapped,
                    turnPhase: 'rolling'
                    // Keep trappedPlayer for when player returns
                };
            }

        case 'SYNC_STATE':
            // Replace entire state with synced data from Firebase
            return action.payload;

        case 'SET_AI_TARGET': {
            const { playerId, target } = action.payload;
            const targetPlayerIndex = state.players.findIndex(p => p.id === playerId);
            if (targetPlayerIndex === -1) return state;

            const updatedPlayersTarget = [...state.players];
            updatedPlayersTarget[targetPlayerIndex] = {
                ...updatedPlayersTarget[targetPlayerIndex],
                aiTarget: target
            };

            return {
                ...state,
                players: updatedPlayersTarget
            };
        }

        default:
            return state;
    }
}

export function GameProvider({ children, roomCode, roomPlayers, isPracticeMode }) {
    // Create initial state from room players if provided
    const createInitialState = () => {
        if (roomPlayers && Object.keys(roomPlayers).length > 0) {
            const playerEntries = Object.entries(roomPlayers);
            const startingCities = ['cairo', 'tangier'];

            const players = playerEntries.map(([id, player], index) => ({
                id: id,
                name: player.name,
                color: player.color,
                money: 300,
                currentNode: Math.random() < 0.5 ? 'cairo' : 'tangier', // Random start for everyone
                hasDiamond: false,
                hasHorseshoe: false,
                isAI: player.isAI || false, // Track AI players
                aiTarget: null
            }));

            return {
                ...initialState,
                players,
                tokens: shuffleTokens()
            };
        }
        return initialState;
    };

    const [state, dispatch] = useReducer(gameReducer, null, createInitialState);
    const isInitialized = useRef(false);
    const isLocalUpdate = useRef(false);

    // AI Turn Handler (for practice mode)
    useEffect(() => {
        if (!isPracticeMode || !state || state.gameStatus !== 'playing') return;

        const currentPlayer = state.players[state.currentPlayerIndex];
        if (!currentPlayer?.isAI) return;

        // Import and execute AI logic (with Gemini integration)
        Promise.all([
            import('../ai/aiPlayer.js'),
            import('../ai/geminiService.js')
        ]).then(([aiModule, geminiModule]) => {
            const { continueAITurn, chooseAIMove,
                analyzeGameSituation,
                getBestMoveTowards,
                shouldAbandonStrategy
            } = aiModule;
            const { getGeminiMove, isGeminiAvailable } = geminiModule;

            // Longer delay so human can follow AI moves
            const timer = setTimeout(async () => {
                // Handle different turn phases
                if (state.turnPhase === 'rolling' && state.diceResult == null) {
                    // AI needs to roll dice
                    console.log('[AI] Rolling dice...');
                    dispatch({ type: 'ROLL_DICE' });
                } else if (state.turnPhase === 'trapped') {
                    // AI tries to escape trap
                    let trapType = state.trappedPlayer ? state.trappedPlayer.trapType : 'unknown';
                    console.log(`[AI] Attempting to escape ${trapType} trap...`);
                    dispatch({ type: 'ESCAPE_TRAP' });
                } else if (state.turnPhase === 'action') {
                    // AI found a hidden token - decide to buy or roll
                    const token = state.tokens[currentPlayer.currentNode];
                    if (token && !token.revealed) {
                        if (currentPlayer.money >= 100) {
                            console.log('[AI] Buying token (has money)');
                            dispatch({
                                type: 'FLIP_TOKEN',
                                payload: { cityId: currentPlayer.currentNode, method: 'buy' }
                            });
                        } else {
                            console.log('[AI] Rolling for token (no money)');
                            dispatch({ type: 'ROLL_DICE' });
                        }
                    } else {
                        dispatch({ type: 'END_TURN' });
                    }
                } else if (state.turnPhase === 'moving' && state.diceResult != null) {
                    // AI has dice result - time to decide where to move
                    const currentToken = state.tokens[currentPlayer.currentNode];

                    // First check: Are we on a city with unrevealed token AND dice is 4/5/6?
                    if (currentToken && !currentToken.revealed && state.diceResult >= 4) {
                        console.log('[AI] Flipping token with dice:', state.diceResult);
                        dispatch({
                            type: 'FLIP_TOKEN',
                            payload: { cityId: currentPlayer.currentNode, method: 'roll' }
                        });
                    } else {
                        // AI MOVEMENT LOGIC
                        const validMoves = state.validMoves || [];
                        if (validMoves.length > 0) {
                            let bestMove = null;

                            // 1. STRATEGIC TARGETING
                            // CRITICAL: Check if strategy needs to change due to game events
                            if (currentPlayer.aiTarget) {
                                const hasStar = currentPlayer.hasDiamond;
                                const isHomeTarget = currentPlayer.aiTarget === 'cairo' || currentPlayer.aiTarget === 'tangier';

                                // FORCE RE-THINK IF:
                                // 1. We have Star but aren't going home
                                if (hasStar && !isHomeTarget) {
                                    console.log('[AI] Critical Update: Found Star! Abandoning exploration strategy.');
                                    dispatch({ type: 'SET_AI_TARGET', payload: { playerId: currentPlayer.id, target: null } });
                                    currentPlayer.aiTarget = null; // Update local ref for this turn
                                }

                                // 2. RE-EVALUATE: Is this target still smart? (Money, Distance, Opportunities)
                                if (currentPlayer.aiTarget && shouldAbandonStrategy(state, currentPlayer)) {
                                    console.log('[AI] Strategy Invalidated (Dynamic Re-evaluation).');
                                    dispatch({ type: 'SET_AI_TARGET', payload: { playerId: currentPlayer.id, target: null } });
                                    currentPlayer.aiTarget = null;
                                }
                            }

                            if (currentPlayer.aiTarget) {
                                console.log(`[AI] Following Strategy: Moving towards ${currentPlayer.aiTarget}`);
                                // Find the VALID move that gets us closest to the target
                                bestMove = getBestMoveTowards(validMoves, currentPlayer.aiTarget, state.tokens);

                                if (!bestMove) {
                                    console.log('[AI] Path blocked or reached target, clearing strategy.');
                                    dispatch({ type: 'SET_AI_TARGET', payload: { playerId: currentPlayer.id, target: null } });
                                }
                            }

                            // 2. GEMINI STRATEGY (If no move yet)
                            if (!bestMove && isGeminiAvailable()) {
                                try {
                                    const situation = analyzeGameSituation ?
                                        analyzeGameSituation(state, currentPlayer) :
                                        { unrevealedCities: [], gamePhase: 'mid', revealedTokens: 0, totalTokens: 30 };

                                    // Only ask Gemini if we don't have a valid target-based move
                                    const geminiResult = await getGeminiMove(state, currentPlayer, validMoves, situation);
                                    if (geminiResult && geminiResult.target) {
                                        console.log(`[AI/Gemini] New Strategy: Go to ${geminiResult.target} (${geminiResult.reason})`);

                                        dispatch({
                                            type: 'SET_AI_TARGET',
                                            payload: { playerId: currentPlayer.id, target: geminiResult.target }
                                        });


                                        bestMove = getBestMoveTowards(validMoves, geminiResult.target, state.tokens);
                                    }
                                } catch (error) {
                                    console.warn('[AI] Gemini failed:', error);
                                }
                            }

                            // 3. RULE-BASED FALLBACK
                            if (!bestMove) {
                                bestMove = chooseAIMove(validMoves, state, currentPlayer);
                                console.log('[AI/Rules] Using fallback logic');
                            }

                            if (bestMove) {
                                dispatch({ type: 'MOVE_PLAYER', payload: { targetNodeId: bestMove.to } });
                            } else {
                                dispatch({ type: 'END_TURN' });
                            }
                        } else {
                            dispatch({ type: 'END_TURN' });
                        }
                    }
                } else {
                    // Default - try to continue turn
                    continueAITurn(dispatch, state);
                }
            }, 2500); // Slightly longer delay for Gemini thinking

            return () => clearTimeout(timer);
        });
    }, [state, isPracticeMode]);

    // AI Long-Term Learning Trigger - DISABLED to save API traffic
    // useEffect(() => { ... });

    // Sync state to Firebase when it changes (only if we have a room, NOT practice mode)
    useEffect(() => {
        if (!roomCode || isPracticeMode || !isInitialized.current) return;
        if (isLocalUpdate.current) {
            isLocalUpdate.current = false;
            return;
        }

        // Don't sync initial state or during setup
        if (state.gameStatus === 'setup') return;

        const gameStateRef = getGameStateRef(roomCode);
        set(gameStateRef, state).catch(err => {
            console.error('Error syncing state to Firebase:', err);
        });
    }, [state, roomCode, isPracticeMode]);

    // Subscribe to Firebase state changes (NOT for practice mode)
    useEffect(() => {
        if (isPracticeMode) {
            // Practice mode - just start the game immediately
            setTimeout(() => {
                dispatch({ type: 'START_GAME' });
                isInitialized.current = true;
            }, 300);
            return;
        }

        if (!roomCode) {
            isInitialized.current = true;
            return;
        }

        const gameStateRef = getGameStateRef(roomCode);

        const unsubscribe = onValue(gameStateRef, (snapshot) => {
            const data = snapshot.val();
            if (data && isInitialized.current) {
                // Received update from another player
                isLocalUpdate.current = true;
                dispatch({ type: 'SYNC_STATE', payload: data });
            }
        });

        // Start the game after a short delay
        setTimeout(() => {
            dispatch({ type: 'START_GAME' });
            isInitialized.current = true;
        }, 500);

        return () => unsubscribe();
    }, [roomCode, isPracticeMode]);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    return useContext(GameContext);
}
