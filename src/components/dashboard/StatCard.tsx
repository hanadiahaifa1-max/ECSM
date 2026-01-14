import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "accent" | "success" | "warning";
}

const variantStyles = {
  default: "bg-card border-border",
  primary: "gradient-primary text-primary-foreground border-transparent",
  accent: "gradient-accent text-accent-foreground border-transparent",
  success: "gradient-success text-success-foreground border-transparent",
  warning: "bg-warning text-warning-foreground border-transparent",
};

const iconStyles = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary-foreground/20 text-primary-foreground",
  accent: "bg-accent-foreground/20 text-accent-foreground",
  success: "bg-success-foreground/20 text-success-foreground",
  warning: "bg-warning-foreground/20 text-warning-foreground",
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:shadow-card-hover animate-fade-in",
        variantStyles[variant],
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn("text-sm font-medium", variant === "default" ? "text-muted-foreground" : "opacity-90")}>
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className={cn("text-sm", variant === "default" ? "text-muted-foreground" : "opacity-80")}>{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span className={trend.isPositive ? "text-success" : "text-destructive"}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className={variant === "default" ? "text-muted-foreground" : "opacity-70"}>vs last week</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-lg p-3", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Decorative element */}
      <div
        className={cn(
          "absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10",
          variant === "default" ? "bg-primary" : "bg-current",
        )}
      />
    </div>
  );
}
