import React, { useEffect, useState } from 'react';
import { CITIES, ROUTES, TRAVEL_TYPE, expandMapGraph } from '../../constants/mapData';
import CityNode from './CityNode';
import PathLine from './PathLine';
import { useGame } from '../../context/GameContext';
import africaMap from '../../assets/africa_map.png';

// Get expanded nodes for rendering dots
const { nodes: ALL_NODES } = expandMapGraph();

// Map aspect ratio (roughly Africa shape)
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 1350;

function Board() {
    const { state, dispatch } = useGame();

    // Start game on mount if setup
    useEffect(() => {
        if (state.gameStatus === 'setup') {
            dispatch({ type: 'START_GAME' });
        }
    }, []);

    const currentPlayer = state.players[state.currentPlayerIndex];

    const handleCityClick = (cityId) => {
        const currentPlayer = state.players[state.currentPlayerIndex];

        // Prevent interaction if it's not player's turn (or phase is handled globally)
        // Actually custom modals might handle 'action' phase, so ignore clicks then?
        if (state.turnPhase === 'action') return;

        // If clicking a different node -> Move
        if (currentPlayer.currentNode !== cityId) {
            dispatch({ type: 'MOVE_PLAYER', payload: { targetNodeId: cityId } });
            return;
        }

        // If clicking CURRENT node -> Token Interaction
        const token = state.tokens[cityId];
        if (token && !token.revealed) {
            // SCENARIO 1: Player has Rolled Dice (trying to open with dice)
            if (state.diceResult !== null) {
                // Rule: "On a 4, 5 or 6, the token is won."
                // Just dispatch. The Reducer handles the >= 4 check and Game Over/Turn End.
                dispatch({ type: 'FLIP_TOKEN', payload: { cityId, method: 'roll' } });
                return;
            }

            // SCENARIO 2: Player has NOT Rolled (Start of Turn - Buying)
            // Only offer buy if they have money.
            if (currentPlayer.money >= 100) {
                if (window.confirm(`Buy token for £100? (Balance: £${currentPlayer.money})`)) {
                    dispatch({ type: 'FLIP_TOKEN', payload: { cityId, method: 'buy' } });
                }
            } else {
                // No Money, No Dice.
                // Tell them what to do.
                alert("You have no money! Roll the dice to try to win the token (needs 4, 5, or 6).");
            }
        }
    };

    return (
        <div
            className="board-container"
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: `${MAP_WIDTH}px`,
                aspectRatio: `${MAP_WIDTH}/${MAP_HEIGHT}`,
                backgroundImage: `url(${africaMap})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                border: '8px solid #2c3e50',
                borderRadius: '4px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                overflow: 'hidden'
            }}
        >
            {/* SVG Layer for Paths */}
            {/* Note: We render ORIGINAL routes for lines, or EXPANDED?
                Original routes draw full lines. Dots sit on top.
                This is cleaner than drawing mini-lines.
            */}
            <svg
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                viewBox={`0 0 100 100`}
                preserveAspectRatio="none"
            >
                {ROUTES.map((route, index) => {
                    const start = CITIES[route.from];
                    const end = CITIES[route.to];
                    if (!start || !end) return null; // Safety check
                    return (
                        <PathLine
                            key={`${route.from}-${route.to}-${index}`}
                            x1={start.x} y1={start.y}
                            x2={end.x} y2={end.y}
                            type={route.type}
                            curve={route.curve}
                        />
                    );
                })}
            </svg>

            {/* Nodes Layer (Cities + Dots) */}
            {Object.values(ALL_NODES).map(node => {
                // Safety check for validMoves (may be undefined from Firebase sync)
                const validMoves = state.validMoves || [];
                const move = validMoves.find(m => m.to === node.id);
                const isValidMove = !!move;
                const isAffordable = move && move.canAfford;

                const currentPlayer = state.players[state.currentPlayerIndex];
                const isCurrentPlayerHere = currentPlayer.currentNode === node.id;

                return (
                    <CityNode
                        key={node.id}
                        city={node}
                        token={state.tokens[node.id]}
                        players={state.players.filter(p => p.currentNode === node.id)}
                        onNodeClick={() => handleCityClick(node.id)}
                        showLabel={node.type !== 'dot'}
                        isDot={node.type === 'dot'}
                        isValidMove={isValidMove}
                        isAffordable={isAffordable}
                        isCurrentPlayerHere={isCurrentPlayerHere}
                        playerCanAfford={currentPlayer.money >= 100}
                        activePlayerId={currentPlayer.id}
                        moveCost={move ? move.cost : undefined}
                    />
                );
            })}
        </div>
    );
}

export default Board;
