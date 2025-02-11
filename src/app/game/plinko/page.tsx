"use client";

import { useState, useEffect } from 'react';
import styles from '../../../styles/Plinko.module.css';

export default function PlinkoGame() {
  // Configurable constants:
  const numRows = 10;             // Number of rows in the peg pyramid.
  const verticalGap = 50;         // Vertical gap between rows (in pixels).
  const horizontalGap = 50;       // Horizontal gap between adjacent pegs.
  const boardWidth = 400;         // Fixed board width in pixels.
  const animationDelay = 500;     // Time (ms) between each row drop.
  const maxMultiplier = 100;      // Maximum payout multiplier for extreme slots.
  
  // Game state:
  // currentRow: which row the ball is currently in (0 means at the top; when it equals numRows the ball reached the bottom).
  const [currentRow, setCurrentRow] = useState<number>(-1);
  // moves: an array of booleans of length numRows (true = ball moves right, false = left).
  const [moves, setMoves] = useState<boolean[]>([]);
  // When the ball has finished falling, we compute a payout multiplier.
  const [finalMultiplier, setFinalMultiplier] = useState<number | null>(null);
  // Animation running flag.
  const [animating, setAnimating] = useState<boolean>(false);

  // Compute the ball's current peg index based on the moves so far.
  const getBallPegIndex = (): number => {
    let index = 0;
    for (let i = 0; i < currentRow; i++) {
      if (moves[i]) index++;
    }
    return index;
  };

  // Given a row index and peg index, compute the x-coordinate (in pixels)
  // of that peg relative to the board container.
  const getPegX = (row: number, pegIndex: number): number => {
    // In row r, there are (r+1) pegs. The total width spanned by the pegs is:
    const rowWidth = (row) * horizontalGap; // distance between first and last peg.
    // Center the row in boardWidth.
    const startX = (boardWidth - rowWidth) / 2;
    return startX + pegIndex * horizontalGap;
  };

  // Start the ball drop.
  const dropBall = () => {
    // Precompute the random moves for each row.
    const randomMoves = Array.from({ length: numRows }, () => Math.random() < 0.5);
    setMoves(randomMoves);
    // Start from row 0.
    setCurrentRow(0);
    setFinalMultiplier(null);
    setAnimating(true);
  };

  // Animate the ball dropping row by row.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (animating && currentRow >= 0 && currentRow < numRows) {
      timer = setTimeout(() => {
        setCurrentRow(currentRow + 1);
      }, animationDelay);
    } else if (animating && currentRow === numRows) {
      // Animation complete: calculate final slot (number of right moves).
      const rightCount = moves.filter((m) => m).length;
      // Using binomial intuition: if the ball landed exactly at the center (approx numRows/2 right moves),
      // the payout is low (e.g., 1x). The further from the center, the higher the multiplier.
      // We'll use a simple linear interpolation:
      const mid = numRows / 2;
      const deviation = Math.abs(rightCount - mid);
      // multiplier: 1x plus a factor of deviation; when deviation = mid, multiplier = maxMultiplier.
      const multiplier = 1 + (deviation / mid) * (maxMultiplier - 1);
      setFinalMultiplier(Number(multiplier.toFixed(2)));
      setAnimating(false);
    }
    return () => clearTimeout(timer);
  }, [animating, currentRow, numRows, moves, animationDelay, maxMultiplier]);

  // Reset the game.
  const resetGame = () => {
    setAnimating(false);
    setCurrentRow(-1);
    setMoves([]);
    setFinalMultiplier(null);
  };

  // Compute ball position: if currentRow < 0, ball is not displayed.
  const ballRow = currentRow > 0 ? currentRow - 1 : 0;
  const ballPegIndex = getBallPegIndex();
  const ballX = getPegX(ballRow, ballPegIndex);
  const ballY = currentRow * verticalGap;

  // Render the board: each row contains (r+1) pegs.
  const renderBoard = () => {
    const rows = [];
    for (let r = 0; r < numRows; r++) {
      const pegs = [];
      for (let i = 0; i <= r; i++) {
        const x = getPegX(r, i);
        const y = r * verticalGap;
        pegs.push(
          <div key={i} className={styles.peg} style={{ left: `${x}px`, top: `${y}px` }} />
        );
      }
      rows.push(<div key={r} className={styles.row}>{pegs}</div>);
    }
    return rows;
  };

  return (
    <div className={styles.container}>
      <h2>Plinko Ball Game</h2>
      <div className={styles.board} style={{ width: `${boardWidth}px`, height: `${numRows * verticalGap + 50}px` }}>
        {renderBoard()}
        {animating && currentRow >= 0 && (
          <div className={styles.ball} style={{ left: `${ballX}px`, top: `${ballY}px` }}>
            🔴
          </div>
        )}
      </div>
      <div className={styles.controls}>
        {!animating && currentRow === -1 && (
          <button onClick={dropBall} className={styles.button}>
            Drop Ball
          </button>
        )}
        {(!animating && currentRow === numRows && finalMultiplier !== null) && (
          <div className={styles.result}>
            <p>Final Multiplier: {finalMultiplier}x</p>
            <button onClick={resetGame} className={styles.button}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
