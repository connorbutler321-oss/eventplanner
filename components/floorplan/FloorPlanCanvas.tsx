"use client";

import type { FloorPlan, FloorPlanSpace, SpaceType } from "@/lib/types";
import { cn } from "@/lib/cn";

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const statusFill: Record<FloorPlanSpace["status"], string> = {
  available: "fill-green-50 stroke-success",
  reserved: "fill-red-50 stroke-danger",
  blocked: "fill-gray-100 stroke-gray-400",
};

// Types with their own fixed styling (furniture / structure). Types left blank
// fall back to status-based coloring above (booths and rectangular tables can
// be reserved, so their fill communicates availability).
const typeFill: Record<SpaceType, string> = {
  booth: "",
  table: "",
  roundtable: "fill-lu-purple-50 stroke-lu-purple-400",
  chair: "fill-gray-50 stroke-gray-500",
  // NB: gold is only defined at 100 and above in globals.css. `fill-lu-gold-50`
  // compiled to nothing, so doors fell back to the SVG default fill of black.
  door: "fill-lu-gold-100 stroke-lu-gold-600",
  wall: "fill-gray-400 stroke-gray-600",
  stage: "fill-lu-purple-100 stroke-lu-purple-500",
  walkway: "fill-white stroke-gray-300",
  entrance: "fill-lu-gold-100 stroke-lu-gold-600",
};

// Only booths and rectangular tables are bookable spaces a vendor can select.
function isBookable(type: SpaceType) {
  return type === "booth" || type === "table";
}

// 8 resize handles: 4 corners + 4 edge midpoints, positioned as fractions of
// the item's width/height, each with the appropriate resize cursor.
const HANDLES: { id: ResizeHandle; fx: number; fy: number; cursor: string }[] = [
  { id: "nw", fx: 0, fy: 0, cursor: "nwse-resize" },
  { id: "n", fx: 0.5, fy: 0, cursor: "ns-resize" },
  { id: "ne", fx: 1, fy: 0, cursor: "nesw-resize" },
  { id: "e", fx: 1, fy: 0.5, cursor: "ew-resize" },
  { id: "se", fx: 1, fy: 1, cursor: "nwse-resize" },
  { id: "s", fx: 0.5, fy: 1, cursor: "ns-resize" },
  { id: "sw", fx: 0, fy: 1, cursor: "nesw-resize" },
  { id: "w", fx: 0, fy: 0.5, cursor: "ew-resize" },
];
const HANDLE_SIZE = 9;

/**
 * Shared, purely-presentational floor plan renderer. Used both by the
 * planner's editable builder and the vendor's read/select-only picker so
 * the two always stay in visual sync. When `editable` is set, every item is
 * draggable and the selected item shows resize handles.
 */
export function FloorPlanCanvas({
  plan,
  selectedId,
  onSpaceClick,
  onSpacePointerDown,
  onResizeHandlePointerDown,
  editable = false,
  svgRef,
  className,
}: {
  plan: FloorPlan;
  selectedId?: string | null;
  onSpaceClick?: (space: FloorPlanSpace) => void;
  onSpacePointerDown?: (space: FloorPlanSpace, e: React.PointerEvent<SVGGElement>) => void;
  onResizeHandlePointerDown?: (
    space: FloorPlanSpace,
    handle: ResizeHandle,
    e: React.PointerEvent<SVGRectElement>
  ) => void;
  editable?: boolean;
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
        const clickable = isBookable(space.type);
        const interactive = editable || clickable;
        const isSelected = selectedId === space.id;
        const shapeClass = cn(
          typeFill[space.type] || statusFill[space.status],
          isSelected && "stroke-lu-gold-500"
        );
        const strokeW = isSelected ? 3 : 1.5;
        const showLabel =
          Boolean(space.label) &&
          space.type !== "chair" &&
          space.type !== "door" &&
          space.type !== "wall";

        return (
          <g
            key={space.id}
            transform={`translate(${space.x}, ${space.y})`}
            onClick={() => interactive && onSpaceClick?.(space)}
            onPointerDown={(e) => onSpacePointerDown?.(space, e)}
            className={editable ? "cursor-move" : clickable ? "cursor-pointer" : ""}
          >
            {space.type === "roundtable" ? (
              <ellipse
                cx={space.w / 2}
                cy={space.h / 2}
                rx={space.w / 2}
                ry={space.h / 2}
                strokeWidth={strokeW}
                className={shapeClass}
              />
            ) : space.type === "door" ? (
              <>
                <rect width={space.w} height={space.h} rx={2} strokeWidth={strokeW} className={shapeClass} />
                {/* quarter-circle hint of the door swing */}
                <path
                  d={`M 0 ${space.h} A ${space.w} ${space.w} 0 0 1 ${space.w} 0`}
                  fill="none"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  className="stroke-lu-gold-500"
                />
              </>
            ) : (
              <rect
                width={space.w}
                height={space.h}
                rx={space.type === "wall" ? 2 : 6}
                strokeWidth={strokeW}
                className={shapeClass}
              />
            )}

            {showLabel && (
              <text
                x={space.w / 2}
                y={space.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                // Space fills are always light (see statusFill/typeFill above), so
                // label colors are pinned rather than themed — text-foreground would
                // flip to near-white in dark mode and vanish against the fill.
                className="select-none fill-current text-[11px] font-semibold text-lu-purple-950"
              >
                {space.label}
              </text>
            )}
            {space.price !== undefined && space.type === "booth" && (
              <text
                x={space.w / 2}
                y={space.h / 2 + 14}
                textAnchor="middle"
                className="select-none fill-current text-[9px] text-lu-purple-700"
              >
                ${space.price}
              </text>
            )}

            {editable && isSelected && onResizeHandlePointerDown &&
              HANDLES.map((hd) => {
                const px = space.w * hd.fx;
                const py = space.h * hd.fy;
                return (
                  <rect
                    key={hd.id}
                    x={px - HANDLE_SIZE / 2}
                    y={py - HANDLE_SIZE / 2}
                    width={HANDLE_SIZE}
                    height={HANDLE_SIZE}
                    rx={1.5}
                    strokeWidth={1.5}
                    className="fill-white stroke-lu-gold-500"
                    style={{ cursor: hd.cursor }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onResizeHandlePointerDown(space, hd.id, e);
                    }}
                  />
                );
              })}
          </g>
        );
      })}
    </svg>
  );
}
