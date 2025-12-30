import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useGame } from '../../context/GameContext';

// Unicode dice faces
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function TrapModal() {
    const { state, dispatch } = useGame();
    const { playerId, isPracticeMode } = useRoom();
    const [isRolling, setIsRolling] = useState(false);
    const [lastRoll, setLastRoll] = useState(null);

    const currentPlayer = state.players[state.currentPlayerIndex];

    if (state.turnPhase !== 'trapped' || !state.trappedPlayer) return null;
    if (currentPlayer.isAI) return null; // Don't show modal for AI players

    // Permission Check
    const isMyTurn = isPracticeMode
        ? true // In practice mode, local user is always the human player
        : (String(currentPlayer.id) === String(playerId));

    // If not my turn, maybe incorrectly shown? Or we want to show spectator view?
    // User complaint: "any player can roll".
    // If we just disable the button, that solves it.

    const trapType = state.trappedPlayer.trapType;

    const trapInfo = {
        pirates: {
            emoji: '🏴‍☠️',
            title: 'Pirates!',
            message: 'The pirates of St. Helena have captured you!',
            color: '#2c3e50'
        },
        bedouins: {
            emoji: '🐪',
            title: 'Bedouins!',
            message: 'The Sahara bedouins have surrounded you!',
            color: '#d35400'
        }
    };

    const info = trapInfo[trapType] || trapInfo.pirates;

    const handleEscapeRoll = () => {
        setIsRolling(true);
        setTimeout(() => {
            dispatch({ type: 'ESCAPE_TRAP' });
            setLastRoll(state.diceResult);
            setIsRolling(false);
        }, 1000);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%',
                border: `5px solid ${info.color}`
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
                    {info.emoji}
                </div>

                <h2 style={{ margin: '0 0 0.5rem', color: info.color, fontSize: '1.8rem' }}>
                    {info.title}
                </h2>

                <p style={{ fontSize: '1.1rem', color: '#7f8c8d', marginBottom: '1.5rem' }}>
                    {info.message}
                    <br />
                    <strong>Roll 1 or 2 to escape!</strong>
                </p>

                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    minHeight: '70px'
                }}>
                    {isRolling ? (
                        <span className="dice-rolling">🎲</span>
                    ) : (
                        '🎲'
                    )}
                </div>

                {isMyTurn ? (
                    <button
                        onClick={handleEscapeRoll}
                        disabled={isRolling}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1.2rem',
                            backgroundColor: isRolling ? '#bdc3c7' : info.color,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isRolling ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        {isRolling ? 'Rolling...' : 'Roll to Escape!'}
                    </button>
                ) : (
                    <div style={{
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        backgroundColor: '#95a5a6',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: 'bold'
                    }}>
                        Waiting for {currentPlayer.name}...
                    </div>
                )}

                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#95a5a6' }}>
                    {currentPlayer.name}'s turn
                </p>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}

export default TrapModal;
