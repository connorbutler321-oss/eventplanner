"use client";

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

/**
 * Light/Dark theme toggle. Flips the `dark` class on <html> and persists to
 * localStorage. The icon is chosen purely with the `dark:` CSS variant, so no
 * React state (and no hydration flash) is involved. The pre-paint script in the
 * root layout applies the saved value before first render.
 */
export function ThemeToggle({ variant = "surface" }: { variant?: "surface" | "onColor" }) {
  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("ef-theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  const styles =
    variant === "onColor"
      ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
      : "border-border-strong bg-surface text-foreground shadow-xs hover:bg-surface-muted";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light/dark theme"
      title="Toggle light/dark theme"
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${styles}`}
    >
      <span className="dark:hidden">
        <IconMoon />
      </span>
      <span className="hidden dark:block">
        <IconSun />
      </span>
    </button>
  );
}
