// src/app/layout.tsx
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { ReactNode } from "react";

export const metadata = {
  title: "Safe Gambling",
  description: "Simulated gambling with in-game currency",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#121212", color: "#fff" }}>
        <Header />
        <main style={{ padding: "2rem" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
