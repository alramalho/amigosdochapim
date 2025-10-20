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
              "repeating-linear-gradient(100deg,#8C7A60_10%,#A89680_15%,#C4B5A0_20%,#D4C5A9_25%,#8C7A60_30%)",
            "--shadow-gradient":
              "repeating-linear-gradient(100deg,#2C2416_0%,#2C2416_7%,transparent_10%,transparent_12%,#2C2416_16%)",
            "--light-gradient":
              "repeating-linear-gradient(100deg,#FAF7F2_0%,#FAF7F2_7%,transparent_10%,transparent_12%,#FAF7F2_16%)",

            "--beige-dark": "#8C7A60",
            "--beige-medium": "#A89680",
            "--beige-light": "#C4B5A0",
            "--beige-lighter": "#D4C5A9",
            "--shadow": "#2C2416",
            "--bg": "#FAF7F2",
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
