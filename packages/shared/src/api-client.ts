/**
 * Minimal HTTP client and WebSocket factory for Planning Poker API.
 * Used by web and mobile apps. No endpoints implemented yet.
 * See drivin-design/quickstart.MD §1, §5.
 */

const FETCH_TIMEOUT_MS = 15000;

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
}

export interface HttpClientOptions {
  /** Optional function to provide extra headers (e.g. Authorization) per request */
  getHeaders?: () => Record<string, string>;
}

/**
 * HTTP client that accepts a base URL. Wraps fetch for REST calls.
 */
export function createHttpClient(baseUrl: string, options?: HttpClientOptions) {
  const getHeaders = options?.getHeaders;

  function buildHeaders(defaults: Record<string, string>): Record<string, string> {
    const headers = { ...defaults };
    if (getHeaders) Object.assign(headers, getHeaders());
    return headers;
  }

  return {
    async get<T>(path: string): Promise<T> {
      const res = await fetchWithTimeout(`${baseUrl}${path}`, {
        headers: buildHeaders({}),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<T>;
    },
    async post<T>(path: string, body?: unknown): Promise<T> {
      const res = await fetchWithTimeout(`${baseUrl}${path}`, {
        method: "POST",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<T>;
    },
    async patch<T>(path: string, body?: unknown): Promise<T> {
      const res = await fetchWithTimeout(`${baseUrl}${path}`, {
        method: "PATCH",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<T>;
    },
    async delete(path: string, params?: Record<string, string>): Promise<void> {
      const url = params && Object.keys(params).length > 0
        ? `${baseUrl}${path}${path.includes("?") ? "&" : "?"}${new URLSearchParams(params).toString()}`
        : `${baseUrl}${path}`;
      const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: buildHeaders({}),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
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
