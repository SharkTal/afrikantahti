import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { TOKEN_TYPES } from '../../constants/tokens';
import { playSuccessSound, playFailureSound } from '../../utils/sound';

function TokenReveal() {
    const { state, dispatch } = useGame();
    const token = state.lastRevealedToken;

    const isBad = token?.type === TOKEN_TYPES.ROBBER;
    const isJackpot = token?.type === TOKEN_TYPES.STAR;

    useEffect(() => {
        if (token) {
            // Play Sound
            if (isBad) {
                playFailureSound();
            } else {
                playSuccessSound();
            }

            // Auto-dismiss after 4 seconds
            const timer = setTimeout(() => {
                dispatch({ type: 'CLEAR_REVEAL' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [token, dispatch, isBad]);

    if (!token) return null;

    const handleClose = () => {
        dispatch({ type: 'CLEAR_REVEAL' });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            animation: 'fadeIn 0.3s ease-out'
        }} onClick={handleClose}>

            {/* Confetti / Flowers for Good Tokens */}
            {!isBad && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${Math.random() * 100}%`,
                            top: `-10%`,
                            fontSize: '2rem',
                            animation: `fall ${2 + Math.random() * 2}s linear infinite`,
                            animationDelay: `${Math.random() * 2}s`
                        }}>
                            {['🌸', '🌺', '🌹', '✨', '💎'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            {/* Content */}
            <div style={{
                textAlign: 'center',
                transform: 'scale(1.5)',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{ fontSize: '8rem', marginBottom: '1rem' }}>
                    {isBad ? '😢' : isJackpot ? '💎' : '🎉'}
                </div>

                <h2 style={{ fontSize: '3rem', margin: '0 0 1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {isBad ? 'OH NO!' : isJackpot ? 'JACKPOT!' : 'GREAT FIND!'}
                </h2>

                <p style={{ fontSize: '1.5rem', margin: 0 }}>
                    {isBad
                        ? "It's a Robber! You lost all your money."
                        : `You found a ${token.type.toUpperCase()}!`
                    }
                </p>

                {!isBad && token.value > 0 && (
                    <p style={{ fontSize: '2rem', color: '#f1c40f', fontWeight: 'bold', marginTop: '10px' }}>
                        +£{token.value}
                    </p>
                )}

                <div style={{ marginTop: '2rem', fontSize: '1rem', opacity: 0.7 }}>
                    (Click anywhere to close)
                </div>
            </div>

            <style>{`
                @keyframes fall {
                    to { transform: translateY(110vh) rotate(360deg); }
                }
                @keyframes popIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1.5); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default TokenReveal;
