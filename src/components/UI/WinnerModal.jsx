import React from 'react';
import { useGame } from '../../context/GameContext';

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

function WinnerModal() {
    const { state } = useGame();
    const { winner, winReason, gameStatus } = state;

    if (gameStatus !== 'finished' || !winner) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <style>
                {`
                    @keyframes popIn {
                        0% { transform: scale(0.5); opacity: 0; }
                        80% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes float {
                        0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(-100px) rotate(20deg); opacity: 0; }
                    }
                    @keyframes glow {
                        0% { box-shadow: 0 0 20px #f1c40f; }
                        50% { box-shadow: 0 0 50px #f1c40f, 0 0 20px #e67e22; }
                        100% { box-shadow: 0 0 20px #f1c40f; }
                    }
                    .emoji-float {
                        position: absolute;
                        font-size: 2rem;
                        animation: float 2s ease-out forwards;
                    }
                `}
            </style>

            {/* Floating Emojis (Simple implementation) */}
            {[...Array(20)].map((_, i) => (
                <div key={i} className="emoji-float" style={{
                    top: `${50 + Math.random() * 20}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    fontSize: `${1.5 + Math.random()}rem`
                }}>
                    {['👏', '🎉', '💎', '🏆', '⭐'][Math.floor(Math.random() * 5)]}
                </div>
            ))
            }

            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '20px',
                textAlign: 'center',
                maxWidth: '500px',
                width: '90%',
                animation: 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                border: `5px solid ${winner.color}`,
                boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#f1c40f',
                    textShadow: '2px 2px 0 #d35400, 4px 4px 0 rgba(0,0,0,0.2)',
                    marginBottom: '1.5rem',
                    letterSpacing: '2px'
                }}>
                    CONGRATULATIONS!
                </div>

                <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    border: `6px solid ${winner.color}`,
                    margin: '0 auto 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'glow 2s infinite',
                    backgroundColor: '#fff',
                    fontSize: '5rem'
                }}>
                    {getPlayerEmoji(winner)}
                </div>

                <h2 style={{ fontSize: '2rem', color: '#2c3e50', margin: '0 0 0.5rem' }}>
                    {winner.name} WINS!
                </h2>

                <p style={{ fontSize: '1.2rem', color: '#7f8c8d', fontStyle: 'italic', marginBottom: '2rem' }}>
                    {winReason}
                </p>

                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '1rem 2.5rem',
                        fontSize: '1.2rem',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 15px rgba(46, 204, 113, 0.4)',
                        transition: 'transform 0.2s',
                        fontWeight: 'bold'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    Play Again 🔄
                </button>
            </div>
        </div >
    );
}

export default WinnerModal;
