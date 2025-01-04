import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <footer className="footer text-center p-4 mt-8 w-full bg-white ">
      <div className="flex items-center justify-center space-x-4">
        <Image
          src="https://www.opencampus.xyz/static/media/coin-logo.39cbd6c42530e57817a5b98ac7621ca7.svg"
          alt="logo"
          width="50"
          height="50"
        />
        <h1 className="text-xl text-black">
          Build with ❤️ by{" "}
          <strong>
            <a
              href="https://eduhub.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 no-underline hover:underline hover:text-teal-700"
            >
              EduHub
            </a>{" "}
          </strong>
          , Follow us on{" "}
          <a
            className="text-teal-300 no-underline hover:underline hover:text-teal-700"
            href="https://x.com/eduhub__"
            target="_blank"
            rel="noopener noreferrer"
          >
            X (Twitter)
          </a>
        </h1>
        <Image
          src="https://www.opencampus.xyz/static/media/coin-logo.39cbd6c42530e57817a5b98ac7621ca7.svg"
          alt="logo"
          width="50"
          height="50"
        />
      </div>
    </footer>
  );
};

export default Footer;
