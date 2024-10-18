"use client";
// components/OCIDProvider.tsx
import { FC, ReactNode } from "react";
import { OCConnect } from "@opencampus/ocid-connect-js";

interface OCIDProviderProps {
  children: ReactNode;
}

const opts = {
  redirectUri: "https://demo.ced.asharib.xyz/redirect",
  referralCode: "ASHARIB",
};

const OCIDProvider: FC<OCIDProviderProps> = ({ children }) => (
  <OCConnect opts={opts}>{children}</OCConnect>
);

export default OCIDProvider;
