"use client";

import { useState, useEffect } from "react";
import styles from "../../../styles/Mines.module.css";

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
}

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

function generateBoard(mineCount: number): Cell[] {
  // Initialize board with safe cells.
  const board: Cell[] = Array(TOTAL_CELLS)
    .fill(null)
    .map(() => ({ isMine: false, isRevealed: false }));

  // Randomly place the specified number of mines.
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const randomIndex = Math.floor(Math.random() * TOTAL_CELLS);
    if (!board[randomIndex].isMine) {
      board[randomIndex].isMine = true;
      minesPlaced++;
    }
  }
  return board;
}

export default function MinesGame() {
  // Default mine count (user can change this via the input field).
  const [mineCount, setMineCount] = useState<number>(5);
  const [board, setBoard] = useState<Cell[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Generate a new board when the component mounts or when mineCount changes.
  useEffect(() => {
    setBoard(generateBoard(mineCount));
    setGameOver(false);
    setGameWon(false);
  }, [mineCount]);

  const handleCellClick = (index: number) => {
    if (gameOver || gameWon) return;

    const newBoard = [...board];
    if (newBoard[index].isRevealed) return;
    newBoard[index].isRevealed = true;
    setBoard(newBoard);

    // If a mine is clicked, the game is over.
    if (newBoard[index].isMine) {
      setGameOver(true);
    } else {
      // Check win condition: if the number of safe cells revealed equals the total safe cells.
      const safeCellsRevealed = newBoard.filter(
        (cell) => cell.isRevealed && !cell.isMine
      ).length;
      if (safeCellsRevealed === TOTAL_CELLS - mineCount) {
        setGameWon(true);
      }
    }
  };

  // For this version the "Take Profit" button simply resets the game.
  const takeProfit = () => {
    setBoard(generateBoard(mineCount));
    setGameOver(false);
    setGameWon(false);
  };

  return (
    <div className={styles.container}>
      <h2>Mines Game</h2>

      {/* Controls: input field for mine count and a button to "take profit" (reset) */}
      <div className={styles.controls}>
        <label htmlFor="mineCount">Number of Mines:</label>
        <input
          type="number"
          id="mineCount"
          value={mineCount}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            // Ensure a minimum of 1 and a maximum of TOTAL_CELLS - 1
            if (value >= 1 && value < TOTAL_CELLS) {
              setMineCount(value);
            }
          }}
          min="1"
          max={TOTAL_CELLS - 1}
        />
        <button onClick={takeProfit} className={styles.takeProfitButton}>
          {gameOver ? "Reset" : "Take Proft"}
        </button>
      </div>

      {/* Grid display */}
      <div className={styles.grid}>
        {board.map((cell, index) => (
          <div
            key={index}
            className={`${styles.cell} ${
              cell.isRevealed ? styles.revealed : ""
            }`}
            onClick={() => handleCellClick(index)}
          >
            {cell.isRevealed && cell.isMine ? "💣" : ""}
            {cell.isRevealed && !cell.isMine ? "💎" : ""}
          </div>
        ))}
      </div>

      {gameOver && <p className={styles.message}>Game Over! You hit a mine.</p>}
      {gameWon && (
        <p className={styles.message}>
          Congratulations! You've cleared all safe cells!
        </p>
      )}
    </div>
  );
}
