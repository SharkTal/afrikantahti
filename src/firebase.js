// Firebase Configuration
// Replace these values with your Firebase project credentials
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, push, update, remove, onDisconnect } from 'firebase/database';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase config in development
if (import.meta.env.DEV && !firebaseConfig.apiKey) {
    console.error('Firebase config missing! Please create .env.local with your Firebase credentials.');
}

import { getFunctions, httpsCallable } from 'firebase/functions';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const functions = getFunctions(app, 'us-central1'); // Default region

// Generate a unique player ID (persisted in localStorage)
export function getPlayerId() {
    let playerId = localStorage.getItem('afrikan_tahti_player_id');
    if (!playerId) {
        playerId = 'player_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('afrikan_tahti_player_id', playerId);
    }
    return playerId;
}

// Generate a 6-character room code
export function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars (0,O,1,I)
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Room Firebase references
export function getRoomRef(roomCode) {
    return ref(database, `rooms/${roomCode}`);
}

export function getPlayersRef(roomCode) {
    return ref(database, `rooms/${roomCode}/players`);
}

export function getGameStateRef(roomCode) {
    return ref(database, `rooms/${roomCode}/gameState`);
}

// Export Firebase functions
export { database, functions, httpsCallable, ref, set, get, onValue, push, update, remove, onDisconnect };
