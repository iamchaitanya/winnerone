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
                if (!isSubmittingRef.current) {
                    isSubmittingRef.current = true;
                    onFinish(score, wrongCount, sessionResults);
                }
            } else {
                setTimeLeft(secondsRemaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive, score, wrongCount, sessionResults, onFinish]);

    const processAnswer = useCallback((rawDigits: string) => {
        // rawDigits is 3 chars, e.g. "362" → 3.62, "022" → 0.22
        const numericAns = parseInt(rawDigits[0], 10) + parseInt(rawDigits.slice(1), 10) / 100;
        const truncatedAns = truncate2(numericAns);
        const currentQ = questions[currentIndex];
        const correct = truncatedAns === currentQ.answer;
        const now = Date.now();
        const timeTaken = (now - lastQuestionTimeRef.current) / 1000;
        lastQuestionTimeRef.current = now;

        const nextScore = correct ? score + 1 : score;
        const nextWrong = correct ? wrongCount : wrongCount + 1;
        if (correct) setScore(nextScore);
        else setWrongCount(nextWrong);

        const resultEntry: DivQuestionResult = { ...currentQ, userAnswer: truncatedAns, isCorrect: correct, timeTaken };
        const nextResults = [...sessionResults, resultEntry];
        setSessionResults(nextResults);

        if (currentIndex < 99) {
            setTimeout(() => { setCurrentIndex(i => i + 1); setUserInput(''); }, 100);
        } else {
            if (!isSubmittingRef.current) {
                isSubmittingRef.current = true;
                onFinish(nextScore, nextWrong, nextResults);
            }
        }
    }, [questions, currentIndex, score, wrongCount, sessionResults, onFinish]);

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
