"use client";

import type { FloorPlan, FloorPlanSpace } from "@/lib/types";
import { cn } from "@/lib/cn";

const statusFill: Record<FloorPlanSpace["status"], string> = {
  available: "fill-green-50 stroke-success",
  reserved: "fill-red-50 stroke-danger",
  blocked: "fill-gray-100 stroke-gray-400",
};

const typeFill: Record<FloorPlanSpace["type"], string> = {
  booth: "",
  table: "",
  stage: "fill-lu-purple-100 stroke-lu-purple-500",
  walkway: "fill-white stroke-gray-300",
  entrance: "fill-lu-gold-100 stroke-lu-gold-600",
};

/**
 * Shared, purely-presentational floor plan renderer. Used both by the
 * planner's editable builder and the vendor's read/select-only picker so
 * the two always stay in visual sync.
 */
export function FloorPlanCanvas({
  plan,
  selectedId,
  onSpaceClick,
  onSpacePointerDown,
  svgRef,
  className,
}: {
  plan: FloorPlan;
  selectedId?: string | null;
  onSpaceClick?: (space: FloorPlanSpace) => void;
  onSpacePointerDown?: (space: FloorPlanSpace, e: React.PointerEvent<SVGGElement>) => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  className?: string;
}) {
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${plan.canvasWidth} ${plan.canvasHeight}`}
      className={cn("w-full rounded-lg border border-border bg-surface-muted touch-none", className)}
    >
      {plan.backgroundImageUrl && (
        <image
          href={plan.backgroundImageUrl}
          x={0}
          y={0}
          width={plan.canvasWidth}
          height={plan.canvasHeight}
          opacity={0.5}
          preserveAspectRatio="xMidYMid slice"
        />
      )}
      {plan.spaces.map((space) => {
        const clickable = space.type !== "walkway" && space.type !== "stage" && space.type !== "entrance";
        return (
          <g
            key={space.id}
            transform={`translate(${space.x}, ${space.y})`}
            onClick={() => clickable && onSpaceClick?.(space)}
            onPointerDown={(e) => onSpacePointerDown?.(space, e)}
            className={clickable ? "cursor-pointer" : ""}
          >
            <rect
              width={space.w}
              height={space.h}
              rx={6}
              strokeWidth={selectedId === space.id ? 3 : 1.5}
              className={cn(
                typeFill[space.type] || statusFill[space.status],
                selectedId === space.id && "stroke-lu-gold-500"
              )}
            />
            <text
              x={space.w / 2}
              y={space.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="select-none fill-current text-[11px] font-semibold text-foreground"
            >
              {space.label}
            </text>
            {space.price !== undefined && space.type === "booth" && (
              <text
                x={space.w / 2}
                y={space.h / 2 + 14}
                textAnchor="middle"
                className="select-none fill-current text-[9px] text-muted-foreground"
              >
                ${space.price}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
