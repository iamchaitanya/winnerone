import { useState, useEffect, useCallback, useRef } from 'react';

export type Mul25QuestionType = 'multiply' | 'divide';

export interface Mul25Question {
    type: Mul25QuestionType;
    operand1: number;
    operand2: number;
    answer: number;
}

export interface Mul25QuestionResult extends Mul25Question {
    userAnswer: number;
    isCorrect: boolean;
    timeTaken?: number;
}

export const useMultiplication25Engine = (
    onFinish: (score: number, wrong: number, results: Mul25QuestionResult[]) => void
) => {
    const [questions, setQuestions] = useState<Mul25Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(100);
    const [isActive, setIsActive] = useState(false);
    const [sessionResults, setSessionResults] = useState<Mul25QuestionResult[]>([]);

    const lastQuestionTimeRef = useRef<number>(0);
    const endTimeRef = useRef<number>(0);
    const isSubmittingRef = useRef(false);

    // Refs to avoid stale closures in timer callback
    const scoreRef = useRef(0);
    const wrongRef = useRef(0);
    const resultsRef = useRef<Mul25QuestionResult[]>([]);
    const onFinishRef = useRef(onFinish);
    const hasFinishedRef = useRef(false);

    useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    const generateQuestions = useCallback((): Mul25Question[] => {
        const pool: Mul25Question[] = [];
        for (let i = 0; i < 100; i++) {
            const a = Math.floor(Math.random() * 25) + 1; // 1–25
            const b = Math.floor(Math.random() * 25) + 1; // 1–25
            const isMultiply = Math.random() < 0.5;
            if (isMultiply) {
                pool.push({ type: 'multiply', operand1: a, operand2: b, answer: a * b });
            } else {
                pool.push({ type: 'divide', operand1: a * b, operand2: b, answer: a });
            }
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

    const processAnswer = useCallback((val: string) => {
        const numericAns = parseInt(val, 10);
        const currentQ = questions[currentIndex];
        const correct = numericAns === currentQ.answer;
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

        const resultEntry: Mul25QuestionResult = { ...currentQ, userAnswer: numericAns, isCorrect: correct, timeTaken };
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
        if (val === 'DEL') { setUserInput(prev => prev.slice(0, -1)); return; }
        if (userInput.length < 3) {
            const newInput = userInput + val;
            setUserInput(newInput);
            if (newInput.length === 3) processAnswer(newInput);
        }
    };

    return { questions, currentIndex, userInput, score, timeLeft, isActive, startQuiz, handleKeyClick, sessionResults };
};
