"use client";

import { useState, useEffect } from 'react';
import styles from '../../../styles/Shell.module.css';

type Phase = 'show' | 'mixing' | 'guessing' | 'result';

export default function CupGame() {
  // A round counter that resets the game when updated.
  const [round, setRound] = useState<number>(0);
  // Initially, choose a random cup index (0, 1, or 2) for the ball (shown during the "show" phase).
  const [initialBallCup, setInitialBallCup] = useState<number>(Math.floor(Math.random() * 3));
  // After mixing, assign a final cup (which might differ from the initial cup).
  const [finalBallCup, setFinalBallCup] = useState<number | null>(null);
  // Game phase: "show", "mixing", "guessing", or "result".
  const [phase, setPhase] = useState<Phase>('show');
  // Result message ("You win!" or "You lose!")
  const [result, setResult] = useState<string>('');

  // useEffect now depends on [round] so it re-runs after each reset.
  useEffect(() => {
    // Set up initial state for the new round.
    setInitialBallCup(Math.floor(Math.random() * 3));
    setFinalBallCup(null);
    setResult('');
    setPhase('show');

    // After 2 seconds, switch to the mixing phase.
    const showTimer = setTimeout(() => {
      setPhase('mixing');
      // After mixing for 2 seconds, assign a final random cup and switch to guessing phase.
      const mixTimer = setTimeout(() => {
        setFinalBallCup(Math.floor(Math.random() * 3));
        setPhase('guessing');
      }, 2000);
      // Clean up the mixTimer if needed.
      return () => clearTimeout(mixTimer);
    }, 800);

    return () => clearTimeout(showTimer);
  }, [round]);

  // Handle the player's click on a cup during the guessing phase.
  const handleCupClick = (cupIndex: number) => {
    if (phase !== 'guessing' || finalBallCup === null) return;
    if (cupIndex === finalBallCup) {
      setResult('You win!');
    } else {
      setResult('You lose!');
    }
    setPhase('result');
  };

  // Reset the game: increment the round counter to trigger the useEffect.
  const resetGame = () => {
    setRound((prev) => prev + 1);
  };

  return (
    <div className={styles.container}>
      <h2>Cup and Ball Game</h2>
      <div className={styles.cupContainer}>
        {[0, 1, 2].map((cupIndex) => {
          // Determine whether to show the ball.
          let showBall = false;
          if (phase === 'show' && cupIndex === initialBallCup) {
            showBall = true;
          }
          if (phase === 'result' && finalBallCup !== null && cupIndex === finalBallCup) {
            showBall = true;
          }
          // During the mixing phase, add a CSS class to trigger the spin animation.
          const cupClass = `${styles.cup} ${phase === 'mixing' ? styles.mix : ''}`;
          return (
            <div
              key={cupIndex}
              className={cupClass}
              onClick={() => phase === 'guessing' && handleCupClick(cupIndex)}
            >
              <div className={styles.cupTop}>🥤</div>
              {showBall && <div className={styles.ball}>⚽</div>}
            </div>
          );
        })}
      </div>
      {phase === 'guessing' && (
        <p className={styles.instruction}>Pick a cup where you think the ball is hiding.</p>
      )}
      {phase === 'result' && (
        <div className={styles.result}>
          <p>{result}</p>
          <button onClick={resetGame} className={styles.button}>Play Again</button>
        </div>
      )}
    </div>
  );
}
