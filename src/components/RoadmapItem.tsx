import React from "react";
import LucideIcon from "@site/src/components/LucideIcon";
import type { LucideIcon as LucideIconType } from "lucide-react";

export default function RoadmapItem({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIconType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bmrRoadmapItem">
      <div className="bmrRoadmapTitle">
        <LucideIcon icon={Icon} />
        <span>{title}</span>
      </div>
      <div className="bmrRoadmapDesc">{children}</div>
    </div>
  );
}