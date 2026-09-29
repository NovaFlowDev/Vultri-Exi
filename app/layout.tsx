import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vult-Exi — Solidity Security Scanner",
  description: "Static analysis plus LLM explanations for Solidity contracts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
