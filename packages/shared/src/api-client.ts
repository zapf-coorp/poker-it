/**
 * Minimal HTTP client and WebSocket factory for Planning Poker API.
 * Used by web and mobile apps. No endpoints implemented yet.
 * See drivin-design/quickstart.MD §1, §5.
 */

/**
 * HTTP client that accepts a base URL. Wraps fetch for REST calls.
 */
export function createHttpClient(baseUrl: string) {
  return {
    async get<T>(path: string): Promise<T> {
      const res = await fetch(`${baseUrl}${path}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<T>;
    },
    async post<T>(path: string, body?: unknown): Promise<T> {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<T>;
    },
  };
}

/**
 * WebSocket factory. Accepts base URL (ws/wss) and path.
 * Returns a WebSocket instance. No event handlers yet.
 */
export function createWebSocket(baseUrl: string, path: string): WebSocket {
  const wsUrl = baseUrl.replace(/^http/, "ws") + path;
  return new WebSocket(wsUrl);
}
