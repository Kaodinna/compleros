import Link from "next/link";

interface UpgradeGateProps {
  feature: string;
  tier?: "Basic" | "Premium";
  className?: string;
}

export default function UpgradeGate({ feature, tier = "Basic", className = "" }: UpgradeGateProps) {
  return (
    <div
      className={`flex items-center gap-3 bg-[#F0EDE6] border-l-[3px] border-[#C4985A] rounded-r-[10px] px-4 py-3 ${className}`}
    >
      <span className="text-[16px] shrink-0">🔒</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-navy">{feature}</p>
        <p className="text-[11px] text-muted">Available on {tier}. Upgrade to unlock.</p>
      </div>
      <Link
        href="/pricing"
        className="shrink-0 text-[11px] font-semibold text-gold border border-gold/40 px-3 py-1.5 rounded-btn hover:bg-gold hover:text-white transition-colors"
      >
        See Plans
      </Link>
    </div>
  );
}
