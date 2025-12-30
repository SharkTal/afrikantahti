import React from 'react';
import { useGame } from '../../context/GameContext';

const PHASE_CONFIG = {
    rolling: {
        label: '🎲 ROLL DICE',
        color: '#3498db',
        description: 'Roll the dice to move'
    },
    moving: {
        label: '🚶 MOVE',
        color: '#27ae60',
        description: 'Click a highlighted location'
    },
    action: {
        label: '🎫 FLIP TOKEN',
        color: '#f39c12',
        description: 'Click the token to reveal'
    },
    trapped: {
        label: '⛓️ TRAPPED',
        color: '#c0392b',
        description: 'Roll 1-2 to escape!'
    },
    game_over: {
        label: '🏆 GAME OVER',
        color: '#9b59b6',
        description: ''
    }
};

function TurnPhaseBanner() {
    const { state } = useGame();

    // Use moving phase if dice rolled
    let phase = state.turnPhase;
    if (state.diceResult !== null && phase === 'rolling') {
        phase = 'moving';
    }

    const config = PHASE_CONFIG[phase] || PHASE_CONFIG.rolling;
    const currentPlayer = state.players[state.currentPlayerIndex];

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
        }}>
            {/* Player Name */}
            <div style={{
                padding: '4px 16px',
                backgroundColor: currentPlayer.color,
                color: 'white',
                borderRadius: '12px 12px 0 0',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                {currentPlayer.name}'s Turn
            </div>

            {/* Phase Banner */}
            <div style={{
                padding: '8px 24px',
                backgroundColor: config.color,
                color: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                textAlign: 'center',
                animation: 'slideIn 0.3s ease-out'
            }}>
                <div style={{
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    {config.label}
                </div>
                {config.description && (
                    <div style={{
                        fontSize: '0.75rem',
                        opacity: 0.9,
                        marginTop: '2px'
                    }}>
                        {config.description}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default TurnPhaseBanner;
