import { CheckCircle2, XCircle } from 'lucide-react';

export default function PlatformStatusBadge({ isConnected }) {
  if (isConnected) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-success/10 text-success border border-success/20">
        <CheckCircle2 className="w-3 h-3" />
        Connected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-text-muted/10 text-text-muted border border-border">
      <XCircle className="w-3 h-3" />
      Not Connected
    </span>
  );
}
