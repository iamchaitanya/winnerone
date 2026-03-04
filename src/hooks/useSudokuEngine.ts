import { useState, useEffect, useCallback, useRef } from 'react';
import { generateSudoku, SudokuPuzzle } from '../lib/sudokuGenerator';

type Grid = number[][];

export interface SudokuResult {
    correct: number;
    wrong: number;
    grid: Grid;
    solution: Grid;
    clues: boolean[][];
}

export const useSudokuEngine = (
    onFinish: (result: SudokuResult) => void
) => {
    const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null);
    const [grid, setGrid] = useState<Grid>([]);
    const [clues, setClues] = useState<boolean[][]>([]);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [timeLeft, setTimeLeft] = useState(100);
    const [isActive, setIsActive] = useState(false);

    const gridRef = useRef<Grid>([]);
    const puzzleRef = useRef<SudokuPuzzle | null>(null);
    const cluesRef = useRef<boolean[][]>([]);

    useEffect(() => { gridRef.current = grid; }, [grid]);
    useEffect(() => { puzzleRef.current = puzzle; }, [puzzle]);
    useEffect(() => { cluesRef.current = clues; }, [clues]);

    const endTimeRef = useRef<number>(0);
    const hasFinishedRef = useRef(false);
    const onFinishRef = useRef(onFinish);
    useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    const startGame = useCallback(() => {
        hasFinishedRef.current = false;
        const generated = generateSudoku(18);
        setPuzzle(generated);

        const initialGrid = generated.puzzle.map(row => [...row]);
        setGrid(initialGrid);

        // Track which cells are clues (pre-filled)
        const clueMap = generated.puzzle.map(row => row.map(cell => cell !== 0));
        setClues(clueMap);

        setSelectedCell(null);
        endTimeRef.current = Date.now() + 100000;
        setTimeLeft(100);
        setIsActive(true);
    }, []);

    // Timer
    useEffect(() => {
        if (!isActive) return;
        const interval = window.setInterval(() => {
            const now = Date.now();
            const remaining = Math.ceil((endTimeRef.current - now) / 1000);
            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
                // Auto-submit
                submitGrid();
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    const submitGrid = useCallback(() => {
        if (!puzzleRef.current || hasFinishedRef.current) return;
        hasFinishedRef.current = true;
        setIsActive(false);

        let correct = 0;
        let wrong = 0;
        const currentGrid = gridRef.current;
        const currentPuzzle = puzzleRef.current;
        const currentClues = cluesRef.current;

        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if (!currentClues[r][c]) { // Only count non-clue cells
                    if (currentGrid[r][c] === currentPuzzle.solution[r][c]) {
                        correct++;
                    } else {
                        wrong++; // includes unfilled (0) cells
                    }
                }
            }
        }

        onFinishRef.current({ correct, wrong, grid: currentGrid, solution: currentPuzzle.solution, clues: currentClues });
    }, []);

    const setCellValue = useCallback((row: number, col: number, value: number) => {
        if (!isActive || clues[row]?.[col]) return;
        setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            newGrid[row][col] = value;
            return newGrid;
        });
    }, [isActive, clues]);

    const clearCell = useCallback((row: number, col: number) => {
        if (!isActive || clues[row]?.[col]) return;
        setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            newGrid[row][col] = 0;
            return newGrid;
        });
    }, [isActive, clues]);

    return {
        grid,
        clues,
        selectedCell,
        setSelectedCell,
        timeLeft,
        isActive,
        startGame,
        setCellValue,
        clearCell,
        submitGrid,
        puzzle
    };
};
