// src/components/GameCard.tsx
import Link from "next/link";
import styles from "../styles/GameCard.module.css";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  imageUrl?: string;
}

export default function GameCard({
  title,
  description,
  href,
  imageUrl,
}: GameCardProps) {
  return (
    <Link href={href} className={styles.card}>
      <img src={imageUrl} alt={title} className={styles.cardImage} />
      <div className={styles.cardContent}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
}
