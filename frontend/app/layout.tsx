import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OCIDProvider from "../components/OCIDProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Edu Dapp 🔥 | Nextjs & Hardhat 💻",
  description:
    "A starter kit for building decentralized applications (Dapps) on the Open Campus L3 chain, powered by create-edu-dapp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OCIDProvider>{children}</OCIDProvider>
      </body>
    </html>
  );
}
