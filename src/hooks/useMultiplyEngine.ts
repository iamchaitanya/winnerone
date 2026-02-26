import { useState, useEffect, useCallback, useRef } from 'react';

export interface MulQuestion {
    num1: number;
    num2: number;
    answer: number;
}

export interface MulQuestionResult extends MulQuestion {
    userAnswer: number;
    isCorrect: boolean;
    timeTaken?: number;
}

export const useMultiplyEngine = (
    onFinish: (score: number, wrong: number, results: MulQuestionResult[]) => void
) => {
    const [questions, setQuestions] = useState<MulQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(100);
    const [isActive, setIsActive] = useState(false);
    const [sessionResults, setSessionResults] = useState<MulQuestionResult[]>([]);

    const lastQuestionTimeRef = useRef<number>(0);
    const endTimeRef = useRef<number>(0);
    const isSubmittingRef = useRef(false);

    const generateQuestions = useCallback((): MulQuestion[] => {
        const pool: MulQuestion[] = [];
        for (let i = 0; i < 100; i++) {
            const a = Math.floor(Math.random() * 90) + 10; // 10–99
            const b = Math.floor(Math.random() * 90) + 10; // 10–99
            pool.push({ num1: a, num2: b, answer: a * b });
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

    const processAnswer = useCallback((val: string) => {
        const numericAns = parseInt(val, 10);
        const currentQ = questions[currentIndex];
        const correct = numericAns === currentQ.answer;
        const now = Date.now();
        const timeTaken = (now - lastQuestionTimeRef.current) / 1000;
        lastQuestionTimeRef.current = now;

        const nextScore = correct ? score + 1 : score;
        const nextWrong = correct ? wrongCount : wrongCount + 1;
        if (correct) setScore(nextScore);
        else setWrongCount(nextWrong);

        const resultEntry: MulQuestionResult = { ...currentQ, userAnswer: numericAns, isCorrect: correct, timeTaken };
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
        if (userInput.length < 4) {
            const newInput = userInput + val;
            setUserInput(newInput);
            if (newInput.length === 4) processAnswer(newInput);
        }
    };

    return { questions, currentIndex, userInput, score, timeLeft, isActive, startQuiz, handleKeyClick, sessionResults };
};
