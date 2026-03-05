import { useState, useCallback, useEffect, useRef } from 'react';

export interface MathMasteryResult {
    question: string;
    answer: string;
    userAnswer: string;
    isCorrect: boolean;
    timeTaken: number;
    category: string;
}

interface CurrentQuestion {
    question: string;
    answer: string;
    category: string;
}

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199];
const COMPOSITES = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52, 54, 55, 56, 57, 58, 60, 62, 63, 64, 65, 66, 68, 69, 70, 72, 74, 75, 76, 77, 78, 80, 81, 82, 84, 85, 86, 87, 88, 90, 91, 92, 93, 94, 95, 96, 98, 99, 100];

const FRACTIONS: Record<number, string> = {
    2: "50", 3: "33.33", 4: "25", 5: "20", 6: "16.66", 7: "14.28",
    8: "12.5", 9: "11.11", 10: "10", 11: "9.09", 12: "8.33", 13: "7.69",
    14: "7.14", 15: "6.66", 16: "6.25", 17: "5.88", 18: "5.55", 19: "5.26", 20: "5"
};

const TRIPLETS = [
    [3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 40, 41]
];

const LOGS = [
    { n: 2, v: "0.3010" }, { n: 3, v: "0.4771" }, { n: 5, v: "0.6989" }, { n: 7, v: "0.8450" }
];

const FACTORIALS = [
    { n: 1, v: 1 }, { n: 2, v: 2 }, { n: 3, v: 6 }, { n: 4, v: 24 },
    { n: 5, v: 120 }, { n: 6, v: 720 }, { n: 7, v: 5040 }, { n: 8, v: 40320 }
];

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function generateQuestion(): CurrentQuestion {
    const categories = [
        'primes', 'squares', 'cubes', 'fractions',
        'factorials', 'powers', 'triplets', 'logs'
    ];
    const cat = pickRandom(categories);

    switch (cat) {
        case 'primes':
            if (Math.random() > 0.5) {
                // Next prime
                const idx = Math.floor(Math.random() * (PRIMES.length - 1));
                return { question: `Next prime after ${PRIMES[idx]}?`, answer: PRIMES[idx + 1].toString(), category: cat };
            } else {
                // Is prime? (1=yes, 0=no)
                const isPrime = Math.random() > 0.5;
                const num = isPrime ? pickRandom(PRIMES) : pickRandom(COMPOSITES);
                return { question: `Is ${num} prime? (1=yes, 0=no)`, answer: isPrime ? "1" : "0", category: cat };
            }
        case 'squares':
            const sq = Math.floor(Math.random() * 50) + 1;
            if (Math.random() > 0.5) {
                return { question: `${sq}² = ?`, answer: (sq * sq).toString(), category: cat };
            } else {
                return { question: `√${sq * sq} = ?`, answer: sq.toString(), category: cat };
            }
        case 'cubes':
            const cb = Math.floor(Math.random() * 30) + 1;
            return { question: `${cb}³ = ?`, answer: (cb * cb * cb).toString(), category: cat };
        case 'fractions':
            const denom = Math.floor(Math.random() * 19) + 2; // 2 to 20
            if (Math.random() > 0.5) {
                return { question: `1/${denom} = ?%`, answer: FRACTIONS[denom], category: cat };
            } else {
                return { question: `?% = 1/${denom}`, answer: FRACTIONS[denom], category: cat };
            }
        case 'factorials':
            const f = pickRandom(FACTORIALS);
            if (Math.random() > 0.5) {
                return { question: `${f.n}! = ?`, answer: f.v.toString(), category: cat };
            } else {
                return { question: `?! = ${f.v}`, answer: f.n.toString(), category: cat };
            }
        case 'powers':
            const base = pickRandom([2, 3, 5]);
            let exp = 1;
            if (base === 2) exp = Math.floor(Math.random() * 12) + 1;
            else exp = Math.floor(Math.random() * 6) + 1;
            const res = Math.pow(base, exp);

            if (Math.random() > 0.5) {
                return { question: `${base}^${exp} = ?`, answer: res.toString(), category: cat };
            } else {
                return { question: `${base}^? = ${res}`, answer: exp.toString(), category: cat };
            }

        case 'triplets':
            const trip = pickRandom(TRIPLETS);
            const missing = Math.floor(Math.random() * 3);
            if (missing === 0) return { question: `?² + ${trip[1]}² = ${trip[2]}²`, answer: trip[0].toString(), category: cat };
            if (missing === 1) return { question: `${trip[0]}² + ?² = ${trip[2]}²`, answer: trip[1].toString(), category: cat };
            return { question: `${trip[0]}² + ${trip[1]}² = ?²`, answer: trip[2].toString(), category: cat };
        case 'logs':
            const l = pickRandom(LOGS);
            if (Math.random() > 0.5) {
                return { question: `log(${l.n}) = ?`, answer: l.v, category: cat };
            } else {
                return { question: `log(?) = ${l.v}`, answer: l.n.toString(), category: cat };
            }
    }
    return { question: "1+1=?", answer: "2", category: "fallback" };
}

export function useMathMasteryEngine(onFinish: (score: number, wrong: number, results: MathMasteryResult[]) => void) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(100);
    const [score, setScore] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
    const [userInput, setUserInput] = useState('');
    const [results, setResults] = useState<MathMasteryResult[]>([]);

    const questionStartTimeRef = useRef<number>(0);
    const timerRef = useRef<number | null>(null);
    const endTimeRef = useRef<number>(0);

    // Use refs to track mutable values so the timer callback never goes stale
    const scoreRef = useRef(0);
    const wrongRef = useRef(0);
    const resultsRef = useRef<MathMasteryResult[]>([]);
    const onFinishRef = useRef(onFinish);
    const hasFinishedRef = useRef(false);
    const isProcessingRef = useRef(false);
    const userInputRef = useRef('');

    // Keep the onFinish ref up to date
    useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    const startQuiz = useCallback(() => {
        scoreRef.current = 0;
        wrongRef.current = 0;
        resultsRef.current = [];
        hasFinishedRef.current = false;
        isProcessingRef.current = false;
        setIsPlaying(true);
        setTimeLeft(100);
        setScore(0);
        setWrong(0);
        setResults([]);
        setUserInput('');
        setCurrentQuestion(generateQuestion());
        questionStartTimeRef.current = Date.now();
        endTimeRef.current = Date.now() + 100_000;

        // Start the countdown using a real-time approach
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
            const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timerRef.current!);
                timerRef.current = null;
                if (!hasFinishedRef.current) {
                    hasFinishedRef.current = true;
                    setIsPlaying(false);
                    onFinishRef.current(scoreRef.current, wrongRef.current, resultsRef.current);
                }
            }
        }, 250); // Check 4x per second for accurate countdown
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleKeyClick = useCallback((key: string) => {
        if (hasFinishedRef.current) return;

        // Check real time remaining
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        if (remaining <= 0) return;

        if (key === 'clear') {
            userInputRef.current = '';
            setUserInput('');
        } else if (key === 'enter') {
            const currentInput = userInputRef.current;
            if (isProcessingRef.current || currentInput === '' || !currentQuestion) return;
            isProcessingRef.current = true;

            const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000;

            // 🔥 CLEAR INPUT IMMEDIATELY
            userInputRef.current = '';
            setUserInput('');

            // Calculate correctness based on currentQuestion (stable)
            let isCorrect = false;
            if (currentQuestion.answer.includes('.')) {
                isCorrect = parseFloat(currentInput) === parseFloat(currentQuestion.answer);
            } else {
                isCorrect = currentInput === currentQuestion.answer;
            }

            const res: MathMasteryResult = {
                question: currentQuestion.question,
                answer: currentQuestion.answer,
                userAnswer: currentInput,
                isCorrect,
                timeTaken,
                category: currentQuestion.category
            };

            // ✅ UPDATE REFS (Side effects done safely outside updater)
            resultsRef.current = [...resultsRef.current, res];
            if (isCorrect) scoreRef.current++;
            else wrongRef.current++;

            // ✅ UPDATE STATE (For UI)
            setResults(prev => [...prev, res]);
            if (isCorrect) setScore(s => s + 1);
            else setWrong(w => w + 1);

            // ✅ ADVANCE QUESTION
            questionStartTimeRef.current = Date.now();
            setCurrentQuestion(generateQuestion());

            // Release lock after small delay
            setTimeout(() => { isProcessingRef.current = false; }, 200);
        } else {
            // Prevent multiple decimals
            if (key === '.' && userInputRef.current.includes('.')) return;
            if (userInputRef.current.length >= 8) return;
            if (key >= '0' && key <= '9' || key === '.') {
                userInputRef.current += key;
                setUserInput(userInputRef.current);
            }
        }
    }, [currentQuestion]);

    return {
        isPlaying,
        timeLeft,
        score,
        wrong,
        currentQuestion,
        userInput,
        startQuiz,
        handleKeyClick
    };
}
