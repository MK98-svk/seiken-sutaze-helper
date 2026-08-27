/** Tvrdá aktualizácia appky – vymaže cache, odregistruje service worker a načíta znova. */
export async function hardRefreshApp() {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    // ignorujeme – aj tak spravíme reload
  }
  window.location.replace(`${window.location.pathname}?v=${Date.now()}`);
}

export const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
