"use client";
// components/OCIDProvider.tsx
import { FC, ReactNode } from "react";
import { OCConnect } from "@opencampus/ocid-connect-js";

interface OCIDProviderProps {
  children: ReactNode;
}

const opts = {
  redirectUri: "https://demo.ced.asharib.xyz/redirect",
};

const OCIDProvider: FC<OCIDProviderProps> = ({ children }) => (
  <OCConnect opts={opts} sandboxMode={true}>
    {children}
  </OCConnect>
);

export default OCIDProvider;
