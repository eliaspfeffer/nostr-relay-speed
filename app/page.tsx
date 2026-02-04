"use client";

import { useCallback, useEffect, useState } from "react";
import { discoverRelays, type RelayInfo } from "@/lib/relay-discovery";
import { measureAllRelays, type MeasureResult } from "@/lib/measure-relay";
import { Leaderboard, type LeaderboardRow } from "@/components/Leaderboard";

const BOOTSTRAP_RELAY = process.env.NEXT_PUBLIC_BOOTSTRAP_RELAY;

export default function Home() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!BOOTSTRAP_RELAY || BOOTSTRAP_RELAY.trim() === "") {
      setError("NEXT_PUBLIC_BOOTSTRAP_RELAY is not set. Add it to .env.local (see .env.example).");
      return;
    }

    setError(null);
    setLoading(true);
    setRows([]);

    try {
      const infos = await discoverRelays(BOOTSTRAP_RELAY.trim());
      if (infos.length === 0) {
        setError("No NIP-66 kind 30166 relay metadata found on the bootstrap relay. Try another relay.");
        setLoading(false);
        return;
      }

      const initialRows: LeaderboardRow[] = infos.map((info) => ({
        url: info.url,
        latencyMs: null,
        error: null,
        rttOpenMs: info.rttOpenMs,
        rttReadMs: info.rttReadMs,
        rttWriteMs: info.rttWriteMs,
      }));
      setRows(initialRows);

      await measureAllRelays(
        infos.map((i) => i.url),
        (url, result: MeasureResult) => {
          setRows((prev) =>
            prev.map((r) =>
              r.url === url
                ? {
                    ...r,
                    latencyMs: result.latencyMs,
                    error: result.error,
                  }
                : r
            )
          );
          setCurrentUrl(url);
        }
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
      setCurrentUrl(null);
    }
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Nostr relay speed
          </h1>
          <p className="text-[var(--muted)] text-sm">
            NIP-66 discovery (kind 30166) → measure RTT to 21 relays → leaderboard vs reported latencies
          </p>
        </header>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <Leaderboard
          rows={rows}
          loading={loading}
          currentUrl={currentUrl}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black font-medium disabled:opacity-50 hover:opacity-90 transition"
          >
            {loading ? "Measuring…" : "Run again"}
          </button>
        </div>
      </div>
    </main>
  );
}
