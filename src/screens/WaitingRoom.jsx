import React from 'react';
import { useRoom } from '../context/RoomContext';

function WaitingRoom() {
    const {
        roomCode,
        players,
        playerId,
        isHost,
        toggleReady,
        startGame,
        leaveRoom,
        error
    } = useRoom();

    const playerList = Object.entries(players);
    const playerCount = playerList.length;
    const allReady = playerList.length >= 2 && playerList.every(([_, p]) => p.ready);
    const myPlayer = players[playerId];

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        alert('Room code copied!');
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
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>
                {/* Room Code Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <p style={{ color: '#7f8c8d', marginBottom: '0.5rem' }}>Room Code</p>
                    <div
                        onClick={copyRoomCode}
                        style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            letterSpacing: '8px',
                            color: '#2c3e50',
                            cursor: 'pointer',
                            padding: '10px 20px',
                            backgroundColor: '#ecf0f1',
                            borderRadius: '10px',
                            display: 'inline-block'
                        }}
                        title="Click to copy"
                    >
                        {roomCode}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#95a5a6', marginTop: '0.5rem' }}>
                        Click to copy • Share with friends
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

                {/* Player List */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
                        Players ({playerCount}/7)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {playerList.map(([id, player]) => (
                            <div
                                key={id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    backgroundColor: id === playerId ? '#e8f5e9' : '#f5f5f5',
                                    borderRadius: '10px',
                                    border: id === playerId ? '2px solid #27ae60' : '2px solid transparent'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        backgroundColor: player.color,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} />
                                    <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                        {player.name}
                                        {players[Object.keys(players)[0]] === player && ' 👑'}
                                        {id === playerId && ' (You)'}
                                    </span>
                                </div>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    backgroundColor: player.ready ? '#27ae60' : '#e74c3c',
                                    color: 'white'
                                }}>
                                    {player.ready ? '✓ Ready' : 'Not Ready'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {/* Ready Button */}
                    <button
                        onClick={toggleReady}
                        style={{
                            padding: '1rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            backgroundColor: myPlayer?.ready ? '#e74c3c' : '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        {myPlayer?.ready ? '❌ Cancel Ready' : '✓ Ready Up'}
                    </button>

                    {/* Start Button (Host Only) */}
                    {isHost && (
                        <button
                            onClick={startGame}
                            disabled={!allReady}
                            style={{
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                backgroundColor: allReady ? '#f39c12' : '#bdc3c7',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: allReady ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {allReady ? '🚀 Start Game' : `Waiting for players (${playerCount < 2 ? 'need 2+' : 'not ready'})`}
                        </button>
                    )}

                    {/* Leave Button */}
                    <button
                        onClick={leaveRoom}
                        style={{
                            padding: '0.8rem',
                            fontSize: '0.9rem',
                            backgroundColor: 'transparent',
                            color: '#e74c3c',
                            border: '2px solid #e74c3c',
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        Leave Room
                    </button>
                </div>

                {/* Waiting Message */}
                {!isHost && !allReady && (
                    <p style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        color: '#7f8c8d',
                        fontStyle: 'italic'
                    }}>
                        Waiting for host to start the game...
                    </p>
                )}
            </div>
        </div>
    );
}

export default WaitingRoom;
