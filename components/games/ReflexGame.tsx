
import React, { useState, useRef } from 'react';
import { trackUserActivity } from '../../services/geminiService';

interface ReflexGameProps {
    onScoreUpdate: (points: number) => void;
}

const ReflexGame: React.FC<ReflexGameProps> = ({ onScoreUpdate }) => {
    const [gridActive, setGridActive] = useState<number>(-1);
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(0); // 0 means not started
    
    const reflexTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reflexGameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startGame = () => {
        setScore(0);
        setTime(15);
        setGridActive(-1);
        
        if (reflexTimerRef.current) clearInterval(reflexTimerRef.current);
        reflexTimerRef.current = setInterval(() => {
            setTime(t => {
                if (t <= 1) {
                    stopGame();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        if (reflexGameLoopRef.current) clearInterval(reflexGameLoopRef.current);
        reflexGameLoopRef.current = setInterval(() => {
            setGridActive(Math.floor(Math.random() * 9));
        }, 800);
    };

    const stopGame = () => {
        if (reflexTimerRef.current) clearInterval(reflexTimerRef.current);
        if (reflexGameLoopRef.current) clearInterval(reflexGameLoopRef.current);
        setGridActive(-1);
        trackUserActivity('GAME_PLAYED', `Reflex Game Finished (Score: ${score})`);
    };

    const handleClick = (idx: number) => {
        if (time === 0) return;
        if (idx === gridActive) {
            setScore(s => s + 10);
            onScoreUpdate(10);
            setGridActive(-1);
            if (reflexGameLoopRef.current) clearInterval(reflexGameLoopRef.current);
            setGridActive(Math.floor(Math.random() * 9));
            reflexGameLoopRef.current = setInterval(() => {
                setGridActive(Math.floor(Math.random() * 9));
            }, Math.max(300, 800 - score * 2));
        } else {
            onScoreUpdate(-5);
        }
    };

    return (
        <div className="flex flex-col items-center gap-3 pointer-events-auto scale-75 md:scale-90 origin-center">
            <div className="flex justify-between w-full font-orbitron text-sm bg-black/50 px-3 py-1 rounded backdrop-blur-sm border border-white/10">
                <span className="text-purple-400">T: {time}</span>
                <span className="text-white">PTS: {score}</span>
            </div>
            {time > 0 ? (
                <div className="grid grid-cols-3 gap-2 p-2 bg-black/40 backdrop-blur-md rounded-xl border border-purple-500/40">
                    {[...Array(9)].map((_, i) => (
                        <button
                            key={i}
                            onMouseDown={() => handleClick(i)}
                            className={`w-14 h-14 rounded border transition-all duration-75 ${
                                i === gridActive 
                                ? 'bg-purple-500 border-white shadow-[0_0_15px_#a855f7] scale-105' 
                                : 'bg-white/5 border-white/10'
                            }`}
                        ></button>
                    ))}
                </div>
            ) : (
                <div className="text-center bg-black/70 p-4 rounded-xl border border-purple-500 backdrop-blur-md">
                    <div className="text-xl font-bold text-white mb-2">FINISHED</div>
                    <button onClick={startGame} className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-2 rounded-full font-bold text-sm">
                        {score > 0 ? 'PLAY AGAIN' : 'START GAME'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReflexGame;
