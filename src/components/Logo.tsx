import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: "horizontal" | "icon";
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-7 w-7", className)} aria-hidden="true">
      <rect x="22" y="6" width="20" height="52" rx="6" fill="#19C37D" />
      <rect x="6" y="22" width="52" height="20" rx="6" fill="#19C37D" />
      <rect x="26" y="14" width="20" height="52" rx="6" fill="#0B5ED7" />
      <rect x="14" y="26" width="52" height="20" rx="6" fill="#0B5ED7" />
    </svg>
  );
}

export function Logo({ className, iconClassName, showText = true, textClassName, variant = "horizontal" }: LogoProps) {
  if (variant === "icon") return <LogoMark className={cn(iconClassName, className)} />;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={iconClassName} />
      {showText && (
        <span className={cn("font-semibold tracking-tight text-foreground", textClassName)}>
          Mais <span className="text-[#19C37D]">Clínica</span>
        </span>
      )}
    </span>
  );
}

export default Logo;