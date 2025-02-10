"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../../../styles/Crash.module.css";

/**
 * Returns a crash multiplier using a weighted random selection.
 * The distribution is:
 *   - 1.00x – 1.50x: 40%
 *   - 1.51x – 2.50x: 30%
 *   - 2.51x – 5.00x: 15%
 *   - 5.01x – 10.00x: 10%
 *   - 10.01x – 50.00x: 4%
 *   - 50.01x – 1000x: 1%
 *
 * @param houseEdge A value between 0 and 1 representing the house edge (e.g., 0.02 for 2%)
 * @returns The crash multiplier adjusted for the house edge.
 */
function weightedCrashMultiplier(houseEdge: number = 0): number {
  const r = Math.random();
  let multiplier: number;
  if (r < 0.4) {
    multiplier = 1.0 + Math.random() * (1.5 - 1.0);
  } else if (r < 0.7) {
    multiplier = 1.51 + Math.random() * (2.5 - 1.51);
  } else if (r < 0.85) {
    multiplier = 2.51 + Math.random() * (5.0 - 2.51);
  } else if (r < 0.95) {
    multiplier = 5.01 + Math.random() * (10.0 - 5.01);
  } else if (r < 0.99) {
    multiplier = 10.01 + Math.random() * (50.0 - 10.01);
  } else {
    multiplier = 50.01 + Math.random() * (1000.0 - 50.01);
  }
  return multiplier * (1 - houseEdge);
}

export default function CrashGame() {
  // Game state variables
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [crashed, setCrashed] = useState<boolean>(false);
  const [cashedOut, setCashedOut] = useState<boolean>(false);
  const [crashPoint, setCrashPoint] = useState<number>(0);
  const [cashOutValue, setCashOutValue] = useState<number | null>(null);

  // Refs for animation frame, start time, and acceleration factor.
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const factorRef = useRef<number>(1500); // Default factor

  /**
   * Starts a new game round:
   * - Uses weightedCrashMultiplier to determine a crash point.
   * - Adjusts the acceleration factor if the crash point is low.
   * - Resets state and starts the animation loop.
   */
  const startGame = () => {
    // Set house edge to 2% (adjust as needed)
    const rawCrash = weightedCrashMultiplier(0.02);
    // If rawCrash is less than 5 (the default multiplier at 3000ms with factor 1500),
    // adjust factor so that at 3000ms, multiplier = rawCrash.
    let factor = 1500;
    if (rawCrash < 5) {
      factor = 3000 / Math.sqrt(rawCrash - 1); // Solve 1 + (3000/factor)² = rawCrash
    }
    factorRef.current = factor;
    setCrashPoint(rawCrash);
    setMultiplier(1.0);
    setCrashed(false);
    setCashedOut(false);
    setCashOutValue(null);
    setIsPlaying(true);
    startTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  /**
   * Animation loop.
   * Computes multiplier = 1 + (elapsed / factor)² (quadratic acceleration).
   * Ensures that at least 3000ms have elapsed before allowing a crash.
   */
  const animate = (time: number) => {
    const elapsed = time - startTimeRef.current;
    const newMultiplier = 1 + Math.pow(elapsed / factorRef.current, 2);
    setMultiplier(Number(newMultiplier.toFixed(2)));

    // Only allow a crash if at least 3000ms have passed.
    if (elapsed >= 3000 && newMultiplier >= crashPoint) {
      setCrashed(true);
      setIsPlaying(false);
      return; // End animation loop
    }

    // Continue animation if game is active.
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  /**
   * Cash out: stops the animation and records the current multiplier.
   */
  const cashOut = () => {
    if (!isPlaying || cashedOut || crashed) return;
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    setCashOutValue(multiplier);
    setCashedOut(true);
    setIsPlaying(false);
  };

  /**
   * Reset the game state for a new round.
   */
  const resetGame = () => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    setMultiplier(1.0);
    setCrashed(false);
    setCashedOut(false);
    setCashOutValue(null);
    setCrashPoint(0);
    setIsPlaying(false);
  };

  // Clean up the animation frame when the component unmounts.
  useEffect(() => {
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Compute the rocket's vertical translation based on the multiplier.
  const rocketTranslate = `translateY(-${(multiplier - 1) * 30}px)`;

  return (
    <div className={styles.container}>
      <h2>Crash Game</h2>
      <div className={styles.multiplierDisplay}>
        {crashed
          ? "Multiplier: " + crashPoint.toFixed(2) + "x"
          : multiplier + "x"}
      </div>

      {/* Rocket display */}
      <div className={styles.rocketContainer}>
        <span className={styles.rocket} style={{ transform: rocketTranslate }}>
          🚀
        </span>
      </div>

      {/* Game controls */}
      <div className={styles.controls}>
        {!isPlaying && !crashed && !cashedOut && (
          <button onClick={startGame} className={styles.button}>
            Start Game
          </button>
        )}
        {isPlaying && (
          <button onClick={cashOut} className={styles.button}>
            Cash Out
          </button>
        )}
        {((!isPlaying && (crashed || cashedOut)) || !isPlaying) && (
          <button onClick={resetGame} className={styles.button}>
            Reset
          </button>
        )}
      </div>

      {/* Outcome display */}
      <div className={styles.outcome}>
        {crashed && <p>Game Crashed at {crashPoint.toFixed(2)}x! You lost!</p>}
        {cashedOut && cashOutValue && (
          <p>You cashed out at {cashOutValue.toFixed(2)}x! You win!</p>
        )}
      </div>
    </div>
  );
}
