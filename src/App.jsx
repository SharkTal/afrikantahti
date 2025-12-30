import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { RoomProvider, useRoom } from './context/RoomContext';
import Board from './components/Board/Board';
import ControlPanel from './components/UI/ControlPanel';
import PlayerSidebar from './components/UI/PlayerSidebar';
import TokenReveal from './components/UI/TokenReveal';
import ActionModal from './components/UI/ActionModal';
import WinnerModal from './components/UI/WinnerModal';
import TrapModal from './components/UI/TrapModal';
import TurnPhaseBanner from './components/UI/TurnPhaseBanner';
import LobbyScreen from './screens/LobbyScreen';
import WaitingRoom from './screens/WaitingRoom';

// Game Layout - the actual game board
function GameLayout() {
  const { state } = useGame();

  // Safe guard against undefined state during initialization
  if (!state || !state.players || state.players.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading game...</div>;
  }

  const currentPlayerId = state.players[state.currentPlayerIndex]?.id;
  const currentPlayer = state.players[state.currentPlayerIndex];

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

  return (
    <div className="app-container">
      {/* ===== SCALABLE GAME HEADER ===== */}
      <header className="game-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '6px 16px',
        borderBottom: '2px solid rgba(241, 196, 15, 0.3)',
        minHeight: '50px'
      }}>
        {/* Left - Game Title */}
        <h1 style={{
          margin: 0,
          fontSize: '1.1rem',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: '#f1c40f',
          textShadow: '0 0 10px rgba(241, 196, 15, 0.4)',
          fontFamily: "'Cinzel', serif",
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap'
        }}>
          ⭐ Afrikan Tähti
        </h1>

        {/* Center - Current Player Turn Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '16px',
          border: `2px solid ${currentPlayer.color}`,
          boxShadow: '0 0 12px rgba(241, 196, 15, 0.5)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: currentPlayer.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            border: '2px solid white'
          }}>
            {getPlayerEmoji(currentPlayer)}
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#2c3e50' }}>
            {currentPlayer.name}
          </span>
          <span style={{
            backgroundColor: '#27ae60',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }}>
            £{currentPlayer.money}
          </span>
          <span style={{
            backgroundColor: '#e74c3c',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '0.6rem',
            fontWeight: 'bold'
          }}>
            TURN
          </span>
        </div>

        {/* Right - All Players (compact avatars only) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {state.players.map((player, index) => {
            const isTurn = player.id === currentPlayerId;
            return (
              <div
                key={player.id}
                title={`${player.name}: £${player.money}${player.hasDiamond ? ' ⭐' : ''}`}
                style={{
                  width: isTurn ? '32px' : '28px',
                  height: isTurn ? '32px' : '28px',
                  borderRadius: '50%',
                  backgroundColor: player.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isTurn ? '1rem' : '0.85rem',
                  border: isTurn ? '3px solid #f1c40f' : '2px solid rgba(255,255,255,0.5)',
                  boxShadow: isTurn ? '0 0 10px rgba(241, 196, 15, 0.8)' : '0 2px 4px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  opacity: isTurn ? 1 : 0.8
                }}
              >
                {getPlayerEmoji(player)}
              </div>
            );
          })}
          {/* Player count badge */}
          <div style={{
            marginLeft: '4px',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.7)',
            whiteSpace: 'nowrap'
          }}>
            {state.players.length}P
          </div>
        </div>
      </header>

      <main className="game-content" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        gap: '20px',
        width: '100%',
        overflowX: 'auto'
      }}>
        <ControlPanel />

        <div className="board-wrapper" style={{
          border: '4px solid #34495e',
          borderRadius: '8px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          minWidth: '1200px',
          width: '1200px',
          flexShrink: 0,
          backgroundColor: '#fff',
          position: 'relative'
        }}>
          <Board />
        </div>
      </main>

      {/* ===== FOOTER / LEGAL ===== */}
      <footer style={{
        textAlign: 'center',
        padding: '10px 20px 20px',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.75rem',
        marginTop: 'auto',
        width: '100%',
        zIndex: 10,
        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
      }}>
        <p style={{ margin: 0 }}>
          This online game is a non-profit fan project created for showcase and educational purposes only. Not affiliated with the official publisher.
        </p>
        <p style={{ margin: '4px 0 0' }}>
          Based on the original "Afrikan tähti" board game by Kari Mannerla (© Martinex).
          <a
            href="https://fi.wikipedia.org/wiki/Afrikan_t%C3%A4hti"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#f1c40f', marginLeft: '6px', textDecoration: 'none', borderBottom: '1px dotted #f1c40f' }}
          >
            Wikipedia
          </a>
        </p>
      </footer>

      <TokenReveal />
      <ActionModal />
      <TrapModal />
      <WinnerModal />
    </div>
  );
}

// Router component - decides which screen to show based on room state
function AppRouter() {
  const { roomCode, gameStatus, players, isPracticeMode, playerName } = useRoom();

  // Practice Mode -> show game with AI opponent (check FIRST)
  if (isPracticeMode) {
    // Create fake players for practice mode
    const practicePlayer = {
      id: 'human',
      name: playerName || 'You',
      color: '#e74c3c',
      isAI: false
    };
    const aiPlayer = {
      id: 'ai',
      name: 'Computer',
      color: '#3498db',
      isAI: true
    };
    const practicePlayers = { human: practicePlayer, ai: aiPlayer };

    return (
      <GameProvider roomCode={null} roomPlayers={practicePlayers} isPracticeMode={true}>
        <div className="game-container">
          <GameLayout />
        </div>
      </GameProvider>
    );
  }

  // No room joined yet -> show lobby
  if (!roomCode) {
    return <LobbyScreen />;
  }

  // Room joined but game not started -> show waiting room
  if (gameStatus === 'waiting') {
    return <WaitingRoom />;
  }

  // Game is playing or finished -> show game with room data
  return (
    <GameProvider roomCode={roomCode} roomPlayers={players}>
      <div className="game-container">
        <GameLayout />
      </div>
    </GameProvider>
  );
}

function App() {
  return (
    <RoomProvider>
      <AppRouter />
    </RoomProvider>
  );
}

export default App;
