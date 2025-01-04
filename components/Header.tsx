import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserCircle } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full fixed top-0 bg-white z-50" role="banner">
      <div className="text-center mb-4 p-3 sm:p-4 border-b border-gray-300 relative">
        <Link 
          href="/" 
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          aria-label="Go to home page"
          role="button"
          title="Home"
        >
          <Image
            src="/eduhub.png"
            alt="EduHub Logo"
            width={32}
            height={32}
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        </Link>
        <Link 
          href="/user" 
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          aria-label="Go to user profile"
          role="button"
          title="User Profile"
        >
          <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 hover:text-teal-800 transition-colors" aria-hidden="true" />
        </Link>
        <h1 className="text-base sm:text-xl px-12 sm:px-16 line-clamp-2 sm:line-clamp-none">
          <span aria-label="Lightning bolt">⚡</span>A starter kit for building{" "}
          <strong className="text-teal-300 no-underline hover:underline hover:text-teal-700">
            (dApps)
          </strong>{" "}
          <span className="hidden sm:inline">on the Open Campus L3{" "}</span>
          <strong className="hidden sm:inline">
            <a
              href="https://educhain.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 no-underline hover:underline hover:text-teal-700"
              aria-label="Visit EduChain website (opens in new tab)"
            >
              (EduChain)
            </a>
          </strong>
          <span className="hidden sm:inline">, powered by{" "}</span>
          <strong className="hidden sm:inline">
            {" "}
            <a
              href="https://www.npmjs.com/package/create-edu-dapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 no-underline hover:underline hover:text-teal-700"
              aria-label="Visit create-edu-dapp on NPM (opens in new tab)"
            >
              create-edu-dapp <span aria-label="rocket">🚀</span>
            </a>
          </strong>
        </h1>
      </div>
    </header>
  );
};

export default Header;
