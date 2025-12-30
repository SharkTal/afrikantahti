import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';

function LobbyScreen() {
    const { createRoom, joinRoom, quickPlay, startPracticeMode, availableRooms, error, setError } = useRoom();
    const [mode, setMode] = useState(null); // null | 'create' | 'join'
    const [playerName, setPlayerName] = useState('');
    const [roomCodeInput, setRoomCodeInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePractice = () => {
        if (!playerName.trim()) {
            setError('Please enter your name first');
            return;
        }
        startPracticeMode(playerName.trim());
    };

    const handleQuickPlay = async () => {
        if (!playerName.trim()) {
            setError('Please enter your name first');
            return;
        }
        setIsLoading(true);
        try {
            await quickPlay(playerName.trim());
        } catch (err) {
            // Error handled in context
        }
        setIsLoading(false);
    };

    const handleCreate = async () => {
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }
        setIsLoading(true);
        try {
            await createRoom(playerName.trim());
        } catch (err) {
            // Error handled in context
        }
        setIsLoading(false);
    };

    const handleJoin = async (code) => {
        if (!playerName.trim()) {
            setError('Please enter your name first');
            return;
        }
        setIsLoading(true);
        try {
            await joinRoom(code || roomCodeInput.trim(), playerName.trim());
        } catch (err) {
            // Error handled in context
        }
        setIsLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                {/* Title */}
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(45deg, #e74c3c, #f39c12)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ⭐ Afrikan Tähti
                    </h1>
                    <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                        The Star of Africa
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: '#c00',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Name Input - Always visible */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={15}
                        style={{
                            padding: '1rem',
                            fontSize: '1.1rem',
                            border: '2px solid #ddd',
                            borderRadius: '10px',
                            textAlign: 'center',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Practice Mode Button */}
                <button
                    onClick={handlePractice}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #9b59b6, #8e44ad)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        width: '100%',
                        marginBottom: '0.8rem',
                        boxShadow: '0 4px 15px rgba(155, 89, 182, 0.4)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'}
                >
                    🤖 PRACTICE vs AI
                </button>

                {/* Quick Play Button */}
                <button
                    onClick={handleQuickPlay}
                    disabled={isLoading}
                    style={{
                        padding: '1.2rem 2rem',
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #f39c12, #e74c3c)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        width: '100%',
                        marginBottom: '1.5rem',
                        boxShadow: '0 4px 15px rgba(243, 156, 18, 0.4)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => !isLoading && (e.target.style.transform = 'scale(1.02)')}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'}
                >
                    ⚡ QUICK PLAY
                </button>

                {/* Available Rooms */}
                {availableRooms.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            color: '#2c3e50',
                            marginBottom: '0.8rem',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            🎮 Available Rooms ({availableRooms.length})
                        </h3>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {availableRooms.map(room => (
                                <div
                                    key={room.code}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 15px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef'
                                    }}
                                >
                                    <div>
                                        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                            {room.hostName}'s Game
                                        </span>
                                        <span style={{
                                            marginLeft: '8px',
                                            fontSize: '0.85rem',
                                            color: '#7f8c8d'
                                        }}>
                                            {room.playerCount}/7 players
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleJoin(room.code)}
                                        disabled={isLoading}
                                        style={{
                                            padding: '6px 16px',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            backgroundColor: '#27ae60',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: isLoading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Join
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    margin: '1.5rem 0',
                    color: '#bdc3c7'
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
                    <span>OR</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
                </div>

                {/* Create / Join Options */}
                {!mode && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setMode('create')}
                            style={{
                                flex: 1,
                                padding: '0.8rem',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            🔑 Create Private
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            style={{
                                flex: 1,
                                padding: '0.8rem',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                backgroundColor: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            🚪 Join by Code
                        </button>
                    </div>
                )}

                {/* Create Private Room */}
                {mode === 'create' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <button
                            onClick={handleCreate}
                            disabled={isLoading}
                            style={{
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                backgroundColor: isLoading ? '#95a5a6' : '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading ? 'Creating...' : '✨ Create Private Room'}
                        </button>
                        <button
                            onClick={() => { setMode(null); setError(null); }}
                            style={{
                                padding: '0.5rem',
                                fontSize: '0.9rem',
                                backgroundColor: 'transparent',
                                color: '#7f8c8d',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            ← Back
                        </button>
                    </div>
                )}

                {/* Join by Code */}
                {mode === 'join' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <input
                            type="text"
                            placeholder="Room Code (e.g. ABC123)"
                            value={roomCodeInput}
                            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                            maxLength={6}
                            style={{
                                padding: '1rem',
                                fontSize: '1.3rem',
                                fontWeight: 'bold',
                                letterSpacing: '4px',
                                border: '2px solid #ddd',
                                borderRadius: '10px',
                                textAlign: 'center',
                                textTransform: 'uppercase'
                            }}
                        />
                        <button
                            onClick={() => handleJoin()}
                            disabled={isLoading}
                            style={{
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                backgroundColor: isLoading ? '#95a5a6' : '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading ? 'Joining...' : '🚀 Join Room'}
                        </button>
                        <button
                            onClick={() => { setMode(null); setError(null); }}
                            style={{
                                padding: '0.5rem',
                                fontSize: '0.9rem',
                                backgroundColor: 'transparent',
                                color: '#7f8c8d',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            ← Back
                        </button>
                    </div>
                )}

                {/* Footer */}
                <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#bdc3c7', textAlign: 'center' }}>
                    2-7 players • Online multiplayer
                </p>
            </div>
        </div>
    );
}

export default LobbyScreen;
