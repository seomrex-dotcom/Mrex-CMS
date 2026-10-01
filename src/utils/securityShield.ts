/**
 * Enterprise DevTools Shield & Anti-Inspection Guard
 * Prevents F12, Inspect Element, View Source shortcuts, and suppresses console leaks.
 */

export function initSecurityShield() {
  if (typeof window === 'undefined') return;

  // 1. Disable Right-Click Context Menu ("Inspect Element", "View Source")
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Block DevTools Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Cmd+Opt+I/J/C/U)
  document.addEventListener('keydown', (e) => {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect, Console, Element Picker)
    if (
      isCtrlOrMeta &&
      e.shiftKey &&
      (e.key === 'I' || e.key === 'i' ||
       e.key === 'J' || e.key === 'j' ||
       e.key === 'C' || e.key === 'c')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+U (View Page Source)
    if (isCtrlOrMeta && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page Source)
    if (isCtrlOrMeta && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Clear Console & Suppress Console Output in Production
  try {
    const isProd = import.meta.env.PROD || process.env.NODE_ENV === 'production';
    if (isProd) {
      const noop = () => {};
      window.console.log = noop;
      window.console.info = noop;
      window.console.debug = noop;
      window.console.warn = noop;
      window.console.table = noop;
      window.console.dir = noop;
    }
    // Clean up console on startup
    console.clear();
  } catch {
    // Ignore
  }
}
