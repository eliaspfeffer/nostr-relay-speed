"use client";

import type { RelayInfo } from "@/lib/relay-discovery";
import type { MeasureResult } from "@/lib/measure-relay";

export type LeaderboardRow = {
  url: string;
  latencyMs: number | null;
  error: string | null;
  rttOpenMs: number | null;
  rttReadMs: number | null;
  rttWriteMs: number | null;
};

type Props = {
  rows: LeaderboardRow[];
  loading?: boolean;
  currentUrl?: string | null;
};

function formatMs(ms: number | null): string {
  if (ms == null) return "—";
  return `${Math.round(ms)} ms`;
}

function latencyClass(ms: number | null): string {
  if (ms == null) return "text-neutral-400";
  if (ms < 200) return "text-emerald-400";
  if (ms < 500) return "text-lime-400";
  if (ms < 1000) return "text-amber-400";
  return "text-red-400";
}

export function Leaderboard({ rows, loading, currentUrl }: Props) {
  const sorted = [...rows].sort((a, b) => {
    if (a.latencyMs == null && b.latencyMs == null) return 0;
    if (a.latencyMs == null) return 1;
    if (b.latencyMs == null) return -1;
    return a.latencyMs - b.latencyMs;
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Relay</th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider text-right">Your RTT</th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider text-right">NIP-66 open</th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider text-right">NIP-66 read</th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--muted)] uppercase tracking-wider text-right">NIP-66 write</th>
              </tr>
            </thead>
            <tbody>
              {loading && sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                    Discovering relays and measuring…
                  </td>
                </tr>
              )}
              {sorted.map((row, i) => (
                <tr
                  key={row.url}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    currentUrl === row.url ? "bg-[var(--accent)]/10" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-[var(--muted)] tabular-nums">
                    {row.latencyMs != null ? i + 1 : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm break-all">
                    {row.url}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono tabular-nums ${latencyClass(row.latencyMs)}`}>
                    {row.error ? (
                      <span className="text-red-400 text-xs" title={row.error}>
                        Error
                      </span>
                    ) : (
                      formatMs(row.latencyMs)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--muted)] tabular-nums">
                    {formatMs(row.rttOpenMs)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--muted)] tabular-nums">
                    {formatMs(row.rttReadMs)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--muted)] tabular-nums">
                    {formatMs(row.rttWriteMs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
