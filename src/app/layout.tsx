import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office Hours Heatmap",
  description: "Students say where they got stuck in one sentence. TAs see which misconception to explain first.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
