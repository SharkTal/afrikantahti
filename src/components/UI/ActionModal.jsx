import React from 'react';
import { useGame } from '../../context/GameContext';
import { useRoom } from '../../context/RoomContext';
import { CITIES } from '../../constants/mapData';

function ActionModal() {
    const { state, dispatch } = useGame();
    const { playerId, isPracticeMode } = useRoom();
    const { turnPhase, players, currentPlayerIndex } = state;

    // Only show if in 'action' phase
    if (turnPhase !== 'action') return null;

    const currentPlayer = players[currentPlayerIndex];
    const cityId = currentPlayer.currentNode;
    const city = CITIES[cityId];
    const cityName = city ? city.name : cityId;

    // Determine if it's MY turn
    const isMyTurn = isPracticeMode
        ? !currentPlayer.isAI
        : (String(currentPlayer.id) === String(playerId));

    const canAfford = currentPlayer.money >= 100;

    const handleBuy = () => {
        if (!isMyTurn) return; // Prevent action if not my turn
        dispatch({
            type: 'FLIP_TOKEN',
            payload: { cityId, method: 'buy' }
        });
    };

    const handleEndTurn = () => {
        if (!isMyTurn) return; // Prevent action if not my turn
        dispatch({ type: 'END_TURN' });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                backgroundColor: isMyTurn ? 'white' : '#f0f0f0',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%',
                border: `4px solid ${currentPlayer.color}`
            }}>
                <h2 style={{ margin: '0 0 1rem', color: '#2c3e50' }}>
                    {isMyTurn ? 'Hidden Token Found!' : `${currentPlayer.name}'s Decision`}
                </h2>

                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#7f8c8d' }}>
                    {isMyTurn ? (
                        <>
                            You arrived at <strong>{cityName}</strong>.
                            <br />
                            A token is hidden here.
                        </>
                    ) : (
                        <>
                            Waiting for <strong>{currentPlayer.name}</strong> to decide...
                            <br />
                            They found a hidden token at <strong>{cityName}</strong>.
                        </>
                    )}
                </p>

                {isMyTurn ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            onClick={handleBuy}
                            disabled={!canAfford}
                            style={{
                                padding: '1rem',
                                fontSize: '1.2rem',
                                backgroundColor: canAfford ? '#2ecc71' : '#bdc3c7',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: canAfford ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 4px 0 rgba(0,0,0,0.1)'
                            }}
                        >
                            <span>Buy Token</span>
                            <strong>£100</strong>
                        </button>

                        <button
                            onClick={handleEndTurn}
                            style={{
                                padding: '0.8rem',
                                fontSize: '1rem',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginTop: '0.5rem'
                            }}
                        >
                            End Turn (Skip)
                        </button>
                    </div>
                ) : (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#95a5a6',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '1rem'
                    }}>
                        ⏳ Waiting for {currentPlayer.name}...
                    </div>
                )}

                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#95a5a6' }}>
                    {isMyTurn ? (
                        <>Your Balance: <strong>£{currentPlayer.money}</strong></>
                    ) : (
                        <>{currentPlayer.name}'s Balance: <strong>£{currentPlayer.money}</strong></>
                    )}
                </p>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}

export default ActionModal;

