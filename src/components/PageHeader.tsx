import { Info } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  guidance?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, guidance, children }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
      {guidance && (
        <div className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/15 px-3 py-2">
          <Info className="h-4 w-4 text-accent shrink-0" />
          <p className="text-xs text-muted-foreground">{guidance}</p>
        </div>
      )}
    </div>
  );
}
