import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    database,
    ref,
    set,
    get,
    onValue,
    update,
    remove,
    onDisconnect,
    getPlayerId,
    generateRoomCode,
    getRoomRef,
    getPlayersRef
} from '../firebase';

const RoomContext = createContext();

// Player colors for up to 7 players
const PLAYER_COLORS = [
    '#e74c3c', // Red
    '#3498db', // Blue
    '#27ae60', // Green
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#e91e63', // Pink
];

const PLAYER_NAMES = [
    'Lion', 'Elephant', 'Giraffe', 'Zebra', 'Rhino', 'Hippo', 'Leopard'
];

export function RoomProvider({ children }) {
    const [roomCode, setRoomCode] = useState(null);
    const [roomData, setRoomData] = useState(null);
    const [playerId] = useState(getPlayerId());
    const [playerName, setPlayerName] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [isPracticeMode, setIsPracticeMode] = useState(false);

    // Subscribe to available public rooms
    useEffect(() => {
        const roomsRef = ref(database, 'rooms');
        const unsubscribe = onValue(roomsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const rooms = Object.entries(data)
                    .filter(([_, room]) => {
                        // Only show waiting rooms with space
                        const playerCount = Object.keys(room.players || {}).length;
                        return room.meta?.status === 'waiting' && playerCount < 7;
                    })
                    .map(([code, room]) => ({
                        code,
                        playerCount: Object.keys(room.players || {}).length,
                        maxPlayers: room.meta?.maxPlayers || 7,
                        hostName: Object.values(room.players || {})[0]?.name || 'Unknown',
                        createdAt: room.meta?.createdAt
                    }))
                    .sort((a, b) => b.createdAt - a.createdAt) // Newest first
                    .slice(0, 10); // Show max 10 rooms
                setAvailableRooms(rooms);
            } else {
                setAvailableRooms([]);
            }
        });

        return () => unsubscribe();
    }, []);

    // Subscribe to room changes
    useEffect(() => {
        if (!roomCode) return;

        const roomRef = getRoomRef(roomCode);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setRoomData(data);
                setIsConnected(true);
            } else {
                // Room was deleted
                setRoomData(null);
                setRoomCode(null);
                setIsConnected(false);
            }
        }, (err) => {
            setError(err.message);
            setIsConnected(false);
        });

        return () => unsubscribe();
    }, [roomCode]);

    // Create a new room
    const createRoom = useCallback(async (hostName) => {
        try {
            setError(null);
            const code = generateRoomCode();
            const roomRef = getRoomRef(code);

            const initialRoom = {
                meta: {
                    hostId: playerId,
                    createdAt: Date.now(),
                    status: 'waiting', // waiting | playing | finished
                    maxPlayers: 7
                },
                players: {
                    [playerId]: {
                        name: hostName || PLAYER_NAMES[0],
                        color: PLAYER_COLORS[0],
                        ready: false,
                        joinedAt: Date.now()
                    }
                }
            };

            await set(roomRef, initialRoom);

            // Set up disconnect handler
            const playerRef = ref(database, `rooms/${code}/players/${playerId}`);
            onDisconnect(playerRef).remove();

            setRoomCode(code);
            setPlayerName(hostName || PLAYER_NAMES[0]);
            setIsHost(true);

            return code;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [playerId]);

    // Join an existing room
    const joinRoom = useCallback(async (code, guestName) => {
        try {
            setError(null);
            const upperCode = code.toUpperCase().trim();
            const roomRef = getRoomRef(upperCode);

            // Check if room exists
            const snapshot = await get(roomRef);
            if (!snapshot.exists()) {
                throw new Error('Room not found');
            }

            const roomData = snapshot.val();

            // Check if game already started
            if (roomData.meta.status !== 'waiting') {
                throw new Error('Game already in progress');
            }

            // Check player count
            const playerCount = Object.keys(roomData.players || {}).length;
            if (playerCount >= 7) {
                throw new Error('Room is full (max 7 players)');
            }

            // Assign color based on position
            const usedColors = Object.values(roomData.players || {}).map(p => p.color);
            const availableColor = PLAYER_COLORS.find(c => !usedColors.includes(c)) || PLAYER_COLORS[playerCount];
            const defaultName = PLAYER_NAMES[playerCount] || `Player ${playerCount + 1}`;

            // Add player to room
            const playerRef = ref(database, `rooms/${upperCode}/players/${playerId}`);
            await set(playerRef, {
                name: guestName || defaultName,
                color: availableColor,
                ready: false,
                joinedAt: Date.now()
            });

            // Set up disconnect handler
            onDisconnect(playerRef).remove();

            setRoomCode(upperCode);
            setPlayerName(guestName || defaultName);
            setIsHost(roomData.meta.hostId === playerId);

            return upperCode;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [playerId]);

    // Toggle ready status
    const toggleReady = useCallback(async () => {
        if (!roomCode || !roomData?.players?.[playerId]) return;

        const currentReady = roomData.players[playerId].ready;
        const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}/ready`);
        await set(playerRef, !currentReady);
    }, [roomCode, roomData, playerId]);

    // Start the game (host only)
    const startGame = useCallback(async () => {
        if (!roomCode || !isHost) return;

        const players = roomData?.players || {};
        const playerCount = Object.keys(players).length;

        if (playerCount < 2) {
            setError('Need at least 2 players to start');
            return;
        }

        // Check all players ready
        const allReady = Object.values(players).every(p => p.ready);
        if (!allReady) {
            setError('All players must be ready');
            return;
        }

        // Update room status
        const statusRef = ref(database, `rooms/${roomCode}/meta/status`);
        await set(statusRef, 'playing');
    }, [roomCode, isHost, roomData]);

    // Leave room
    const leaveRoom = useCallback(async () => {
        if (!roomCode) return;

        try {
            const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
            await remove(playerRef);

            // If host leaves and room has other players, transfer host
            if (isHost && roomData?.players) {
                const remainingPlayers = Object.keys(roomData.players).filter(id => id !== playerId);
                if (remainingPlayers.length > 0) {
                    const newHostId = remainingPlayers[0];
                    const hostRef = ref(database, `rooms/${roomCode}/meta/hostId`);
                    await set(hostRef, newHostId);
                } else {
                    // Delete empty room
                    const roomRef = getRoomRef(roomCode);
                    await remove(roomRef);
                }
            }
        } catch (err) {
            console.error('Error leaving room:', err);
        }

        setRoomCode(null);
        setRoomData(null);
        setIsHost(false);
    }, [roomCode, playerId, isHost, roomData]);

    // Quick Play - join first available room or create one
    const quickPlay = useCallback(async (playerNameInput) => {
        setError(null);
        const name = playerNameInput?.trim() || PLAYER_NAMES[0];

        // Try to join the first available room
        if (availableRooms.length > 0) {
            try {
                await joinRoom(availableRooms[0].code, name);
                return;
            } catch (err) {
                // Room might have filled up, try creating instead
                console.log('Could not join room, creating new one');
            }
        }

        // No available rooms or couldn't join, create a new one
        await createRoom(name);
    }, [availableRooms, joinRoom, createRoom]);

    // Start Practice Mode (single player vs AI)
    const startPracticeMode = useCallback((playerNameInput) => {
        const name = playerNameInput?.trim() || 'Player';
        setPlayerName(name);
        setIsPracticeMode(true);
        setRoomCode('PRACTICE'); // Special marker for practice mode
    }, []);

    // Exit Practice Mode
    const exitPracticeMode = useCallback(() => {
        setIsPracticeMode(false);
        setRoomCode(null);
        setPlayerName('');
    }, []);

    const value = {
        roomCode,
        roomData,
        playerId,
        playerName,
        isHost,
        isConnected,
        error,
        availableRooms,
        isPracticeMode,
        players: roomData?.players || {},
        gameStatus: isPracticeMode ? 'playing' : (roomData?.meta?.status || 'waiting'),
        createRoom,
        joinRoom,
        quickPlay,
        startPracticeMode,
        exitPracticeMode,
        toggleReady,
        startGame,
        leaveRoom,
        setError
    };

    return (
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    );
}

export function useRoom() {
    const context = useContext(RoomContext);
    if (!context) {
        throw new Error('useRoom must be used within a RoomProvider');
    }
    return context;
}
