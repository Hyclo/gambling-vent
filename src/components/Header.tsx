// src/components/Header.tsx
import Link from "next/link";
import styles from "../styles/Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.logo}>Gambling Vent</h1>
        <nav>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/">Home</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/game">Games</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/account">Account</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
