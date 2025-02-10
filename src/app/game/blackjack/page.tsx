"use client";

import { useState } from "react";
import styles from "../../../styles/Blackjack.module.css";

type Card = string; // e.g., "AS" for Ace of Spades, "10H" for Ten of Hearts, etc.

function createDeck(): Card[] {
  const suits = ["S", "H", "D", "C"]; // Spades, Hearts, Diamonds, Clubs
  const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  let deck: Card[] = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push(`${rank}${suit}`);
    }
  }
  return deck;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getCardValue(card: Card): number {
  const rank = card.slice(0, card.length - 1);
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank, 10);
}

function calculateHandValue(hand: Card[]): number {
  let total = hand.reduce((acc, card) => acc + getCardValue(card), 0);
  let aceCount = hand.filter((card) => card.startsWith("A")).length;
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }
  return total;
}

/**
 * Convert a card string (e.g., "AS", "10H", "KC") into its playing card emoji.
 * This uses the Unicode Playing Cards block.
 */
function getCardEmoji(card: Card): string {
  // Extract suit (last character) and rank (remaining part)
  const suit = card.slice(-1);
  const rank = card.slice(0, card.length - 1);
  // Base codepoints for each suit:
  const suitBases: { [key: string]: number } = {
    S: 0x1f0a0, // Spades
    H: 0x1f0b0, // Hearts
    D: 0x1f0c0, // Diamonds
    C: 0x1f0d0, // Clubs
  };
  function rankOffset(rank: string): number {
    if (rank === "A") return 1;
    if (rank === "J") return 11;
    if (rank === "Q") return 13;
    if (rank === "K") return 14;
    return parseInt(rank, 10); // For numbers 2-10
  }
  const base = suitBases[suit];
  if (!base) return card;
  const codePoint = base + rankOffset(rank);
  return String.fromCodePoint(codePoint);
}

export default function BlackjackGame() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<
    "notStarted" | "playerTurn" | "dealerTurn" | "ended"
  >("notStarted");
  const [message, setMessage] = useState<string>("");

  const startGame = () => {
    const newDeck = shuffle(createDeck());
    const playerCards = [newDeck[0], newDeck[2]];
    const dealerCards = [newDeck[1], newDeck[3]];
    setDeck(newDeck.slice(4));
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setGameState("playerTurn");
    setMessage("");
  };

  const hit = () => {
    if (gameState !== "playerTurn") return;
    if (deck.length === 0) return;
    const newCard = deck[0];
    const updatedHand = [...playerHand, newCard];
    setPlayerHand(updatedHand);
    setDeck(deck.slice(1));
    if (calculateHandValue(updatedHand) > 21) {
      setMessage("Bust! You lose.");
      setGameState("ended");
    }
  };

  const stand = () => {
    if (gameState !== "playerTurn") return;
    setGameState("dealerTurn");
    let dealerCards = [...dealerHand];
    let newDeck = [...deck];
    while (calculateHandValue(dealerCards) < 17 && newDeck.length > 0) {
      dealerCards.push(newDeck[0]);
      newDeck = newDeck.slice(1);
    }
    setDealerHand(dealerCards);
    setDeck(newDeck);
    const playerScore = calculateHandValue(playerHand);
    const dealerScore = calculateHandValue(dealerCards);
    let outcome = "";
    if (dealerScore > 21) {
      outcome = "Dealer busts! You win!";
    } else if (dealerScore === playerScore) {
      outcome = "Push (tie)!";
    } else if (playerScore > dealerScore) {
      outcome = "You win!";
    } else {
      outcome = "You lose!";
    }
    setMessage(`Player: ${playerScore} vs Dealer: ${dealerScore}. ${outcome}`);
    setGameState("ended");
  };

  const resetGame = () => {
    setDeck([]);
    setPlayerHand([]);
    setDealerHand([]);
    setGameState("notStarted");
    setMessage("");
  };

  return (
    <div className={styles.container}>
      <h2>Blackjack Game</h2>
      {gameState === "notStarted" && (
        <button onClick={startGame} className={styles.button}>
          Deal
        </button>
      )}
      {(gameState === "playerTurn" ||
        gameState === "dealerTurn" ||
        gameState === "ended") && (
        <div className={styles.handsContainer}>
          <div className={styles.hand}>
            <h3>Dealer's Hand</h3>
            <div className={styles.cards}>
              {dealerHand.map((card, index) => (
                <span key={index} className={styles.card}>
                  {getCardEmoji(card)}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.hand}>
            <h3>Your Hand</h3>
            <div className={styles.cards}>
              {playerHand.map((card, index) => (
                <span key={index} className={styles.card}>
                  {getCardEmoji(card)}
                </span>
              ))}
            </div>
            <p className={styles.score}>
              Score: {calculateHandValue(playerHand)}
            </p>
          </div>
        </div>
      )}
      {gameState === "playerTurn" && (
        <div className={styles.buttons}>
          <button onClick={hit} className={styles.button}>
            Hit
          </button>
          <button onClick={stand} className={styles.button}>
            Stand
          </button>
        </div>
      )}
      {gameState === "ended" && (
        <div className={styles.buttons}>
          <p className={styles.message}>{message}</p>
          <button onClick={resetGame} className={styles.button}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
