import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { AuthHandler } from "@/components/auth-handler";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Amigos do Chapim",
  description: "Uma organização sem fins lucrativos dedicada a facilitar o acesso às artes através da entreajuda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${lora.variable} antialiased`}
      >
        <AuthHandler />
        {children}
      </body>
    </html>
  );
}
