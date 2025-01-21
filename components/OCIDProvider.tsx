"use client";
// components/OCIDProvider.tsx
import { FC, ReactNode } from "react";
import { OCConnect } from "@opencampus/ocid-connect-js";

interface OCIDProviderProps {
  children: ReactNode;
}

const opts = {
  redirectUri: "https://app.eduhub.dev/redirect",
  referralCode: "5C7KSI",
};

const OCIDProvider: FC<OCIDProviderProps> = ({ children }) => (
  <OCConnect opts={opts}>{children}</OCConnect>
);

export default OCIDProvider;
