import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OCIDProvider from "../components/OCIDProvider";
import Script from "next/script";
import Banner from "@/components/Banner";
import { BannerProvider } from "@/components/BannerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EduHub dApp 🔥",
  description:
    "⚡EduHub is building community and developer tools for EduChain 🚀",
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
        <OCIDProvider>
          <BannerProvider>
            <Banner />
            {children}
          </BannerProvider>
        </OCIDProvider>
      </body>
    </html>
  );
}
