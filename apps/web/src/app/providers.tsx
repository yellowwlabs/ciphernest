"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import config from "config"

export function Providers({ children }: { children: React.ReactNode }) {
  const appId =
    config.privyAppId || "";

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
