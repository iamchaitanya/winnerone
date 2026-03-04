import { useState, useEffect, useCallback, useRef } from 'react';

export interface MemoryResult {
    level3Correct: number;
    level4Correct: number;
    totalScore: number;
    reachedLevel4: boolean;
    wrongClick: number | null; // the number they clicked wrongly, or null
}

export const useMemoryEngine = (
    onFinish: (result: MemoryResult) => void
) => {
    const [level, setLevel] = useState<3 | 4>(3);
    const [grid, setGrid] = useState<number[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [nextExpected, setNextExpected] = useState(1);
    const [clickedNumbers, setClickedNumbers] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(100);
    const [isActive, setIsActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [wrongClick, setWrongClick] = useState<number | null>(null);

    const endTimeRef = useRef(0);
    const hasFinishedRef = useRef(false);
    const onFinishRef = useRef(onFinish);
    const level3CorrectRef = useRef(0);
    const level4CorrectRef = useRef(0);

    useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    // Shuffle array
    const shuffleArray = (arr: number[]) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const startGame = useCallback(() => {
        hasFinishedRef.current = false;
        level3CorrectRef.current = 0;
        level4CorrectRef.current = 0;

        const nums = shuffleArray(Array.from({ length: 9 }, (_, i) => i + 1));
        setGrid(nums);
        setLevel(3);
        setIsRevealed(true);
        setNextExpected(1);
        setClickedNumbers([]);
        setGameOver(false);
        setWrongClick(null);

        endTimeRef.current = Date.now() + 100000;
        setTimeLeft(100);
        setIsActive(true);

        // Reveal for 5 seconds then hide
        setTimeout(() => {
            setIsRevealed(false);
        }, 5000);
    }, []);

    // Timer
    useEffect(() => {
        if (!isActive) return;
        const interval = window.setInterval(() => {
            const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
                if (!hasFinishedRef.current) {
                    hasFinishedRef.current = true;
                    setIsActive(false);
                    onFinishRef.current({
                        level3Correct: level3CorrectRef.current,
                        level4Correct: level4CorrectRef.current,
                        totalScore: level3CorrectRef.current + (level4CorrectRef.current * 2),
                        reachedLevel4: level3CorrectRef.current === 9,
                        wrongClick: null
                    });
                }
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive]);

    const handleCellClick = useCallback((value: number) => {
        if (!isActive || isRevealed || gameOver || hasFinishedRef.current) return;

        if (value === nextExpected) {
            // Correct click
            const newClicked = [...clickedNumbers, value];
            setClickedNumbers(newClicked);
            setNextExpected(prev => prev + 1);

            if (level === 3) {
                level3CorrectRef.current++;
                if (newClicked.length === 9) {
                    // Level 3 completed! Move to level 4
                    const nums4 = shuffleArray(Array.from({ length: 16 }, (_, i) => i + 1));
                    setGrid(nums4);
                    setLevel(4);
                    setIsRevealed(true);
                    setNextExpected(1);
                    setClickedNumbers([]);

                    // Reveal 4x4 for 8 seconds
                    setTimeout(() => {
                        setIsRevealed(false);
                    }, 8000);
                }
            } else {
                level4CorrectRef.current++;
                if (newClicked.length === 16) {
                    // All done!
                    if (!hasFinishedRef.current) {
                        hasFinishedRef.current = true;
                        setIsActive(false);
                        onFinishRef.current({
                            level3Correct: level3CorrectRef.current,
                            level4Correct: level4CorrectRef.current,
                            totalScore: level3CorrectRef.current + (level4CorrectRef.current * 2),
                            reachedLevel4: true,
                            wrongClick: null
                        });
                    }
                }
            }
        } else {
            // Wrong click — game over for this level
            setWrongClick(value);
            setGameOver(true);

            if (!hasFinishedRef.current) {
                hasFinishedRef.current = true;
                setIsActive(false);
                onFinishRef.current({
                    level3Correct: level3CorrectRef.current,
                    level4Correct: level4CorrectRef.current,
                    totalScore: level3CorrectRef.current + (level4CorrectRef.current * 2),
                    reachedLevel4: level === 4,
                    wrongClick: value
                });
            }
        }
    }, [isActive, isRevealed, gameOver, nextExpected, clickedNumbers, level]);

    return {
        level,
        grid,
        isRevealed,
        nextExpected,
        clickedNumbers,
        timeLeft,
        isActive,
        gameOver,
        wrongClick,
        startGame,
        handleCellClick
    };
};
