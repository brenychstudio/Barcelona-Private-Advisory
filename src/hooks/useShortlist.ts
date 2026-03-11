import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  clearShortlist,
  hydrateShortlistFromQuery,
  readShortlist,
  removeFromShortlist,
  subscribeShortlist,
  toggleShortlist,
} from "../lib/shortlistStore";

function getSnapshot() {
  return JSON.stringify(readShortlist());
}

export function useShortlist() {
  const raw = useSyncExternalStore(subscribeShortlist, getSnapshot, () => "[]");

  useEffect(() => {
    hydrateShortlistFromQuery();
  }, []);

  const ids = useMemo<string[]>(() => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [raw]);

  return {
    ids,
    count: ids.length,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => toggleShortlist(id),
    remove: (id: string) => removeFromShortlist(id),
    clear: () => clearShortlist(),
  };
}
