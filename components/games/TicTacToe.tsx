
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { trackUserActivity } from '../../services/geminiService';

interface TicTacToeProps {
    onScoreUpdate: (points: number) => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onScoreUpdate }) => {
    const [board, setBoard] = useState<(null | 'CITY' | 'GLOBOS')[]>(Array(9).fill(null));
    const [turn, setTurn] = useState<'CITY' | 'GLOBOS'>('CITY'); 
    const [mode, setMode] = useState<'CPU' | 'PVP' | null>(null);
    const [score, setScore] = useState({ city: 0, globos: 0 });
    const [winner, setWinner] = useState<null | 'CITY' | 'GLOBOS' | 'DRAW'>(null);

    const checkWin = (currentBoard: (null | 'CITY' | 'GLOBOS')[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let line of lines) {
            const [a, b, c] = line;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return currentBoard[a];
            }
        }
        if (!currentBoard.includes(null)) return 'DRAW';
        return null;
    };

    const makeMove = (idx: number, player: 'CITY' | 'GLOBOS') => {
        const newBoard = [...board];
        newBoard[idx] = player;
        setBoard(newBoard);

        const win = checkWin(newBoard);
        if (win) {
            setWinner(win);
            trackUserActivity('GAME_PLAYED', `TicTacToe Winner: ${win}`);
            if (win === 'CITY') {
                setScore(prev => ({ ...prev, city: prev.city + 1 }));
                onScoreUpdate(50);
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 }, colors: ['#991b1b', '#fbbf24'] });
            } else if (win === 'GLOBOS') {
                setScore(prev => ({ ...prev, globos: prev.globos + 1 }));
                if (mode === 'PVP') onScoreUpdate(50);
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 }, colors: ['#22d3ee', '#ffffff'] });
            }
        } else {
            setTurn(player === 'CITY' ? 'GLOBOS' : 'CITY');
        }
    };

    const handleClick = (idx: number) => {
        if (board[idx] || winner || mode === null) return;
        if (mode === 'CPU' && turn === 'GLOBOS') return; 
        makeMove(idx, turn);
    };

    // CPU Turn
    useEffect(() => {
        if (mode === 'CPU' && turn === 'GLOBOS' && !winner) {
            const timer = setTimeout(() => {
                const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
                if (emptyIndices.length > 0) {
                    const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                    makeMove(randomIdx, 'GLOBOS');
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [turn, mode, winner, board]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setTurn('CITY');
        setWinner(null);
    };

    if (!mode) {
        return (
            <div className="flex flex-col gap-4 w-full pointer-events-auto scale-75 md:scale-90 origin-center items-center">
                <h3 className="font-orbitron text-xl text-white mb-4">SELECT MODE</h3>
                <button 
                    onClick={() => setMode('CPU')}
                    className="w-full max-w-xs bg-black/60 border-2 border-cyan-400 rounded-xl p-4 flex items-center gap-4 hover:bg-cyan-900/30 transition-colors group"
                >
                    <i className="fas fa-robot text-3xl text-cyan-400 group-hover:scale-110 transition-transform"></i>
                    <div className="text-left">
                        <div className="font-bold text-white font-orbitron">VS COMPUTER</div>
                        <div className="text-xs text-gray-400">Practice mode</div>
                    </div>
                </button>
                <button 
                    onClick={() => setMode('PVP')}
                    className="w-full max-w-xs bg-black/60 border-2 border-amber-400 rounded-xl p-4 flex items-center gap-4 hover:bg-amber-900/30 transition-colors group"
                >
                    <i className="fas fa-user-friends text-3xl text-amber-400 group-hover:scale-110 transition-transform"></i>
                    <div className="text-left">
                        <div className="font-bold text-white font-orbitron">VS FRIEND</div>
                        <div className="text-xs text-gray-400">Two player mode</div>
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full pointer-events-auto scale-75 md:scale-90 origin-center">
            {/* Scoreboard */}
            <div className="flex w-full max-w-xs justify-between items-center mb-4 bg-black/60 rounded-xl border border-gray-600 p-2">
                <div className={`flex flex-col items-center px-3 py-1 rounded-lg ${turn === 'CITY' && !winner ? 'bg-red-900/50 border border-red-500' : ''}`}>
                    <i className="fas fa-taxi text-red-500 mb-1"></i>
                    <span className="text-[10px] text-red-400 font-bold">CITY</span>
                    <span className="font-orbitron text-2xl text-white font-bold">{score.city}</span>
                </div>
                <div className="text-gray-500 font-mono text-xl">VS</div>
                <div className={`flex flex-col items-center px-3 py-1 rounded-lg ${turn === 'GLOBOS' && !winner ? 'bg-cyan-900/50 border border-cyan-500' : ''}`}>
                    <i className="fas fa-shield-alt text-cyan-400 mb-1"></i>
                    <span className="text-[10px] text-cyan-400 font-bold">GLOBOS</span>
                    <span className="font-orbitron text-2xl text-white font-bold">{score.globos}</span>
                </div>
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {board.map((cell, i) => (
                    <button 
                        key={i}
                        onClick={() => handleClick(i)}
                        disabled={!!cell || !!winner}
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center text-4xl transition-all duration-200 border border-white/5 ${
                            cell === 'CITY' ? 'bg-red-900/30 shadow-[inset_0_0_10px_rgba(220,38,38,0.5)]' : 
                            cell === 'GLOBOS' ? 'bg-cyan-900/30 shadow-[inset_0_0_10px_rgba(34,211,238,0.5)]' : 
                            'bg-white/5 hover:bg-white/10'
                        }`}
                    >
                        {cell === 'CITY' && <i className="fas fa-taxi text-red-500 drop-shadow-[0_0_5px_red] animate-[pop_0.2s_ease-out]"></i>}
                        {cell === 'GLOBOS' && <i className="fas fa-shield-alt text-cyan-400 drop-shadow-[0_0_5px_cyan] animate-[pop_0.2s_ease-out]"></i>}
                    </button>
                ))}
            </div>

            {/* Winner Status */}
            {winner && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl animate-in fade-in zoom-in duration-300">
                    <div className="font-orbitron text-3xl font-bold mb-2 animate-bounce">
                        {winner === 'DRAW' ? <span className="text-gray-400">DRAW!</span> : 
                         winner === 'CITY' ? <span className="text-red-500">CITY WINS!</span> :
                         <span className="text-cyan-400">GLOBOS WINS!</span>}
                    </div>
                    <button 
                        onClick={resetGame}
                        className="mt-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-2 px-6 rounded-full font-orbitron transition-all"
                    >
                        NEXT ROUND
                    </button>
                </div>
            )}
        </div>
    );
};

export default TicTacToe;
