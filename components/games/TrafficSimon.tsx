
import React, { useState } from 'react';
import { trackUserActivity } from '../../services/geminiService';

interface TrafficSimonProps {
    onScoreUpdate: (points: number) => void;
}

const TrafficSimon: React.FC<TrafficSimonProps> = ({ onScoreUpdate }) => {
    const [simonSeq, setSimonSeq] = useState<number[]>([]);
    const [playerSeq, setPlayerSeq] = useState<number[]>([]);
    const [isShowingSeq, setIsShowingSeq] = useState(false);
    const [round, setRound] = useState(0);
    const [litPad, setLitPad] = useState<number | null>(null);

    const startSimon = () => {
        setRound(1);
        setSimonSeq([]);
        setPlayerSeq([]);
        addToSequence([]);
    };

    const addToSequence = (currentSeq: number[]) => {
        const nextColor = Math.floor(Math.random() * 4);
        const newSeq = [...currentSeq, nextColor];
        setSimonSeq(newSeq);
        setPlayerSeq([]);
        playSequence(newSeq);
    };

    const playSequence = (sequence: number[]) => {
        setIsShowingSeq(true);
        let i = 0;
        const interval = setInterval(() => {
            setLitPad(sequence[i]);
            setTimeout(() => setLitPad(null), 400);
            i++;
            if (i >= sequence.length) {
                clearInterval(interval);
                setIsShowingSeq(false);
            }
        }, 800);
    };

    const handleClick = (idx: number) => {
        if (isShowingSeq) return;
        setLitPad(idx);
        setTimeout(() => setLitPad(null), 200);

        const newPlayerSeq = [...playerSeq, idx];
        setPlayerSeq(newPlayerSeq);

        if (newPlayerSeq[newPlayerSeq.length - 1] !== simonSeq[newPlayerSeq.length - 1]) {
            onScoreUpdate(-10);
            trackUserActivity('GAME_PLAYED', `Simon Failed at Round ${round}`);
            setRound(0);
            return;
        }

        if (newPlayerSeq.length === simonSeq.length) {
            onScoreUpdate(50);
            setRound(r => r + 1);
            setTimeout(() => addToSequence(simonSeq), 1000);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 pointer-events-auto scale-75 md:scale-90 origin-center">
            <div className="text-xl font-orbitron text-red-400 drop-shadow">ROUND: {round}</div>
            <div className="grid grid-cols-2 gap-3">
                {['bg-green-500', 'bg-red-500', 'bg-yellow-400', 'bg-blue-500'].map((color, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        className={`w-20 h-20 rounded-xl border-2 border-white/20 backdrop-blur-md transition-all duration-100 ${color} ${
                            litPad === i ? 'brightness-150 scale-105 shadow-[0_0_20px_white] opacity-100' : 'opacity-40 hover:opacity-60'
                        }`}
                    ></button>
                ))}
            </div>
            {round === 0 && (
                <button onClick={startSimon} className="bg-white/90 hover:bg-white text-black font-bold px-8 py-2 rounded-full mt-2 font-orbitron text-sm">
                    START
                </button>
            )}
            {isShowingSeq && <div className="text-xs animate-pulse text-white font-bold bg-black/50 px-2 py-1 rounded">WATCH...</div>}
        </div>
    );
};

export default TrafficSimon;
