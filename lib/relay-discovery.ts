/**
 * NIP-66 relay discovery: fetch kind 30166 events and extract relay URLs + reported latencies.
 */

import type { Event } from "nostr-tools";
import { SimplePool } from "nostr-tools/pool";

const KIND_RELAY_DISCOVERY = 30166;
const MAX_RELAYS = 21;

export type RelayInfo = {
  url: string;
  rttOpenMs: number | null;
  rttReadMs: number | null;
  rttWriteMs: number | null;
};

function tagValue(ev: Event, name: string): string | null {
  const tag = ev.tags.find((t) => t[0] === name);
  return tag && tag[1] ? tag[1] : null;
}

function tagValues(ev: Event, name: string): string[] {
  return ev.tags.filter((t) => t[0] === name).map((t) => t[1]).filter(Boolean);
}

function parseRttMs(ev: Event, tagName: string): number | null {
  const v = tagValue(ev, tagName);
  if (v == null) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse a single NIP-66 kind 30166 event into RelayInfo.
 * `d` tag is the relay URL (required).
 */
function eventToRelayInfo(ev: Event): RelayInfo | null {
  const url = tagValue(ev, "d");
  if (!url || !url.startsWith("wss://")) return null;
  return {
    url: url.trim(),
    rttOpenMs: parseRttMs(ev, "rtt-open"),
    rttReadMs: parseRttMs(ev, "rtt-read"),
    rttWriteMs: parseRttMs(ev, "rtt-write"),
  };
}

/**
 * Fetch kind 30166 events from bootstrap relay and return up to 21 unique relay infos.
 */
export async function discoverRelays(bootstrapRelay: string): Promise<RelayInfo[]> {
  const pool = new SimplePool();
  const relays = [bootstrapRelay];
  const limit = 100;

  const events = await pool.querySync(relays, { kinds: [KIND_RELAY_DISCOVERY], limit });

  pool.close(relays);

  const seen = new Set<string>();
  const result: RelayInfo[] = [];

  for (const ev of events) {
    const info = eventToRelayInfo(ev);
    if (!info || seen.has(info.url)) continue;
    seen.add(info.url);
    result.push(info);
    if (result.length >= MAX_RELAYS) break;
  }

  return result;
}
