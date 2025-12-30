import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRoom } from '../../context/RoomContext';

// Color to emoji mapping (same as CityNode for consistency)
const PLAYER_COLOR_TO_INDEX = {
    '#e74c3c': 0, // Red - Lion
    '#3498db': 1, // Blue - Elephant
    '#27ae60': 2, // Green - Giraffe
    '#f39c12': 3, // Orange - Zebra
    '#9b59b6': 4, // Purple - Rhino
    '#1abc9c': 5, // Teal - Hippo
    '#e91e63': 6, // Pink - Leopard
};

const getPlayerEmoji = (player) => {
    if (player.isAI) return '🤖';
    const emojis = ['🦁', '🐘', '🦒', '🦓', '🦏', '🦛', '🐆'];
    const index = PLAYER_COLOR_TO_INDEX[player.color] ?? 0;
    return emojis[index % emojis.length];
};

function ControlPanel() {
    const { state, dispatch } = useGame();
    const { playerId, isPracticeMode } = useRoom();
    const [isRolling, setIsRolling] = useState(false);

    const currentPlayer = state.players[state.currentPlayerIndex];
    const playerAvatar = getPlayerEmoji(currentPlayer);

    // Determine if it's MY turn
    // In practice mode, it's always human's turn when not AI's turn
    // In multiplayer, check if currentPlayer.id matches my playerId
    // Use String() comparison to handle potential type mismatches
    const isMyTurn = isPracticeMode
        ? !currentPlayer.isAI
        : (String(currentPlayer.id) === String(playerId));

    // Debug logging (can be removed in production)
    console.log('[ControlPanel] Debug:', {
        currentPlayerId: currentPlayer.id,
        myPlayerId: playerId,
        isPracticeMode,
        isMyTurn,
        diceResult: state.diceResult,
        turnPhase: state.turnPhase
    });

    const handleRollDice = () => {
        if (!isMyTurn) return; // Prevent rolling if not my turn
        setIsRolling(true);
        setTimeout(() => {
            dispatch({ type: 'ROLL_DICE' });
            setIsRolling(false);
        }, 1000);
    };

    const handleEndTurn = () => {
        if (!isMyTurn) return; // Prevent ending turn if not my turn
        dispatch({ type: 'END_TURN' });
    };

    return (
        <div
            className="control-panel"
            style={{
                border: `3px solid ${currentPlayer.color}`
            }}
        >
            {/* Player Info */}
            <div className="cp-player-info">
                <div
                    className="cp-player-avatar"
                    style={{ backgroundColor: currentPlayer.color }}
                >
                    {playerAvatar}
                </div>
                <h2 className="cp-player-name" style={{ color: currentPlayer.color }}>{currentPlayer.name}</h2>
                <div className="cp-player-money-label">💰 £{currentPlayer.money}</div>
                <div className="cp-mobile-money">£{currentPlayer.money}</div>
            </div>

            {/* DICE - LARGE AND VISUAL */}
            <div className="cp-dice-container">
                <div className="cp-dice-box">
                    {isRolling ? (
                        <div style={{
                            fontSize: '3.5rem',
                            animation: 'spin 0.3s linear infinite'
                        }}>🎲</div>
                    ) : (state.diceResult != null && typeof state.diceResult === 'number') ? (
                        <>
                            {/* Large dice number - always visible */}
                            <div className="cp-dice-value">
                                {state.diceResult}
                            </div>
                            <div className="cp-dice-label">
                                Rolled: {state.diceResult}
                            </div>
                        </>
                    ) : (
                        <div style={{
                            fontSize: '3rem',
                            opacity: 0.5
                        }}>🎲</div>
                    )}
                </div>

                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>

            {/* Buttons */}
            <div>
                {isMyTurn ? (
                    // MY TURN - Show action buttons
                    // Check for falsy diceResult (null, undefined, 0) except 0 is valid
                    (state.diceResult == null && !isRolling) ? (
                        <button
                            onClick={handleRollDice}
                            style={{
                                padding: '0.7rem 1rem',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                width: '100%',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                            }}
                        >
                            🎲 Roll Dice
                        </button>
                    ) : (
                        <button
                            onClick={handleEndTurn}
                            style={{
                                padding: '0.7rem 1rem',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                width: '100%',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                            }}
                        >
                            End Turn
                        </button>
                    )
                ) : (
                    // NOT MY TURN - Show waiting message
                    <div style={{
                        padding: '0.7rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        backgroundColor: '#95a5a6',
                        color: 'white',
                        borderRadius: '8px',
                        textAlign: 'center',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                    }}>
                        ⏳ {currentPlayer.name}'s turn
                    </div>
                )}
            </div>

            {/* Status Message */}
            <div className="cp-status">
                {state.gameStatus === 'finished' && (
                    <div style={{ color: 'green', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        🎉 WINNER! 🎉
                        <button onClick={() => window.location.reload()} style={{ display: 'block', margin: '0.5rem auto', padding: '0.5rem 1rem', backgroundColor: '#2ecc71', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Play Again</button>
                    </div>
                )}
                {state.gameStatus === 'playing' && !state.diceResult && <p>Roll to move!</p>}
                {state.gameStatus === 'playing' && state.diceResult && <p>Move or flip token</p>}
            </div>
        </div>
    );
}

export default ControlPanel;
