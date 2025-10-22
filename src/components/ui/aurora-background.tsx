"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "transition-bg relative flex flex-col items-center justify-center",
        className,
      )}
      {...props}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={
          {
            "--aurora":
              "repeating-linear-gradient(100deg,#7A6850_10%,#96856E_15%,#B2A390_20%,#C2B399_25%,#7A6850_30%)",
            "--shadow-gradient":
              "repeating-linear-gradient(100deg,#1A1408_0%,#1A1408_7%,transparent_10%,transparent_12%,#1A1408_16%)",
            "--light-gradient":
              "repeating-linear-gradient(100deg,#E8E5E0_0%,#E8E5E0_7%,transparent_10%,transparent_12%,#E8E5E0_16%)",

            "--beige-dark": "#7A6850",
            "--beige-medium": "#96856E",
            "--beige-light": "#B2A390",
            "--beige-lighter": "#C2B399",
            "--shadow": "#1A1408",
            "--bg": "#E8E5E0",
            "--transparent": "transparent",
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            `after:animate-aurora pointer-events-none absolute -inset-[10px] [background-image:var(--light-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-30 blur-[10px] invert-0 filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--beige-dark)_10%,var(--beige-medium)_15%,var(--beige-light)_20%,var(--beige-lighter)_25%,var(--beige-dark)_30%)] [--shadow-gradient:repeating-linear-gradient(100deg,var(--shadow)_0%,var(--shadow)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--shadow)_16%)] [--light-gradient:repeating-linear-gradient(100deg,var(--bg)_0%,var(--bg)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--bg)_16%)] after:absolute after:inset-0 after:[background-image:var(--light-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-multiply after:content-[""]`,

            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_50%_0%,black_10%,var(--transparent)_70%)]`,
          )}
        ></div>
      </div>
      {children}
    </div>
  );
};
