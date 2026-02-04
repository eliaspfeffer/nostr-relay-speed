/**
 * Measure relay latency: connect, request one event (kind 1, limit 1), report ms until first event or EOSE.
 */

import { Relay } from "nostr-tools/relay";

const MEASURE_TIMEOUT_MS = 15000;

export type MeasureResult = {
  url: string;
  latencyMs: number | null;
  error: string | null;
};

export async function measureRelayLatency(url: string): Promise<MeasureResult> {
  const start = Date.now();
  let relay: Relay | null = null;

  const timeout = new Promise<MeasureResult>((resolve) => {
    setTimeout(() => {
      resolve({
        url,
        latencyMs: null,
        error: "Timeout",
      });
    }, MEASURE_TIMEOUT_MS);
  });

  const measure = (async (): Promise<MeasureResult> => {
    try {
      relay = await Relay.connect(url, { enableReconnect: false });

      return new Promise<MeasureResult>((resolve) => {
        let settled = false;
        let sub: { close: (reason?: string) => void } | null = null;
        const finish = (latencyMs: number) => {
          if (settled) return;
          settled = true;
          try {
            sub?.close();
          } catch (_) {}
          try {
            relay!.close();
          } catch (_) {}
          resolve({ url, latencyMs, error: null });
        };

        sub = relay!.subscribe([{ kinds: [1], limit: 1 }], {
          onevent: () => finish(Date.now() - start),
          oneose: () => finish(Date.now() - start),
          eoseTimeout: Math.max(2000, MEASURE_TIMEOUT_MS - (Date.now() - start)),
        });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (relay) try { relay.close(); } catch (_) {}
      return { url, latencyMs: null, error: message };
    }
  })();

  return Promise.race([measure, timeout]);
}

export async function measureAllRelays(
  urls: string[],
  onProgress: (url: string, result: MeasureResult) => void
): Promise<MeasureResult[]> {
  const results: MeasureResult[] = [];

  for (const url of urls) {
    const result = await measureRelayLatency(url);
    results.push(result);
    onProgress(url, result);
  }

  return results;
}
