import {useState} from 'react';

const POLICIES = [
  {label: 'Privacy', href: '/policies/privacy-policy'},
  {label: 'Shipping', href: '/policies/shipping-policy'},
  {label: 'Returns', href: '/policies/refund-policy'},
  {label: 'Terms', href: '/policies/terms-of-service'},
];

export function PolicyBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-10 h-7 bg-background border-t border-border flex items-center px-4">
        {/* Info trigger — left side */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close info' : 'Open info'}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors leading-none mr-4"
        >
          {open ? '↓' : '↑'}
        </button>

        {/* Policy links — centered in remaining space */}
        <div className="flex-1 flex items-center justify-center gap-4">
          {POLICIES.map((p, i) => (
            <span key={p.href} className="flex items-center gap-4">
              {i > 0 && <span className="text-border select-none">·</span>}
              <a
                href={p.href}
                className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
              >
                {p.label}
              </a>
            </span>
          ))}
          <span className="text-border select-none">·</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
            © {new Date().getFullYear()} Press On
          </span>
        </div>
      </div>

      {/* Info panel */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-500 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-black transition-transform duration-500 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{height: 'clamp(360px, 55vh, 520px)'}}
      >
        <div className="flex flex-col h-full px-6 sm:px-10 py-8">
          <div className="flex-1 flex items-start justify-between gap-8">
            {/* Left: Brand */}
            <div>
              <p className="font-display text-5xl sm:text-7xl text-white leading-none">P3XIV</p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 mt-2">Press On</p>
              <a
                href="mailto:hello@press-on.co"
                className="block text-sm text-white/60 hover:text-white transition-colors mt-5"
              >
                hello@press-on.co
              </a>
            </div>
            {/* Right: Social */}
            <div className="flex flex-col items-end gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xl sm:text-2xl text-white hover:text-white/60 transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xl sm:text-2xl text-white hover:text-white/60 transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>
          {/* Bottom: Policy strip */}
          <div className="border-t border-white/10 pt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
            {POLICIES.map((p) => (
              <a
                key={p.href}
                href={p.href}
                className="text-[9px] uppercase tracking-[0.25em] text-white/40 hover:text-white/70 transition-colors"
              >
                {p.label}
              </a>
            ))}
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/25 ml-auto">
              © {new Date().getFullYear()} Press On
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
