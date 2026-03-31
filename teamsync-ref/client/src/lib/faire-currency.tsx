const INR_RATE = 90;

export function formatUSD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatUSDShort(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `$${dollars.toFixed(0)}`;
}

export function formatUSDWhole(dollars: number): string {
  return `$${dollars.toLocaleString()}`;
}

export function formatINR(cents: number): string {
  const rupees = Math.round((cents / 100) * INR_RATE);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function formatINRFromDollars(dollars: number): string {
  const rupees = Math.round(dollars * INR_RATE);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function DualCurrency({ cents, className }: { cents: number; className?: string }) {
  return (
    <span className={className}>
      {formatUSD(cents)}
      <span className="block text-[10px] text-muted-foreground/70 font-normal">{formatINR(cents)}</span>
    </span>
  );
}

export function DualCurrencyInline({ cents, className }: { cents: number; className?: string }) {
  return (
    <span className={className}>
      {formatUSD(cents)}
      <span className="ml-1 text-[10px] text-muted-foreground/70 font-normal">({formatINR(cents)})</span>
    </span>
  );
}

export function DualFromDollars({ dollars, className }: { dollars: number; className?: string }) {
  return (
    <span className={className}>
      ${dollars.toLocaleString()}
      <span className="block text-[10px] text-muted-foreground/70 font-normal">{formatINRFromDollars(dollars)}</span>
    </span>
  );
}
