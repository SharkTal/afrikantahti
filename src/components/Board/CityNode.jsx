import React, { useState } from 'react';
import { ROUTES, TRAVEL_TYPE } from '../../constants/mapData';

// Get animal emoji based on player (for consistency across app)
// Uses player color to determine emoji since colors are assigned in join order
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

// Checker
const hasAirport = (cityId) => {
    return ROUTES.some(r => r.type === TRAVEL_TYPE.AIR && (r.from === cityId || r.to === cityId));
};

const hasSeaport = (cityId) => {
    return ROUTES.some(r => r.type === TRAVEL_TYPE.SEA && (r.from === cityId || r.to === cityId));
};

function CityNode({ city, token, players, onNodeClick, isDot, isValidMove, isAffordable, isCurrentPlayerHere, playerCanAfford, activePlayerId, moveCost }) {
    const [isHovered, setIsHovered] = useState(false);

    // Highlighting Styles
    const highlightStyle = isValidMove ? {
        boxShadow: isAffordable
            ? '0 0 10px 4px #2ecc71' // Green Glow
            : '0 0 10px 4px #e74c3c', // Red Glow (Too expensive)
        zIndex: 100 // Bring to top
    } : {};

    const isAirport = hasAirport(city.id);
    const isSeaport = hasSeaport(city.id);

    // Determine pulse class
    // Priority: Token Found (Wealthy) > Token Found (Poor) > Airport
    let pulseClass = '';

    if (isCurrentPlayerHere) {
        if (token && !token.revealed) {
            pulseClass = playerCanAfford ? 'wealth-pulse' : 'token-pulse';
        } else if (isAirport) {
            pulseClass = 'airport-pulse';
        }
    }

    if (isDot) {
        return (
            <div
                onClick={onNodeClick}
                style={{
                    position: 'absolute',
                    left: `${city.x}%`,
                    top: `${city.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    backgroundColor: city.dotType === 'sea' ? '#2980b9' : '#000', // Blue for Sea, Black for Land
                    borderRadius: '50%',
                    cursor: 'pointer',
                    zIndex: 2, // Above lines, below players
                    border: '2px solid white', // Small border to separate from grid
                    // INCREASE TOUCH TARGET
                    outline: '10px solid transparent',
                    ...highlightStyle
                }}
            >
                {/* Player Pawns on Dot */}
                {players && players.length > 0 && (
                    <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '2px', zIndex: 20 }}>
                        {players.map(p => (
                            <div
                                key={p.id}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    border: `2px solid ${p.color}`,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                    backgroundColor: p.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {getPlayerEmoji(p)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Normal City Rendering
    return (
        <div
            onClick={onNodeClick}
            style={{
                position: 'absolute',
                left: `${city.x}%`,
                top: `${city.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '40px',
                height: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                cursor: 'pointer'
            }}
        >
            {/* Hub Icons */}
            {isAirport && (
                <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '-12px',
                    fontSize: '16px',
                    zIndex: 5,
                    filter: 'drop-shadow(0 0 2px white)'
                }}>✈️</div>
            )}
            {isSeaport && !isAirport && ( // Prioritize Airport if both
                <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '-12px',
                    fontSize: '16px',
                    zIndex: 5,
                    filter: 'drop-shadow(0 0 2px white)'
                }}>⚓️</div>
            )}

            {/* City Circle */}
            <div
                className={pulseClass}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#e74c3c', // Red for game circles
                    border: '2px solid #c0392b',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transform: isHovered && isValidMove ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.15s ease-out',
                    // INCREASE TOUCH TARGET
                    outline: '8px solid transparent',
                    ...highlightStyle
                }}
                title={city.name}
            >
                {/* Cost Tooltip on Hover */}
                {isHovered && isValidMove && moveCost !== undefined && moveCost > 0 && (
                    <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: isAffordable ? '#27ae60' : '#c0392b',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        marginBottom: '4px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        zIndex: 200
                    }}>
                        ✈️ £{moveCost}
                    </div>
                )}

                {/* Free Move Tooltip */}
                {isHovered && isValidMove && (moveCost === 0 || moveCost === undefined) && (
                    <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        marginBottom: '4px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        zIndex: 200
                    }}>
                        FREE
                    </div>
                )}

                {/* Token Indicator (if hidden) */}
                {token && !token.revealed && (
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#2c3e50', // Dark back of token
                    }} />
                )}

                {/* Token Indicator (if revealed) */}
                {token && token.revealed && (
                    <div style={{
                        fontSize: '12px'
                    }}>
                        {/* Simple icon mapping */}
                        {token.type === 'star' ? '💎' :
                            token.type === 'horseshoe' ? '🐴' :
                                token.type === 'robber' ? '🦹' : '🔹'}
                    </div>
                )}
            </div>

            {/* Label - IMPROVED */}
            <div style={{
                position: 'absolute',
                top: '24px', // Below the node
                fontSize: '11px',
                fontWeight: '900', // Extra bold
                color: '#2c3e50', // Dark text
                textTransform: 'uppercase',
                // backgroundColor: 'rgba(255,255,255,0.8)', // REMOVED BOX
                // borderRadius: '4px',
                // padding: '0 2px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                textShadow: '0 0 3px #fdf6e3, 0 0 3px #fdf6e3, 0 0 3px #fdf6e3, 0 0 3px #fdf6e3', // Hard Halo in parchment color
                zIndex: 100 // Ensure text is ON TOP of lines
            }}>
                {city.name}
            </div>

            {/* Player Pawns */}
            {players && players.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '-35px', // Higher up to clear label
                    display: 'flex',
                    gap: '4px',
                    justifyContent: 'center',
                    width: '100%',
                    zIndex: 20
                }}>
                    {players.map(p => (
                        <div
                            key={p.id}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                border: `3px solid white`,
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                backgroundColor: p.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                transform: isCurrentPlayerHere && p.id === activePlayerId ? 'scale(1.2)' : 'scale(1)',
                                transition: 'transform 0.2s'
                            }}
                        >
                            {getPlayerEmoji(p)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CityNode;
