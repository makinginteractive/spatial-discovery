const POLICIES = [
  {label: 'Privacy', href: '/policies/privacy-policy'},
  {label: 'Shipping', href: '/policies/shipping-policy'},
  {label: 'Returns', href: '/policies/refund-policy'},
  {label: 'Terms', href: '/policies/terms-of-service'},
];

export function PolicyBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-10 h-7 bg-background border-t border-border flex items-center justify-center gap-4 px-4">
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
  );
}
