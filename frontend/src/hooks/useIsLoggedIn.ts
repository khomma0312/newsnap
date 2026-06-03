import { useSyncExternalStore } from "react";
import { isLoggedIn } from "@/lib/auth";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useIsLoggedIn(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isLoggedIn(),
    () => false,
  );
}
