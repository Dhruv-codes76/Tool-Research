"use client";

import { ReactNode } from "react";
import { SavedToolsProvider } from "@/components/tools/SavedToolsProvider";

export const Providers = ({ children }: { children: ReactNode }) => {
  return <SavedToolsProvider>{children}</SavedToolsProvider>;
};
