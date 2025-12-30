import React from 'react';

// Animal emoji avatars for players
const PLAYER_EMOJIS = {
    'human': '🦁',
    'ai': '🤖',
    1: '🦁',
    2: '🐘',
    3: '🦒',
    4: '🦓',
    5: '🦏',
    6: '🦛',
    7: '🐆'
};

// Get avatar for a player (emoji-based for reliability)
function getPlayerAvatar(playerId, playerIndex) {
    // Check for specific ID first
    if (PLAYER_EMOJIS[playerId]) {
        return PLAYER_EMOJIS[playerId];
    }
    // Fallback to index-based emoji
    const emojis = ['🦁', '🐘', '🦒', '🦓', '🦏', '🦛', '🐆'];
    return emojis[playerIndex % emojis.length] || '🎮';
}

function PlayerSidebar({ player, currentPlayerId, compact, playerIndex = 0 }) {
    const isTurn = player.id === currentPlayerId;
    const avatar = getPlayerAvatar(player.id, playerIndex);
    const isAI = player.isAI || player.id === 'ai';

    if (compact) {
        return (
            <div className={`player-sidebar compact ${isTurn ? 'active-turn' : ''}`} style={{
                backgroundColor: isTurn ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(5px)',
                padding: '12px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isTurn ? '0 0 20px #f1c40f, 0 0 40px rgba(241, 196, 15, 0.5)' : '0 4px 12px rgba(0,0,0,0.15)',
                border: isTurn ? `3px solid ${player.color}` : '2px solid rgba(255,255,255,0.4)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isTurn ? 'scale(1.08)' : 'scale(1)',
                minWidth: '100px',
                position: 'relative',
                zIndex: isTurn ? 10 : 1
            }}>
                {/* Avatar Circle */}
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    backgroundColor: player.color,
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    position: 'relative'
                }}>
                    {avatar}
                    {/* AI Badge */}
                    {isAI && (
                        <div style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            backgroundColor: '#3498db',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            border: '2px solid white'
                        }}>
                            🤖
                        </div>
                    )}
                </div>

                {/* Name */}
                <div style={{
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    color: isTurn ? '#2c3e50' : '#fff',
                    textShadow: isTurn ? 'none' : '0 2px 4px rgba(0,0,0,0.6)',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {player.name}
                </div>

                {/* Money Badge */}
                <div style={{
                    background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                    color: 'white',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 6px rgba(39, 174, 96, 0.4)'
                }}>
                    £{player.money}
                </div>

                {/* Status Icons */}
                {(player.hasDiamond || player.hasHorseshoe) && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {player.hasDiamond && <span title="Has Star" style={{ fontSize: '1.1rem' }}>⭐</span>}
                        {player.hasHorseshoe && <span title="Has Horseshoe" style={{ fontSize: '1.1rem' }}>🐴</span>}
                    </div>
                )}

                {/* Turn Indicator */}
                {isTurn && (
                    <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 6px rgba(231, 76, 60, 0.5)'
                    }}>
                        YOUR TURN
                    </div>
                )}
            </div>
        );
    }

    // Full sidebar version (not commonly used now)
    return (
        <div className={`player-sidebar ${isTurn ? 'active-turn' : ''}`} style={{
            width: '180px',
            backgroundColor: '#f4e4bc',
            border: `4px solid ${player.color}`,
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            opacity: isTurn ? 1 : 0.7,
            transform: isTurn ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.3s ease',
            boxShadow: isTurn ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                textAlign: 'center',
                borderBottom: '2px solid #ccc',
                paddingBottom: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <div style={{ fontSize: '2.5rem' }}>{avatar}</div>
                <div style={{ fontSize: '1.1rem', color: player.color, fontWeight: 'bold' }}>{player.name}</div>
                {isTurn && <div style={{ fontSize: '0.75rem', color: '#e74c3c', fontWeight: 'bold' }}>YOUR TURN</div>}
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                💰 £{player.money}
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: player.hasDiamond ? 1 : 0.3
            }}>
                ⭐ Star Found
            </div>
        </div>
    );
}

export default PlayerSidebar;
