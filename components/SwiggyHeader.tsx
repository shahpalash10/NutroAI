export function SwiggyLogo({ className = "h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text
        x="0"
        y="24"
        fill="#FC8019"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="26"
        letterSpacing="-0.5"
      >
        swiggy
      </text>
    </svg>
  );
}

export function SwiggyHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white swiggy-shadow">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <SwiggyLogo />
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-swiggy-page flex items-center justify-center"
            aria-label="Account"
          >
            <span className="text-sm font-semibold text-swiggy-dark">P</span>
          </button>
        </div>

        <button
          type="button"
          className="flex items-start gap-1.5 text-left w-full group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-swiggy-dark truncate">Home</span>
              <svg className="w-4 h-4 text-swiggy-orange shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-swiggy-gray truncate mt-0.5">
              42 Koramangala 5th Block, Bangalore
            </p>
          </div>
        </button>
      </div>

      <div className="px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
        <ServiceTab label="Food" active />
        <ServiceTab label="Instamart" />
        <ServiceTab label="Nutro AI" highlight />
      </div>
    </header>
  );
}

function ServiceTab({
  label,
  active,
  highlight,
}: {
  label: string;
  active?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
        active
          ? "bg-swiggy-orange text-white"
          : highlight
            ? "bg-swiggy-orange-light text-swiggy-orange border border-swiggy-orange/30"
            : "bg-swiggy-page text-swiggy-gray"
      }`}
    >
      {label}
    </button>
  );
}
