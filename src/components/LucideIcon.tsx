import React from "react";
import type { LucideIcon } from "lucide-react";

export type IconSize = "sm" | "md" | "lg" | "xl" | number | string;

const sizeMap: Record<string, number> = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

function resolveSize(size: IconSize): number | string {
  if (typeof size === "number") return size;
  if (size in sizeMap) return sizeMap[size];
  // Pass through CSS strings like "1em", "2rem", etc.
  return size;
}

export default function LucideIcon({
  icon: Icon,
  size = "md",
  color = "#206B31",
  className,
  style,
}: {
  icon: LucideIcon;
  size?: IconSize;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const resolved = resolveSize(size);
  return (
    <Icon
      width={resolved}
      height={resolved}
      color={color}
      className={className}
      style={{
        verticalAlign: "-0.125em",
        marginRight: "0.35em",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
