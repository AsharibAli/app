import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OCIDProvider from "../components/OCIDProvider";
import Script from "next/script";

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
        <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-0D5VHKEZ6B"
      ></Script>
      <Script id="google-analytics">
        {`
   window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-0D5VHKEZ6B');
  `}
      </Script>
      <body className={inter.className}>
        <OCIDProvider>{children}</OCIDProvider>
      </body>
    </html>
  );
}
