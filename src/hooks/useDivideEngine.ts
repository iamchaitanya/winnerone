import { useState, useEffect, useCallback, useRef } from 'react';

export interface DivQuestion {
    num1: number;
    num2: number;
    answer: number; // truncated to 2 decimal places, stored as e.g. 3.62
}

export interface DivQuestionResult extends DivQuestion {
    userAnswer: number;
    isCorrect: boolean;
    timeTaken?: number;
}

/** Truncate to 2 decimal places (no rounding). 18/79 = 0.2278 → 0.22 */
const truncate2 = (n: number): number => Math.floor(n * 100) / 100;

export const useDivideEngine = (
    onFinish: (score: number, wrong: number, results: DivQuestionResult[]) => void
) => {
    const [questions, setQuestions] = useState<DivQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState(''); // raw digits, no dot (e.g. "362" for 3.62)
    const [score, setScore] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(100);
    const [isActive, setIsActive] = useState(false);
    const [sessionResults, setSessionResults] = useState<DivQuestionResult[]>([]);

    const lastQuestionTimeRef = useRef<number>(0);
    const endTimeRef = useRef<number>(0);
    const isSubmittingRef = useRef(false);

    // Refs to avoid stale closures in timer callback
    const scoreRef = useRef(0);
    const wrongRef = useRef(0);
    const resultsRef = useRef<DivQuestionResult[]>([]);
    const onFinishRef = useRef(onFinish);
    const hasFinishedRef = useRef(false);

    useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    const generateQuestions = useCallback((): DivQuestion[] => {
        const pool: DivQuestion[] = [];
        for (let i = 0; i < 100; i++) {
            const a = Math.floor(Math.random() * 90) + 10; // 10–99
            const b = Math.floor(Math.random() * 90) + 10; // 10–99
            pool.push({ num1: a, num2: b, answer: truncate2(a / b) });
        }
        return pool;
    }, []);

    const startQuiz = () => {
        scoreRef.current = 0;
        wrongRef.current = 0;
        resultsRef.current = [];
        hasFinishedRef.current = false;

        setQuestions(generateQuestions());
        setCurrentIndex(0);
        setUserInput('');
        setScore(0);
        setWrongCount(0);
        setSessionResults([]);
        const now = Date.now();
        endTimeRef.current = now + 100000;
        setTimeLeft(100);
        setIsActive(true);
        lastQuestionTimeRef.current = now;
        isSubmittingRef.current = false;
    };

    useEffect(() => {
        if (!isActive) return;
        const interval = window.setInterval(() => {
            const now = Date.now();
            const secondsRemaining = Math.ceil((endTimeRef.current - now) / 1000);
            if (secondsRemaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
                if (!hasFinishedRef.current) {
                    hasFinishedRef.current = true;
                    setIsActive(false);
                    onFinishRef.current(scoreRef.current, wrongRef.current, resultsRef.current);
                }
            } else {
                setTimeLeft(secondsRemaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive]);

    const processAnswer = useCallback((rawDigits: string) => {
        // rawDigits is 3 chars, e.g. "362" → 3.62, "022" → 0.22
        const numericAns = parseInt(rawDigits[0], 10) + parseInt(rawDigits.slice(1), 10) / 100;
        const truncatedAns = truncate2(numericAns);
        const currentQ = questions[currentIndex];
        const correct = truncatedAns === currentQ.answer;
        const now = Date.now();
        const timeTaken = (now - lastQuestionTimeRef.current) / 1000;
        lastQuestionTimeRef.current = now;

        if (correct) {
            scoreRef.current++;
            setScore(s => s + 1);
        } else {
            wrongRef.current++;
            setWrongCount(w => w + 1);
        }

        const resultEntry: DivQuestionResult = { ...currentQ, userAnswer: truncatedAns, isCorrect: correct, timeTaken };
        resultsRef.current = [...resultsRef.current, resultEntry];
        setSessionResults(prev => [...prev, resultEntry]);

        if (currentIndex < 99) {
            setTimeout(() => { setCurrentIndex(i => i + 1); setUserInput(''); }, 100);
        } else {
            if (!hasFinishedRef.current) {
                hasFinishedRef.current = true;
                onFinishRef.current(scoreRef.current, wrongRef.current, resultsRef.current);
            }
        }
    }, [questions, currentIndex]);

    const handleKeyClick = (val: string) => {
        if (userInput.length < 3) {
            const newInput = userInput + val;
            setUserInput(newInput);
            if (newInput.length === 3) processAnswer(newInput);
        }
    };

    /** Format raw digits for display: "3" → "3._ _", "36" → "3.6_", "362" → "3.62" */
    const displayInput = userInput.length === 0 ? '_._ _'
        : userInput.length === 1 ? `${userInput}._ _`
            : userInput.length === 2 ? `${userInput[0]}.${userInput[1]}_`
                : `${userInput[0]}.${userInput.slice(1)}`;

    return { questions, currentIndex, userInput, displayInput, score, timeLeft, isActive, startQuiz, handleKeyClick, sessionResults };
};
