// Polls /cv_meta.json for version and filename, stores latest value in localStorage

const META_KEY = 'cv_meta';
let pollId: number | null = null;

export async function fetchMeta(): Promise<{ version?: number; filename?: string } | null> {
  try {
    const res = await fetch('/cv_meta.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const j = await res.json();
    if (j && typeof j === 'object') {
      localStorage.setItem(META_KEY, JSON.stringify(j));
      return j;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function getLocalMeta(): { version?: number; filename?: string } | null {
  try {
    const s = localStorage.getItem(META_KEY);
    if (!s) return null;
    return JSON.parse(s);
  } catch (e) { return null; }
}

export function startPolling(interval = 15000) {
  // immediate fetch
  fetchMeta();
  stopPolling();
  pollId = window.setInterval(fetchMeta, interval);
}

export function stopPolling() {
  if (pollId !== null) {
    clearInterval(pollId);
    pollId = null;
  }
}

export default { fetchMeta, getLocalMeta, startPolling, stopPolling };
