// 6×6 Sudoku Generator with unique solution guarantee
// Grid is divided into six 2×3 boxes

type Grid = number[][];

const GRID_SIZE = 6;
const BOX_ROWS = 2;
const BOX_COLS = 3;

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
    // Check row
    for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[row][c] === num) return false;
    }
    // Check column
    for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r][col] === num) return false;
    }
    // Check 2×3 box
    const boxRowStart = Math.floor(row / BOX_ROWS) * BOX_ROWS;
    const boxColStart = Math.floor(col / BOX_COLS) * BOX_COLS;
    for (let r = boxRowStart; r < boxRowStart + BOX_ROWS; r++) {
        for (let c = boxColStart; c < boxColStart + BOX_COLS; c++) {
            if (grid[r][c] === num) return false;
        }
    }
    return true;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function solveSudoku(grid: Grid): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 0) {
                for (let num = 1; num <= GRID_SIZE; num++) {
                    if (isValid(grid, r, c, num)) {
                        grid[r][c] = num;
                        if (solveSudoku(grid)) return true;
                        grid[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function fillGrid(grid: Grid): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 0) {
                const nums = shuffle([1, 2, 3, 4, 5, 6]);
                for (const num of nums) {
                    if (isValid(grid, r, c, num)) {
                        grid[r][c] = num;
                        if (fillGrid(grid)) return true;
                        grid[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function countSolutions(grid: Grid, limit: number): number {
    let count = 0;

    function solve(): boolean {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) {
                    for (let num = 1; num <= GRID_SIZE; num++) {
                        if (isValid(grid, r, c, num)) {
                            grid[r][c] = num;
                            if (solve()) return true;
                            grid[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        count++;
        return count >= limit;
    }

    solve();
    return count;
}

function createEmptyGrid(): Grid {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function cloneGrid(grid: Grid): Grid {
    return grid.map(row => [...row]);
}

export interface SudokuPuzzle {
    puzzle: Grid;    // The puzzle with clues (0 = empty)
    solution: Grid;  // The complete solution
}

export function generateSudoku(clueCount: number = 18): SudokuPuzzle {
    // Step 1: Generate a complete valid grid
    const solution = createEmptyGrid();
    fillGrid(solution);

    // Step 2: Remove cells while ensuring unique solution
    const puzzle = cloneGrid(solution);
    const totalCells = GRID_SIZE * GRID_SIZE; // 36
    const cellsToRemove = totalCells - clueCount; // 18

    // Create a list of all cell positions and shuffle them
    const positions: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            positions.push([r, c]);
        }
    }
    const shuffledPositions = shuffle(positions);

    let removed = 0;
    for (const [r, c] of shuffledPositions) {
        if (removed >= cellsToRemove) break;

        const backup = puzzle[r][c];
        puzzle[r][c] = 0;

        // Check if puzzle still has a unique solution
        const testGrid = cloneGrid(puzzle);
        const solutions = countSolutions(testGrid, 2);

        if (solutions === 1) {
            removed++;
        } else {
            // Restore — removing this cell creates ambiguity
            puzzle[r][c] = backup;
        }
    }

    // If we couldn't remove enough cells (rare), try again
    if (removed < cellsToRemove) {
        return generateSudoku(clueCount);
    }

    return { puzzle, solution };
}

export function validateGrid(grid: Grid, solution: Grid): { correct: number; wrong: number } {
    let correct = 0;
    let wrong = 0;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] !== 0) {
                if (grid[r][c] === solution[r][c]) {
                    // This could be a clue or a correct fill — we only count non-clue cells
                    // The caller should track which cells were clues
                } else {
                    wrong++;
                }
            }
        }
    }

    return { correct, wrong };
}
