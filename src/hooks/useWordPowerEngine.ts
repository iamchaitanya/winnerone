import { useState, useEffect, useCallback, useRef } from 'react';
import { wordPowerRoots, WordPowerRoot, WordPowerQuestion } from '../lib/wordPowerRoots';

export interface WordPowerResult {
    totalCorrect: number;
    totalWrong: number;
    totalUnanswered: number;
    totalScore: number;
    rootsAttempted: number;
    details: { root: string; meaning: string; question: string; userAnswer: number; correct: number; isCorrect: boolean }[];
}

export const useWordPowerEngine = (
    onFinish: (result: WordPowerResult) => void,
    selectedUser: string | null
) => {
    const [phase, setPhase] = useState<'root' | 'question'>('root');
    const [currentRoot, setCurrentRoot] = useState<WordPowerRoot | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<WordPowerQuestion | null>(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);
    const [rootTimeLeft, setRootTimeLeft] = useState(15);
    const [answered, setAnswered] = useState<number | null>(null);

    // Use Refs for all game state that needs to be accessed inside intervals to prevent stale closures
    const phaseRef = useRef<'root' | 'question'>('root');
    const endTimeRef = useRef(0);
    const hasFinishedRef = useRef(false);
    const onFinishRef = useRef(onFinish);
    const detailsRef = useRef<WordPowerResult['details']>([]);
    const correctRef = useRef(0);
    const wrongRef = useRef(0);
    const unansweredRef = useRef(0);
    const rootsRef = useRef(0);
    const rootIndexRef = useRef(0);
    const currentQuestionIndexRef = useRef(0);
    const currentRootRef = useRef<WordPowerRoot | null>(null);
    const currentQuestionRef = useRef<WordPowerQuestion | null>(null);

    // Timer Refs
    const rootTimerRef = useRef<number | null>(null);
    const currentRootTimeLeftRef = useRef(15);

    // Store assigned roots
    const todayRootsRef = useRef<WordPowerRoot[]>([]);

    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    const clearRootTimer = useCallback(() => {
        if (rootTimerRef.current !== null) {
            window.clearInterval(rootTimerRef.current);
            rootTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => clearRootTimer();
    }, [clearRootTimer]);

    const getTodayRoots = useCallback(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const offset = selectedUser === 'Riyaan' ? 1 : 0;
        const startIndex = (dayOfYear + offset) % wordPowerRoots.length;
        const rootRaw = wordPowerRoots[startIndex];
        const limitedQuestions = rootRaw.questions.slice(0, 3);
        return [{ ...rootRaw, questions: limitedQuestions }];
    }, [selectedUser]);

    const prepareQuestion = useCallback((q: WordPowerQuestion): WordPowerQuestion => {
        const optionObjects = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
        for (let i = optionObjects.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionObjects[i], optionObjects[j]] = [optionObjects[j], optionObjects[i]];
        }
        const newCorrectIndex = optionObjects.findIndex(o => o.isCorrect);
        return {
            ...q,
            options: optionObjects.map(o => o.text),
            correct: newCorrectIndex
        };
    }, []);

    const finishNow = useCallback(() => {
        if (hasFinishedRef.current) return;
        hasFinishedRef.current = true;
        setIsActive(false);
        clearRootTimer();

        // If game ends while on a question that hasn't been resolved yet, count it as unanswered
        if (phaseRef.current === 'question' && detailsRef.current.length < rootsRef.current * 3) {
            const currentQIndex = currentQuestionIndexRef.current;
            const cRoot = currentRootRef.current;
            const cQuestion = currentQuestionRef.current;

            // Check if this specific question has already been recorded in details
            const alreadyRecorded = detailsRef.current.some(d => d.root === cRoot?.root && d.question === cQuestion?.word);

            if (!alreadyRecorded && cRoot && cQuestion) {
                unansweredRef.current++;
                detailsRef.current.push({
                    root: cRoot.root,
                    meaning: cRoot.meaning,
                    question: cQuestion.word,
                    userAnswer: -1,
                    correct: cQuestion.correct,
                    isCorrect: false,
                    scoreChange: 0
                } as any);
            }
        }

        const finalCalculatedScore = detailsRef.current.reduce((acc, d: any) => acc + (d.scoreChange || 0), 0);

        onFinishRef.current({
            totalCorrect: correctRef.current,
            totalWrong: wrongRef.current,
            totalUnanswered: unansweredRef.current,
            totalScore: finalCalculatedScore,
            rootsAttempted: rootsRef.current,
            details: detailsRef.current
        });
    }, [clearRootTimer]);

    // Forward declaration to allow the interval to call handleAnswer
    const processTimeoutRef = useRef<() => void>(() => { });

    // Proceed to next root explicitly
    const advanceToNextRoot = useCallback((roots: WordPowerRoot[], index: number) => {
        if (index >= roots.length) {
            finishNow();
            return;
        }

        const root = roots[index];
        currentRootRef.current = root;
        setCurrentRoot(root);

        phaseRef.current = 'root';
        setPhase('root');

        currentRootTimeLeftRef.current = 15;
        setRootTimeLeft(15);

        currentQuestionIndexRef.current = 0;
        setCurrentQuestionIndex(0);

        setAnswered(null);

        clearRootTimer();

        const tick = () => {
            currentRootTimeLeftRef.current--;
            setRootTimeLeft(currentRootTimeLeftRef.current);

            if (currentRootTimeLeftRef.current <= 0) {
                clearRootTimer();

                if (phaseRef.current === 'root') {
                    rootsRef.current++;

                    phaseRef.current = 'question';
                    setPhase('question');

                    const q = prepareQuestion(root.questions[0]);
                    currentQuestionRef.current = q;
                    setCurrentQuestion(q);

                    currentQuestionIndexRef.current = 0;
                    setCurrentQuestionIndex(0);

                    setAnswered(null);

                    currentRootTimeLeftRef.current = 15;
                    setRootTimeLeft(15);
                    rootTimerRef.current = window.setInterval(tick, 1000);
                } else {
                    processTimeoutRef.current();
                }
            }
        };

        rootTimerRef.current = window.setInterval(tick, 1000);
    }, [clearRootTimer, finishNow, prepareQuestion]);

    const startGame = useCallback(() => {
        hasFinishedRef.current = false;
        correctRef.current = 0;
        wrongRef.current = 0;
        unansweredRef.current = 0;
        rootsRef.current = 0;
        detailsRef.current = [];

        const roots = getTodayRoots();
        todayRootsRef.current = roots;
        rootIndexRef.current = 0;

        endTimeRef.current = Date.now() + 60000;
        setTimeLeft(60);
        setIsActive(true);

        advanceToNextRoot(roots, 0);
    }, [getTodayRoots, advanceToNextRoot]);

    // Main game timer 
    useEffect(() => {
        if (!isActive) return;
        const interval = window.setInterval(() => {
            const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
                finishNow();
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive, finishNow]);

    const resolveAnswer = useCallback((optionIndex: number, isTimeout: boolean, timeScore: number) => {
        if (hasFinishedRef.current) return;

        setAnswered(optionIndex);
        clearRootTimer();

        let scoreChange = 0;
        let isCorrect = false;

        const cRoot = currentRootRef.current;
        const cQuestion = currentQuestionRef.current;

        if (!cRoot || !cQuestion) return;

        if (isTimeout || optionIndex === -1) {
            // no answer = 0
            scoreChange = 0;
            unansweredRef.current++; // Timeout is now explicitly tracked as unanswered
            isCorrect = false;
            optionIndex = -1;
        } else {
            isCorrect = optionIndex === cQuestion.correct;
            if (isCorrect) {
                correctRef.current++;
                scoreChange = timeScore;
            } else {
                wrongRef.current++;
                scoreChange = -timeScore;
            }
        }

        detailsRef.current.push({
            root: cRoot.root,
            meaning: cRoot.meaning,
            question: cQuestion.word,
            userAnswer: optionIndex,
            correct: cQuestion.correct,
            isCorrect,
            scoreChange
        } as any);

        setTimeout(() => {
            if (hasFinishedRef.current) return;

            const nextQIndex = currentQuestionIndexRef.current + 1;
            if (nextQIndex < cRoot.questions.length) {
                currentQuestionIndexRef.current = nextQIndex;
                setCurrentQuestionIndex(nextQIndex);

                const q = prepareQuestion(cRoot.questions[nextQIndex]);
                currentQuestionRef.current = q;
                setCurrentQuestion(q);

                setAnswered(null);

                // Start next question
                currentRootTimeLeftRef.current = 15;
                setRootTimeLeft(15);
                phaseRef.current = 'question';

                const questionTick = () => {
                    currentRootTimeLeftRef.current--;
                    setRootTimeLeft(currentRootTimeLeftRef.current);
                    if (currentRootTimeLeftRef.current <= 0) {
                        clearRootTimer();
                        processTimeoutRef.current();
                    }
                };

                rootTimerRef.current = window.setInterval(questionTick, 1000);
            } else {
                const nextRootIndex = rootIndexRef.current + 1;
                rootIndexRef.current = nextRootIndex;
                advanceToNextRoot(todayRootsRef.current, nextRootIndex);
            }
        }, 800);
    }, [clearRootTimer, advanceToNextRoot, prepareQuestion]);

    const handleAnswer = useCallback((optionIndex: number) => {
        // Prevent multiple answers or answering after timeout process started
        if (hasFinishedRef.current) return;

        const timeScore = currentRootTimeLeftRef.current;
        resolveAnswer(optionIndex, false, timeScore);
    }, [resolveAnswer]);

    // Keep the timeout ref updated to use the latest resolveAnswer without closure leaks
    useEffect(() => {
        processTimeoutRef.current = () => {
            resolveAnswer(-1, true, 0);
        };
    }, [resolveAnswer]);

    return {
        phase, currentRoot, currentQuestion, currentQuestionIndex,
        timeLeft, rootTimeLeft, isActive, answered,
        startGame, handleAnswer
    };
};
