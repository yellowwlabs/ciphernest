"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export function Providers({
  children,
  appId,
}: {
  children: React.ReactNode;
  appId: string;
}) {
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
