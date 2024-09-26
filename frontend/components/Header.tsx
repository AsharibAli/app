import React from "react";

const Header = () => {
  return (
    <div className="w-full fixed top-0 bg-white z-50">
      <div className="text-center mb-4 p-4 border-b border-gray-300 text-xl">
        <h1>
          ⚡A starter kit for building{" "}
          <strong className="text-teal-300 no-underline hover:underline hover:text-teal-700">
            (Dapps)
          </strong>{" "}
          on the Open Campus L3{" "}
          <strong>
            <a
              href="https://www.opencampus.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 no-underline hover:underline hover:text-teal-700"
            >
              (EduChain)
            </a>
          </strong>
          , powered by{" "}
          <strong>
            {" "}
            <a
              href="https://www.npmjs.com/package/create-edu-dapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 no-underline hover:underline hover:text-teal-700"
            >
              create-edu-dapp 🚀
            </a>
          </strong>
        </h1>
      </div>
    </div>
  );
};

export default Header;
