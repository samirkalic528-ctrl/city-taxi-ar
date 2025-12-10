
import React, { Suspense } from 'react';
import { GameType } from '../types';

// Lazy load components to save memory/initial load time
const GameMenu = React.lazy(() => import('./games/GameMenu'));
const TicTacToe = React.lazy(() => import('./games/TicTacToe'));
const Trivia = React.lazy(() => import('./games/Trivia'));
const ReflexGame = React.lazy(() => import('./games/ReflexGame'));
const TrafficSimon = React.lazy(() => import('./games/TrafficSimon'));

interface GamesOverlayProps {
    activeGame: GameType;
    onSelectGame: (game: GameType) => void;
    onClose: () => void;
    onScoreUpdate: (points: number) => void;
    onOpenLeaderboard: () => void;
}

const GamesOverlay: React.FC<GamesOverlayProps> = ({ activeGame, onSelectGame, onClose, onScoreUpdate, onOpenLeaderboard }) => {
    
    // Determine view based on activeGame prop
    const isMenu = activeGame === GameType.NONE || activeGame === GameType.AR_HUNT;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none relative z-30">
            <div className="w-full flex flex-col items-center relative pointer-events-none max-h-full">
                
                {/* Header */}
                <h2 className="font-orbitron text-lg text-white font-bold mb-2 tracking-wider drop-shadow relative z-10 flex items-center gap-3">
                    {!isMenu && (
                        <button onClick={() => onSelectGame(GameType.NONE)} className="text-cyan-400 hover:text-white pointer-events-auto text-sm bg-black/50 px-2 py-1 rounded">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    )}
                    {isMenu ? 'GAME CENTER' : activeGame.replace('_', ' ')}
                    
                    <button onClick={onClose} className="text-white/70 hover:text-white text-lg pointer-events-auto ml-2 bg-black/50 px-2 py-0.5 rounded-full">
                        <i className="fas fa-times"></i>
                    </button>
                </h2>

                {/* Content with Suspense for performance */}
                <Suspense fallback={<div className="text-cyan-400 font-orbitron animate-pulse">LOADING GAME...</div>}>
                    {isMenu && (
                        <GameMenu 
                            onSelectGame={onSelectGame} 
                            onOpenLeaderboard={onOpenLeaderboard} 
                        />
                    )}
                    {activeGame === GameType.TIC_TAC_TOE && <TicTacToe onScoreUpdate={onScoreUpdate} />}
                    {activeGame === GameType.NEON_TRIVIA && <Trivia onScoreUpdate={onScoreUpdate} />}
                    {activeGame === GameType.REFLEX_GRID && <ReflexGame onScoreUpdate={onScoreUpdate} />}
                    {activeGame === GameType.TRAFFIC_SIMON && <TrafficSimon onScoreUpdate={onScoreUpdate} />}
                </Suspense>

            </div>
        </div>
    );
};

export default GamesOverlay;
