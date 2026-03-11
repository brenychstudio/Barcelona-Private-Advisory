export const SHORTLIST_KEY = "sc_shortlist_v1";
const HYDRATE_FLAG = "sc_shortlist_hydrated_v1";

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

export function readShortlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SHORTLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return uniq(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export function writeShortlist(ids: string[]) {
  if (typeof window === "undefined") return;
  const next = uniq(ids);
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("sc:shortlist", { detail: next }));
}

export function toggleShortlist(id: string) {
  const ids = readShortlist();
  writeShortlist(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
}

export function removeFromShortlist(id: string) {
  writeShortlist(readShortlist().filter((x) => x !== id));
}

export function clearShortlist() {
  writeShortlist([]);
}

export function subscribeShortlist(cb: () => void) {
  const onCustom = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key === SHORTLIST_KEY) cb();
  };

  window.addEventListener("sc:shortlist", onCustom as EventListener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("sc:shortlist", onCustom as EventListener);
    window.removeEventListener("storage", onStorage);
  };
}

/** optional: allow share links like ?shortlist=l-01,l-02 */
export function hydrateShortlistFromQuery() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(HYDRATE_FLAG) === "1") return;

  sessionStorage.setItem(HYDRATE_FLAG, "1");
  const url = new URL(window.location.href);
  const raw = url.searchParams.get("shortlist");
  if (!raw) return;

  const incoming = uniq(raw.split(",").map((s) => s.trim()));
  if (!incoming.length) return;

  const merged = uniq([...readShortlist(), ...incoming]);
  writeShortlist(merged);
}
