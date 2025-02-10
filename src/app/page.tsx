// src/app/page.tsx
import GameCard from "../components/GameCard";
import styles from "../styles/Home.module.css";
import { games } from "./GameOverview";

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <h2 className={styles.title}>Select a Game</h2>
      <div className={styles.cardGrid}>
        {games.map((game, index) => (
          <GameCard
            key={index}
            title={game.title}
            description={game.description}
            href={game.href}
            imageUrl={game.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}
