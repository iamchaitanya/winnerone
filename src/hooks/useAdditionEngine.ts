import { useState, useEffect, useCallback, useRef } from 'react';

interface Question {
  num1: number;
  num2: number;
  answer: number;
}

interface QuestionResult extends Question {
  userAnswer: number;
  isCorrect: boolean;
  timeTaken?: number;
}

export const useAdditionEngine = (onFinish: (score: number, wrong: number, results: QuestionResult[]) => void) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [isActive, setIsActive] = useState(false);
  const [sessionResults, setSessionResults] = useState<QuestionResult[]>([]);

  const lastQuestionTimeRef = useRef<number>(0);
  const endTimeRef = useRef<number>(0);
  const isSubmittingRef = useRef(false);

  // Refs to avoid stale closures in timer callback
  const scoreRef = useRef(0);
  const wrongRef = useRef(0);
  const resultsRef = useRef<QuestionResult[]>([]);
  const onFinishRef = useRef(onFinish);
  const hasFinishedRef = useRef(false);

  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  const generateQuestions = useCallback(() => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 100; i++) {
      const n1 = Math.floor(Math.random() * 90) + 10;
      const n2 = Math.floor(Math.random() * 90) + 10;
      newQuestions.push({ num1: n1, num2: n2, answer: n1 + n2 });
    }
    return newQuestions;
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

    const resultEntry = {
      ...currentQ,
      userAnswer: numericAns,
      isCorrect: correct,
      timeTaken
    };

    resultsRef.current = [...resultsRef.current, resultEntry];
    setSessionResults(prev => [...prev, resultEntry]);

    if (currentIndex < 99) {
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setUserInput('');
      }, 100);
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

  return {
    questions,
    currentIndex,
    userInput,
    score,
    timeLeft,
    isActive,
    startQuiz,
    handleKeyClick,
    sessionResults
  };
};