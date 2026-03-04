/**
 * Name-based icon component — ideal for use in MDX files and docs pages.
 *
 * Usage in MDX:
 *   import Icon from '@site/src/components/Icon'
 *   <Icon name="scan" size="lg" />
 *
 * Available names match the keys in src/components/icons.ts (e.g. "home",
 * "scan", "digital-twin", "lifecycle", etc.)
 */
import React from "react";
import LucideIcon, { type IconSize } from "./LucideIcon";
import { iconMap } from "./icons";

export default function Icon({
  name,
  size = "md",
  color,
  className,
}: {
  name: string;
  size?: IconSize;
  color?: string;
  className?: string;
}) {
  const icon = iconMap[name];
  if (!icon) {
    console.warn(`[Icon] Unknown icon name: "${name}". Check src/components/icons.ts for valid names.`);
    return null;
  }
  return <LucideIcon icon={icon} size={size} color={color} className={className} />;
}
