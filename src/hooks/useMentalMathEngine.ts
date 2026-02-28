import { useState, useEffect, useCallback, useRef } from 'react';

export type MathOperator = '+' | '-' | '×' | '÷';

export interface MathStep {
    stepNumber: number;
    operator: MathOperator | null; // null for the first number
    operand: number;
    runningTotal: number;
}

export interface MentalMathResult {
    steps: MathStep[];
    correctAnswer: number;
    userAnswer: number | null;
    isCorrect: boolean;
    stepsCompleted: number;
}

type Phase = 'idle' | 'showing' | 'answering' | 'finished';

export const useMentalMathEngine = (
    onFinish: (stepsCompleted: number, isCorrect: boolean, result: MentalMathResult) => void
) => {
    const [phase, setPhase] = useState<Phase>('idle');
    const [steps, setSteps] = useState<MathStep[]>([]);
    const [currentStep, setCurrentStep] = useState<MathStep | null>(null);
    const [runningTotal, setRunningTotal] = useState(0);
    const [stepsCompleted, setStepsCompleted] = useState(0);
    const [timeLeft, setTimeLeft] = useState(95);
    const [answerTimeLeft, setAnswerTimeLeft] = useState(5);
    const [userInput, setUserInput] = useState('');

    const endTimeRef = useRef<number>(0);
    const answerEndTimeRef = useRef<number>(0);
    const isSubmittingRef = useRef(false);
    const userInputRef = useRef('');
    const runningTotalRef = useRef(0);
    const stepsRef = useRef<MathStep[]>([]);
    const stepsCompletedRef = useRef(0);

    const getRandomDigit = () => Math.floor(Math.random() * 9) + 1; // 1–9

    const getRandomOperator = (): MathOperator => {
        const ops: MathOperator[] = ['+', '-', '×', '÷'];
        return ops[Math.floor(Math.random() * 4)];
    };

    const getSingleDigitFactors = (n: number): number[] => {
        const abs = Math.abs(n);
        if (abs === 0) return [1, 2, 3, 4, 5, 6, 7, 8, 9]; // 0 ÷ anything = 0
        const factors: number[] = [];
        for (let i = 1; i <= 9; i++) {
            if (abs % i === 0) factors.push(i);
        }
        return factors;
    };

    const MAX_TOTAL = 100;

    const generateNextStep = useCallback((currentTotal: number, stepNum: number): MathStep => {
        // Shuffle operators to try them in random order
        const allOps: MathOperator[] = ['+', '-', '×', '÷'];
        for (let i = allOps.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOps[i], allOps[j]] = [allOps[j], allOps[i]];
        }

        for (const operator of allOps) {
            let operand: number;
            let newTotal: number;

            if (operator === '+') {
                // Cap operand so total doesn't exceed MAX_TOTAL
                const maxAdd = MAX_TOTAL - currentTotal;
                if (maxAdd < 1) continue; // can't add anything
                operand = Math.floor(Math.random() * Math.min(9, maxAdd)) + 1;
                newTotal = currentTotal + operand;
            } else if (operator === '-') {
                // Cap operand so total doesn't go below -MAX_TOTAL
                const maxSub = currentTotal + MAX_TOTAL;
                if (maxSub < 1) continue; // can't subtract anything
                operand = Math.floor(Math.random() * Math.min(9, maxSub)) + 1;
                newTotal = currentTotal - operand;
            } else if (operator === '×') {
                if (currentTotal === 0) { operand = getRandomDigit(); newTotal = 0; }
                else {
                    // Pick operand so |total * operand| <= MAX_TOTAL
                    const maxMul = Math.floor(MAX_TOTAL / Math.abs(currentTotal));
                    if (maxMul < 1) continue; // total already too large to multiply
                    operand = Math.floor(Math.random() * Math.min(9, maxMul)) + 1;
                    newTotal = currentTotal * operand;
                }
            } else {
                // Division: whole-number result and within bounds
                const factors = getSingleDigitFactors(currentTotal);
                const validFactors = factors.filter(f => Math.abs(currentTotal / f) <= MAX_TOTAL);
                if (validFactors.length === 0) continue;
                operand = validFactors[Math.floor(Math.random() * validFactors.length)];
                newTotal = currentTotal / operand;
            }

            if (Math.abs(newTotal) <= MAX_TOTAL) {
                return { stepNumber: stepNum, operator, operand, runningTotal: newTotal };
            }
        }

        // Absolute fallback: add/subtract 1
        const fallbackOp: MathOperator = currentTotal >= MAX_TOTAL ? '-' : '+';
        return { stepNumber: stepNum, operator: fallbackOp, operand: 1, runningTotal: currentTotal + (fallbackOp === '+' ? 1 : -1) };
    }, []);

    const startQuiz = () => {
        const firstNumber = getRandomDigit();
        const firstStep: MathStep = {
            stepNumber: 1,
            operator: null,
            operand: firstNumber,
            runningTotal: firstNumber
        };

        setSteps([firstStep]);
        stepsRef.current = [firstStep];
        setCurrentStep(firstStep);
        setRunningTotal(firstNumber);
        runningTotalRef.current = firstNumber;
        setStepsCompleted(1);
        stepsCompletedRef.current = 1;
        setUserInput('');
        userInputRef.current = '';
        setAnswerTimeLeft(5);

        const now = Date.now();
        endTimeRef.current = now + 95000;
        setTimeLeft(95);
        setPhase('showing');
        isSubmittingRef.current = false;
    };

    const MAX_STEPS = 95;

    const handleNext = useCallback(() => {
        if (phase !== 'showing') return;

        const nextStepNum = stepsCompletedRef.current + 1;
        const nextStep = generateNextStep(runningTotalRef.current, nextStepNum);

        runningTotalRef.current = nextStep.runningTotal;
        stepsCompletedRef.current = nextStepNum;

        const newSteps = [...stepsRef.current, nextStep];
        stepsRef.current = newSteps;

        setSteps(newSteps);
        setCurrentStep(nextStep);
        setRunningTotal(nextStep.runningTotal);
        setStepsCompleted(nextStepNum);

        // Auto-transition to answer phase at MAX_STEPS
        if (nextStepNum >= MAX_STEPS) {
            const answerNow = Date.now();
            answerEndTimeRef.current = answerNow + 5000;
            setTimeLeft(0);
            setAnswerTimeLeft(5);
            setPhase('answering');
        }
    }, [phase, generateNextStep]);

    // Phase 1 timer: 100 seconds countdown
    useEffect(() => {
        if (phase !== 'showing') return;

        const interval = window.setInterval(() => {
            const now = Date.now();
            const secondsRemaining = Math.ceil((endTimeRef.current - now) / 1000);

            if (secondsRemaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
                // Transition to answer phase
                const answerNow = Date.now();
                answerEndTimeRef.current = answerNow + 5000;
                setAnswerTimeLeft(5);
                setPhase('answering');
            } else {
                setTimeLeft(secondsRemaining);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [phase]);

    // Phase 2 timer: 5 seconds countdown for answer
    useEffect(() => {
        if (phase !== 'answering') return;

        const interval = window.setInterval(() => {
            const now = Date.now();
            const secondsRemaining = Math.ceil((answerEndTimeRef.current - now) / 1000);

            if (secondsRemaining <= 0) {
                setAnswerTimeLeft(0);
                clearInterval(interval);
                // Auto-submit whatever is entered
                submitAnswer();
            } else {
                setAnswerTimeLeft(secondsRemaining);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

    const submitAnswer = useCallback(() => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        const currentInput = userInputRef.current;
        const numericAnswer = currentInput.trim() === '' ? null : parseFloat(currentInput);
        const correctAnswer = runningTotalRef.current;
        const isCorrect = numericAnswer === correctAnswer;
        const count = stepsCompletedRef.current;

        const result: MentalMathResult = {
            steps: stepsRef.current,
            correctAnswer,
            userAnswer: numericAnswer,
            isCorrect,
            stepsCompleted: count
        };

        setPhase('finished');
        onFinish(count, isCorrect, result);
    }, [onFinish]);

    const handleKeyClick = (val: string) => {
        if (phase !== 'answering') return;

        if (val === 'SUBMIT') {
            submitAnswer();
            return;
        }

        if (val === '-') {
            if (userInput.length === 0) {
                setUserInput('-');
                userInputRef.current = '-';
            }
            return;
        }

        if (val === 'DEL') {
            setUserInput(prev => {
                const next = prev.slice(0, -1);
                userInputRef.current = next;
                return next;
            });
            return;
        }

        if (userInput.length < 6) {
            setUserInput(prev => {
                const next = prev + val;
                userInputRef.current = next;
                return next;
            });
        }
    };

    return {
        phase,
        currentStep,
        stepsCompleted,
        timeLeft,
        answerTimeLeft,
        userInput,
        runningTotal,
        startQuiz,
        handleNext,
        handleKeyClick,
        submitAnswer,
        steps
    };
};
