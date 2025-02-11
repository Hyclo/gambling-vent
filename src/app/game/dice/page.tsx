"use client";

import { useState, useRef } from 'react';
import styles from '../../../styles/Dice.module.css';

export default function DiceGame() {
  const [playerDice, setPlayerDice] = useState<number>(1);
  const [dealerDice, setDealerDice] = useState<number>(1);
  const [rolling, setRolling] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  
  // We'll use a ref to store the interval ID for the roll animation.
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: Return the corresponding dice emoji for a number (1-6)
  const getDiceEmoji = (n: number): string => {
    const emojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    return emojis[n - 1];
  };

  const rollDice = () => {
    setRolling(true);
    setResult("");

    // Start the animation: update dice values every 100ms.
    rollIntervalRef.current = setInterval(() => {
      setPlayerDice(Math.floor(Math.random() * 6) + 1);
      setDealerDice(Math.floor(Math.random() * 6) + 1);
    }, 100);

    // After 2 seconds, stop the animation and set final values.
    setTimeout(() => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
      }
      const finalPlayer = Math.floor(Math.random() * 6) + 1;
      const finalDealer = Math.floor(Math.random() * 6) + 1;
      setPlayerDice(finalPlayer);
      setDealerDice(finalDealer);
      
      // Determine outcome.
      if (finalPlayer > finalDealer) {
        setResult("You win!");
      } else if (finalPlayer < finalDealer) {
        setResult("You lose!");
      } else {
        setResult("It's a tie!");
      }
      
      setRolling(false);
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <h2>Dice Game</h2>
      <div className={styles.diceContainer}>
        <div className={styles.dice}>
          <span className={styles.diceFace}>
            {getDiceEmoji(playerDice)}
          </span>
          <p>Player</p>
        </div>
        <div className={styles.dice}>
          <span className={styles.diceFace}>
            {getDiceEmoji(dealerDice)}
          </span>
          <p>Dealer</p>
        </div>
      </div>
      <div className={styles.controls}>
        {!rolling && (
          <button onClick={rollDice} className={styles.button}>
            Roll Dice
          </button>
        )}
      </div>
      {result && <div className={styles.result}>{result}</div>}
    </div>
  );
}
