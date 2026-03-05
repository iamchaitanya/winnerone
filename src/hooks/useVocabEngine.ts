import { useState, useEffect, useCallback, useRef } from 'react';

export interface VocabWord {
    word: string;
    meaning: string;
    definition?: string;
    synonyms?: string[];
    antonyms?: string[];
}

export interface VocabQuizQuestion {
    word: string;
    questionType: 'synonym' | 'antonym' | 'meaning';
    correctAnswer: string;
    options: string[];
    correctIndex: number;
    meaning: string;
}

export interface VocabResult {
    score: number;
    wrongCount: number;
    questions: (VocabQuizQuestion & { userAnswer: number; isCorrect: boolean })[];
}

function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

function generateQuestions(words: VocabWord[], allWords: VocabWord[], forceMeaning: boolean = false): VocabQuizQuestion[] {
    const questions: VocabQuizQuestion[] = [];
    const shuffled = shuffleArray(words);

    for (const word of shuffled) {
        let qType: 'synonym' | 'antonym' | 'meaning' = 'meaning';
        let correctAnswer = '';
        let correctList: string[] = [];

        if (forceMeaning) {
            qType = 'meaning';
            correctAnswer = word.meaning;
            correctList = [word.meaning];
        } else {
            // Decide synonym or antonym question
            const synonyms = word.synonyms || [];
            const antonyms = word.antonyms || [];
            const hasSynonyms = synonyms.length > 0;
            const hasAntonyms = antonyms.length > 0;

            if (hasSynonyms && hasAntonyms) {
                qType = Math.random() > 0.5 ? 'synonym' : 'antonym';
                correctList = qType === 'synonym' ? synonyms : antonyms;
                correctAnswer = correctList[Math.floor(Math.random() * correctList.length)];
            } else if (hasSynonyms) {
                qType = 'synonym';
                correctList = synonyms;
                correctAnswer = correctList[Math.floor(Math.random() * correctList.length)];
            } else if (hasAntonyms) {
                qType = 'antonym';
                correctList = antonyms;
                correctAnswer = correctList[Math.floor(Math.random() * correctList.length)];
            } else {
                qType = 'meaning';
                correctAnswer = word.meaning;
                correctList = [word.meaning];
            }
        }

        if (!correctAnswer) continue;

        // Generate wrong options from other words
        const wrongPool: string[] = [];
        for (const other of allWords) {
            if (other.word === word.word) continue;
            if (other.meaning) wrongPool.push(other.meaning);
            if (other.synonyms) wrongPool.push(...other.synonyms);
        }
        const uniqueWrong = [...new Set(wrongPool)].filter(w => w !== correctAnswer && !correctList.includes(w));
        const wrongOptions = shuffleArray(uniqueWrong).slice(0, 3);
        if (wrongOptions.length < 3) continue; // skip if not enough wrong options

        const allOptions = shuffleArray([correctAnswer, ...wrongOptions]);
        const correctIndex = allOptions.indexOf(correctAnswer);

        questions.push({ word: word.word, questionType: qType, correctAnswer, options: allOptions, correctIndex, meaning: word.meaning });
    }

    return questions;
}

export const useVocabEngine = (
    wordList: VocabWord[],
    wordsPerMonth: number,
    gameKey: string,
    onFinish: (result: VocabResult) => void,
    forceMeaning: boolean = false
) => {
    const [questions, setQuestions] = useState<VocabQuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(50);
    const [isActive, setIsActive] = useState(false);
    const [answered, setAnswered] = useState<number | null>(null);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);

    const endTimeRef = useRef(0);
    const hasFinishedRef = useRef(false);
    const onFinishRef = useRef(onFinish);
    const scoreRef = useRef(0);
    const wrongRef = useRef(0);
    const resultsRef = useRef<VocabResult['questions']>([]);

    useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    const getMonthlyWords = useCallback(() => {
        const now = new Date();
        const monthsSinceEpoch = (now.getFullYear() - 2024) * 12 + now.getMonth();
        const startIndex = (monthsSinceEpoch * wordsPerMonth) % wordList.length;
        return wordList.slice(startIndex, Math.min(startIndex + wordsPerMonth, wordList.length));
    }, [wordList, wordsPerMonth]);

    const startGame = useCallback(() => {
        hasFinishedRef.current = false;
        scoreRef.current = 0;
        wrongRef.current = 0;
        resultsRef.current = [];

        const monthWords = getMonthlyWords();
        const qs = generateQuestions(monthWords, wordList, forceMeaning);
        setQuestions(qs);
        setCurrentIndex(0);
        setScore(0);
        setWrongCount(0);
        setAnswered(null);
        setIsCorrectAnswer(null);

        endTimeRef.current = Date.now() + 50000;
        setTimeLeft(50);
        setIsActive(true);
    }, [getMonthlyWords, wordList]);

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
                    onFinishRef.current({ score: scoreRef.current, wrongCount: wrongRef.current, questions: resultsRef.current });
                }
            } else setTimeLeft(remaining);
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive]);

    const handleAnswer = useCallback((optionIndex: number) => {
        if (answered !== null || !isActive || hasFinishedRef.current || !questions[currentIndex]) return;

        const q = questions[currentIndex];
        const isCorrect = optionIndex === q.correctIndex;
        setAnswered(optionIndex);
        setIsCorrectAnswer(isCorrect);

        if (isCorrect) { scoreRef.current++; setScore(s => s + 1); }
        else { wrongRef.current++; setWrongCount(w => w + 1); }

        resultsRef.current.push({ ...q, userAnswer: optionIndex, isCorrect });

        if (!isCorrect) {
            // Wrong answer = stop game (per spec)
            setTimeout(() => {
                if (!hasFinishedRef.current) {
                    hasFinishedRef.current = true;
                    setIsActive(false);
                    onFinishRef.current({ score: scoreRef.current, wrongCount: wrongRef.current, questions: resultsRef.current });
                }
            }, 1200);
            return;
        }

        // Move to next question after delay
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(i => i + 1);
                setAnswered(null);
                setIsCorrectAnswer(null);
            } else {
                if (!hasFinishedRef.current) {
                    hasFinishedRef.current = true;
                    setIsActive(false);
                    onFinishRef.current({ score: scoreRef.current, wrongCount: wrongRef.current, questions: resultsRef.current });
                }
            }
        }, 800);
    }, [answered, isActive, questions, currentIndex]);

    return {
        questions,
        currentIndex,
        currentQuestion: questions[currentIndex] || null,
        score,
        wrongCount,
        timeLeft,
        isActive,
        answered,
        isCorrectAnswer,
        startGame,
        handleAnswer
    };
};
