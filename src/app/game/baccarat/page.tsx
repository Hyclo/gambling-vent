"use client";

import { useState } from 'react';
import styles from '../../../styles/Baccarat.module.css';

// Create a standard 52-card deck (cards are represented as "RS", e.g. "AS" for Ace of Spades)
function createDeck(): string[] {
  const suits = ['S', 'H', 'D', 'C']; // Spades, Hearts, Diamonds, Clubs
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: string[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(`${rank}${suit}`);
    }
  }
  return deck;
}

// Shuffle the deck using Fisher–Yates algorithm.
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Baccarat card value: Ace=1, 2–9 at face value, 10/J/Q/K = 0.
function getBaccaratValue(card: string): number {
  const rank = card.slice(0, card.length - 1);
  if (rank === 'A') return 1;
  if (['10', 'J', 'Q', 'K'].includes(rank)) return 0;
  return parseInt(rank, 10);
}

// Calculate a hand's total, modulo 10.
function calculateTotal(hand: string[]): number {
  const sum = hand.reduce((acc, card) => acc + getBaccaratValue(card), 0);
  return sum % 10;
}

/**
 * Convert a card code (e.g. "AS", "10H") to a Unicode playing card emoji.
 * (This method uses base code points for each suit. Note that not all cards have
 * a corresponding emoji in the Unicode Playing Cards block, so you might need
 * to adjust this mapping for full coverage.)
 */
function getCardEmoji(card: string): string {
  const suit = card.slice(-1);
  const rank = card.slice(0, card.length - 1);
  const suitBases: { [key: string]: number } = {
    S: 0x1F0A0,
    H: 0x1F0B0,
    D: 0x1F0C0,
    C: 0x1F0D0,
  };
  function rankOffset(r: string): number {
    if (r === 'A') return 1;
    if (r === 'J') return 11;
    if (r === 'Q') return 13;
    if (r === 'K') return 14;
    return parseInt(r, 10);
  }
  const base = suitBases[suit];
  if (!base) return card;
  const codePoint = base + rankOffset(rank);
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return card;
  }
}

type BetOption = 'Player' | 'Banker' | 'Tie' | '';

export default function BaccaratGame() {
  // Game states
  const [betOption, setBetOption] = useState<BetOption>('');
  const [playerHand, setPlayerHand] = useState<string[]>([]);
  const [bankerHand, setBankerHand] = useState<string[]>([]);
  const [result, setResult] = useState<string>('');
  const [gameState, setGameState] = useState<'notStarted' | 'dealt'>('notStarted');

  const deal = () => {
    if (!betOption) {
      alert('Please select a bet option.');
      return;
    }
    let deck = shuffle(createDeck());
    // Initial deal: two cards each.
    let pHand = [deck[0], deck[2]];
    let bHand = [deck[1], deck[3]];
    let index = 4;
    let pTotal = calculateTotal(pHand);
    let bTotal = calculateTotal(bHand);

    // If a natural (8 or 9) occurs for either hand, no further cards are drawn.
    if (pTotal < 8 && bTotal < 8) {
      // Player's third card rule:
      let playerThird: string | undefined;
      if (pTotal <= 5) {
        playerThird = deck[index++];
        pHand.push(playerThird);
        pTotal = calculateTotal(pHand);
      }
      // Banker's third card rule:
      if (playerThird === undefined) {
        // Player stood: Banker draws if total <= 5.
        if (bTotal <= 5) {
          const bankerThird = deck[index++];
          bHand.push(bankerThird);
          bTotal = calculateTotal(bHand);
        }
      } else {
        // Player drew a third card.
        const p3Value = getBaccaratValue(playerThird);
        if (bTotal <= 2) {
          const bankerThird = deck[index++];
          bHand.push(bankerThird);
          bTotal = calculateTotal(bHand);
        } else if (bTotal === 3) {
          if (p3Value !== 8) {
            const bankerThird = deck[index++];
            bHand.push(bankerThird);
            bTotal = calculateTotal(bHand);
          }
        } else if (bTotal === 4) {
          if (p3Value >= 2 && p3Value <= 7) {
            const bankerThird = deck[index++];
            bHand.push(bankerThird);
            bTotal = calculateTotal(bHand);
          }
        } else if (bTotal === 5) {
          if (p3Value >= 4 && p3Value <= 7) {
            const bankerThird = deck[index++];
            bHand.push(bankerThird);
            bTotal = calculateTotal(bHand);
          }
        } else if (bTotal === 6) {
          if (p3Value === 6 || p3Value === 7) {
            const bankerThird = deck[index++];
            bHand.push(bankerThird);
            bTotal = calculateTotal(bHand);
          }
        }
        // If bTotal is 7, Banker always stands.
      }
    }

    // Determine outcome.
    const outcomeMessage =
      pTotal > bTotal
        ? 'Player wins!'
        : pTotal < bTotal
        ? 'Banker wins!'
        : 'Tie!';
    let betMessage = '';
    if (betOption === 'Player') {
      betMessage = outcomeMessage === 'Player wins!'
        ? 'Your Player bet wins (1:1 payout)!'
        : 'Your Player bet loses.';
    } else if (betOption === 'Banker') {
      betMessage = outcomeMessage === 'Banker wins!'
        ? 'Your Banker bet wins (1:1 payout, minus 5% commission)!'
        : 'Your Banker bet loses.';
    } else if (betOption === 'Tie') {
      betMessage = outcomeMessage === 'Tie!'
        ? 'Your Tie bet wins (8:1 payout)!'
        : 'Your Tie bet loses.';
    }

    setPlayerHand(pHand);
    setBankerHand(bHand);
    setResult(`${outcomeMessage} ${betMessage}`);
    setGameState('dealt');
  };

  const resetGame = () => {
    setPlayerHand([]);
    setBankerHand([]);
    setResult('');
    setGameState('notStarted');
    setBetOption('');
  };

  return (
    <div className={styles.container}>
      <h2>Baccarat Game</h2>
      {gameState === 'notStarted' && (
        <div className={styles.betSelection}>
          <p>Select your bet:</p>
          <div className={styles.options}>
            <label>
              <input
                type="radio"
                name="bet"
                value="Player"
                checked={betOption === 'Player'}
                onChange={() => setBetOption('Player')}
              />
              Player
            </label>
            <label>
              <input
                type="radio"
                name="bet"
                value="Banker"
                checked={betOption === 'Banker'}
                onChange={() => setBetOption('Banker')}
              />
              Banker
            </label>
            <label>
              <input
                type="radio"
                name="bet"
                value="Tie"
                checked={betOption === 'Tie'}
                onChange={() => setBetOption('Tie')}
              />
              Tie
            </label>
          </div>
          <button onClick={deal} className={styles.button}>
            Deal
          </button>
        </div>
      )}
      {gameState === 'dealt' && (
        <>
          <div className={styles.handsContainer}>
            <div className={styles.hand}>
              <h3>Player's Hand</h3>
              <div className={styles.cards}>
                {playerHand.map((card, index) => (
                  <span key={index} className={styles.card}>
                    {getCardEmoji(card)}
                  </span>
                ))}
              </div>
              <p className={styles.total}>Total: {calculateTotal(playerHand)}</p>
            </div>
            <div className={styles.hand}>
              <h3>Banker's Hand</h3>
              <div className={styles.cards}>
                {bankerHand.map((card, index) => (
                  <span key={index} className={styles.card}>
                    {getCardEmoji(card)}
                  </span>
                ))}
              </div>
              <p className={styles.total}>Total: {calculateTotal(bankerHand)}</p>
            </div>
          </div>
          <div className={styles.result}>{result}</div>
          <button onClick={resetGame} className={styles.button}>
            Reset
          </button>
        </>
      )}
    </div>
  );
}
