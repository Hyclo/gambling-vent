"use client";
// src/app/game/coin-flip/page.tsx
import { useState } from "react";
import styles from "../../../styles/CoinFlip.module.css";

export default function CoinFlipGame() {
  const [result, setResult] = useState<string | null>(null);

  const flipCoin = () => {
    // Randomly select between 'Heads' and 'Tails'
    const outcomes = ["Heads", "Tails"];
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    setResult(randomOutcome);
  };

  return (
    <div className={styles.container}>
      <h2>Coin Flip Game</h2>
      <button onClick={flipCoin} className={styles.button}>
        Flip Coin
      </button>
      {result && <p className={styles.result}>Result: {result}</p>}
    </div>
  );
}
