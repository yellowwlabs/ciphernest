"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

export default function Home() {
  const { ready, authenticated, user, login, logout, getAccessToken } =
    usePrivy();
  const [apiResponse, setApiResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const testAuthApi = async () => {
    setLoading(true);
    setApiResponse(null);
    try {
      const token = await getAccessToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/@me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      const error = err as Error;
      setApiResponse({ error: error.message || "Failed to contact API" });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans p-6">
      <main className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 text-3xl font-bold">
            🪺
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Cipher Nest
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Full-Stack Privy Authentication Demo
            </p>
          </div>

          {!authenticated ? (
            <div className="w-full flex flex-col gap-4 mt-4">
              <button
                type="button"
                onClick={login}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
              >
                Sign In with Privy
              </button>
              <p className="text-xs text-zinc-400">
                Supports email, social logins, and web3 wallets.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6 mt-4 text-left">
              <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  User Profile
                </h3>
                <div className="flex flex-col gap-2 text-sm bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900">
                  <div>
                    <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                      Privy ID:
                    </span>{" "}
                    <code className="text-xs text-zinc-800 dark:text-zinc-300 break-all">
                      {user?.id}
                    </code>
                  </div>
                  {user?.email && (
                    <div>
                      <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                        Email:
                      </span>{" "}
                      <span className="text-zinc-800 dark:text-zinc-300">
                        {user.email.address}
                      </span>
                    </div>
                  )}
                  {user?.wallet && (
                    <div>
                      <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                        Wallet:
                      </span>{" "}
                      <code className="text-xs text-zinc-800 dark:text-zinc-300 break-all">
                        {user.wallet.address}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Backend Authentication Test
                </h3>
                <button
                  type="button"
                  onClick={testAuthApi}
                  disabled={loading}
                  className="w-full py-2.5 px-4 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 active:bg-zinc-100 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Call Authenticated API (/me)"}
                </button>

                {apiResponse !== null && (
                  <pre className="text-xs bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 overflow-x-auto text-zinc-800 dark:text-zinc-300 max-h-48">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                )}
              </div>

              <button
                type="button"
                onClick={logout}
                className="w-full py-2.5 px-4 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-medium rounded-xl transition-all cursor-pointer text-center text-sm"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
