"use client";

import { useState } from "react";
import styles from "../../../styles/Roulette.module.css";

export default function RouletteGame() {
  // Toggle to switch layouts:
  // false → European (only "0"); true → American (with "0" and "00")
  const isAmerican = false;

  // Official red numbers for roulette (both European and American)
  const redNumbers = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);

  // Returns the official color for a given pocket value.
  const getRouletteColor = (value: number | string): string => {
    if (value === 0 || value === "0" || (isAmerican && value === "00")) {
      return "Green";
    }
    const num = typeof value === "number" ? value : parseInt(value, 10);
    return redNumbers.has(num) ? "Red" : "Black";
  };

  // State for the outcome of the spin.
  const [result, setResult] = useState<number | string | null>(null);
  const [resultColor, setResultColor] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  // Allow multiple bets at once: each bet can be a color ("Red", "Black", "Green") or a specific number.
  const [bets, setBets] = useState<(string | number)[]>([]);
  const [outcome, setOutcome] = useState<string>("");

  // Toggle a bet on/off.
  const toggleBet = (betValue: string | number) => {
    setBets((prev) => {
      if (prev.includes(betValue)) {
        return prev.filter((b) => b !== betValue);
      } else {
        return [...prev, betValue];
      }
    });
  };

  // Create grid of numbers arranged in 3 rows and 12 columns:
  // Row 1: 1, 4, 7, …, 34
  // Row 2: 2, 5, 8, …, 35
  // Row 3: 3, 6, 9, …, 36
  const rows = 3;
  const cols = 12;
  const orderedNumbers: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      orderedNumbers.push(c * rows + (r + 1));
    }
  }

  const spinWheel = () => {
    if (isSpinning) return;
    if (bets.length === 0) {
      alert("Please place at least one bet first!");
      return;
    }
    setIsSpinning(true);
    setOutcome("");
    setResult(null);
    setResultColor(null);

    // Simulate spinning delay
    setTimeout(() => {
      let randomValue: number | string;
      if (isAmerican) {
        // American roulette: 38 pockets: "0", "00", and numbers 1–36.
        const rand = Math.floor(Math.random() * 38);
        if (rand === 0) {
          randomValue = "0";
        } else if (rand === 1) {
          randomValue = "00";
        } else {
          randomValue = rand - 1; // Maps 2→1, 3→2, etc.
        }
      } else {
        // European roulette: 37 pockets: "0" and 1–36.
        const rand = Math.floor(Math.random() * 37);
        randomValue = rand; // 0 to 36
      }
      const color = getRouletteColor(randomValue);
      setResult(randomValue);
      setResultColor(color);
      setIsSpinning(false);

      // Check all selected bets for a win.
      const winningBets: (string | number)[] = [];
      bets.forEach((bet) => {
        // If the bet is a number (or string representing a number, e.g., "0" or "00")
        if (
          typeof bet === "number" ||
          (typeof bet === "string" && !["Red", "Black", "Green"].includes(bet))
        ) {
          if (String(bet) === String(randomValue)) {
            winningBets.push(bet);
          }
        } else if (typeof bet === "string") {
          // Color bet: compare to the result's color.
          if (bet === color) {
            winningBets.push(bet);
          }
        }
      });

      if (winningBets.length > 0) {
        setOutcome(`You won! Winning bet(s): ${winningBets.join(", ")}`);
      } else {
        setOutcome("You lost! None of your bets hit.");
      }
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <h2>Roulette Game</h2>

      <div className={styles.betSection}>
        <p>Place your bets:</p>

        {/* Color bet options */}
        <div className={styles.colorBets}>
          <span>Choose a color:</span>
          <div className={styles.betOptions}>
            {["Red", "Black", "Green"].map((col) => (
              <button
                key={col}
                onClick={() => toggleBet(col)}
                className={`${styles.betButton} ${
                  bets.includes(col) ? styles.selected : ""
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        {/* Number bet: roulette table input */}
        <div className={styles.numberBets}>
          <span>Or choose numbers:</span>
          <div className={styles.rouletteTable}>
            {/* Zero cell */}
            <div
              className={`${styles.zeroCell} ${
                bets.includes("0") ? styles.selected : ""
              }`}
              onClick={() => toggleBet("0")}
              style={{ backgroundColor: getRouletteColor("0").toLowerCase() }}
            >
              0
            </div>
            {/* American layout includes "00" */}
            {isAmerican && (
              <div
                className={`${styles.zeroCell} ${
                  bets.includes("00") ? styles.selected : ""
                }`}
                onClick={() => toggleBet("00")}
                style={{
                  backgroundColor: getRouletteColor("00").toLowerCase(),
                }}
              >
                00
              </div>
            )}
            {/* Number grid: 12 columns, 3 rows */}
            <div className={styles.numberGrid}>
              {orderedNumbers.map((num) => (
                <div
                  key={num}
                  className={`${styles.numberCell} ${
                    bets.includes(num) ? styles.selected : ""
                  }`}
                  onClick={() => toggleBet(num)}
                  style={{
                    backgroundColor: getRouletteColor(num).toLowerCase(),
                  }}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Roulette wheel display */}
      <div className={styles.wheel}>
        {isSpinning ? (
          <div className={styles.spinning}>Spinning...</div>
        ) : (
          result !== null && (
            <div className={styles.result}>
              <span className={styles.numberResult}>{result}</span>
              <span className={styles.resultColor}>{resultColor}</span>
            </div>
          )
        )}
      </div>

      <button
        onClick={spinWheel}
        className={styles.button}
        disabled={isSpinning || bets.length === 0}
      >
        {isSpinning ? "Spinning..." : "Spin"}
      </button>

      {outcome && <p className={styles.outcome}>{outcome}</p>}
    </div>
  );
}
