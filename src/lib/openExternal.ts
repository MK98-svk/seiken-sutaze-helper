// Otvorenie externého odkazu tak, aby fungovalo aj vnútri náhľadového iframe.
export function openExternal(url: string) {
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) return;
  } catch {
    /* ignore */
  }
  try {
    // Fallback: preklikneme celé okno (funguje aj keď je popup blokovaný v iframe)
    (window.top ?? window).location.href = url;
  } catch {
    window.location.href = url;
  }
}

export const youtubeSearch = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
