"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { FloorPlanCanvas, type ResizeHandle } from "./FloorPlanCanvas";
import { saveFloorPlanAction } from "@/lib/actions/floorplans";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label, FieldGroup } from "@/components/ui/Field";
import type { FloorPlan, FloorPlanSpace, SpaceStatus, SpaceType } from "@/lib/types";

function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  const transformed = pt.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}

let tempIdCounter = 0;
function tempId() {
  tempIdCounter += 1;
  return `new_${Date.now()}_${tempIdCounter}`;
}

const MIN_SIZE = 12;

// Default dimensions for each item type, in canvas units where 1 unit ≈ 1.5cm.
// Sizes are derived from real-world furniture so every item is proportional to
// the others the moment it is placed (a chair is smaller than a round table,
// a banquet table is longer than it is deep, etc.).
const SPACE_DEFAULTS: Record<SpaceType, { w: number; h: number; label: string; status: SpaceStatus; price?: number }> = {
  booth: { w: 100, h: 80, label: "New", status: "available", price: 50 },
  table: { w: 120, h: 50, label: "Table", status: "blocked" }, // ~1.8m x 0.75m banquet table
  roundtable: { w: 80, h: 80, label: "Table", status: "blocked" }, // ~1.2m round table
  chair: { w: 30, h: 30, label: "", status: "blocked" }, // ~0.45m chair
  door: { w: 60, h: 10, label: "", status: "blocked" }, // ~0.9m opening
  wall: { w: 160, h: 12, label: "", status: "blocked" },
  stage: { w: 200, h: 60, label: "Stage", status: "blocked" },
  walkway: { w: 120, h: 40, label: "Walkway", status: "blocked" },
  entrance: { w: 100, h: 20, label: "Entrance", status: "blocked" },
};

export function FloorPlanEditor({ plan }: { plan: FloorPlan }) {
  const [name, setName] = useState(plan.name);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(plan.backgroundImageUrl);
  const [spaces, setSpaces] = useState<FloorPlanSpace[]>(plan.spaces);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const svgRef = useRef<SVGSVGElement>(null);
  const dragState = useRef<{ id: string; startX: number; startY: number; pointerX: number; pointerY: number } | null>(
    null
  );
  const resizeState = useRef<{
    id: string;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    pointerX: number;
    pointerY: number;
  } | null>(null);

  const selected = spaces.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const svg = svgRef.current;
      if (!svg) return;
      const point = toSvgPoint(svg, e.clientX, e.clientY);

      const resize = resizeState.current;
      if (resize) {
        const dx = point.x - resize.pointerX;
        const dy = point.y - resize.pointerY;
        // Work in edges so bounds/min-size clamping stays simple.
        let left = resize.startX;
        let right = resize.startX + resize.startW;
        let top = resize.startY;
        let bottom = resize.startY + resize.startH;
        if (resize.handle.includes("w")) left = resize.startX + dx;
        if (resize.handle.includes("e")) right = resize.startX + resize.startW + dx;
        if (resize.handle.includes("n")) top = resize.startY + dy;
        if (resize.handle.includes("s")) bottom = resize.startY + resize.startH + dy;
        left = Math.max(0, Math.min(left, right - MIN_SIZE));
        top = Math.max(0, Math.min(top, bottom - MIN_SIZE));
        right = Math.min(plan.canvasWidth, Math.max(right, left + MIN_SIZE));
        bottom = Math.min(plan.canvasHeight, Math.max(bottom, top + MIN_SIZE));
        setSpaces((prev) =>
          prev.map((s) =>
            s.id === resize.id ? { ...s, x: left, y: top, w: right - left, h: bottom - top } : s
          )
        );
        return;
      }

      const drag = dragState.current;
      if (!drag) return;
      const dx = point.x - drag.pointerX;
      const dy = point.y - drag.pointerY;
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === drag.id
            ? {
                ...s,
                x: Math.max(0, Math.min(plan.canvasWidth - s.w, drag.startX + dx)),
                y: Math.max(0, Math.min(plan.canvasHeight - s.h, drag.startY + dy)),
              }
            : s
        )
      );
    }
    function onUp() {
      dragState.current = null;
      resizeState.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [plan.canvasWidth, plan.canvasHeight]);

  function handlePointerDown(space: FloorPlanSpace, e: React.PointerEvent<SVGGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    setSelectedId(space.id);
    const point = toSvgPoint(svg, e.clientX, e.clientY);
    dragState.current = { id: space.id, startX: space.x, startY: space.y, pointerX: point.x, pointerY: point.y };
  }

  function handleResizePointerDown(
    space: FloorPlanSpace,
    handle: ResizeHandle,
    e: React.PointerEvent<SVGRectElement>
  ) {
    const svg = svgRef.current;
    if (!svg) return;
    setSelectedId(space.id);
    const point = toSvgPoint(svg, e.clientX, e.clientY);
    resizeState.current = {
      id: space.id,
      handle,
      startX: space.x,
      startY: space.y,
      startW: space.w,
      startH: space.h,
      pointerX: point.x,
      pointerY: point.y,
    };
  }

  function addSpace(type: SpaceType) {
    const d = SPACE_DEFAULTS[type];
    const s: FloorPlanSpace = {
      id: tempId(),
      label: d.label,
      type,
      x: 40,
      y: 40,
      w: d.w,
      h: d.h,
      status: d.status,
      price: d.price,
    };
    setSpaces((prev) => [...prev, s]);
    setSelectedId(s.id);
  }

  function duplicateSelected() {
    if (!selected) return;
    const copy: FloorPlanSpace = {
      ...selected,
      id: tempId(),
      x: Math.max(0, Math.min(plan.canvasWidth - selected.w, selected.x + 16)),
      y: Math.max(0, Math.min(plan.canvasHeight - selected.h, selected.y + 16)),
      label: selected.label ? `${selected.label} copy` : selected.label,
    };
    setSpaces((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  }

  function updateSelected(patch: Partial<FloorPlanSpace>) {
    if (!selectedId) return;
    setSpaces((prev) => prev.map((s) => (s.id === selectedId ? { ...s, ...patch } : s)));
  }

  function deleteSelected() {
    if (!selectedId) return;
    setSpaces((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBackgroundImageUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function save() {
    startTransition(async () => {
      const result = await saveFloorPlanAction(plan.id, {
        name,
        backgroundImageUrl,
        canvasWidth: plan.canvasWidth,
        canvasHeight: plan.canvasHeight,
        spaces,
      });
      setSavedMessage(result.queued ? "Submitted for approval" : "Saved!");
      setTimeout(() => setSavedMessage(null), 3000);
    });
  }

  return (
    <div className="ef-fade-in">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <FieldGroup className="mb-0 max-w-xs">
          <Label htmlFor="planName">Floor plan name</Label>
          <Input id="planName" value={name} onChange={(e) => setName(e.target.value)} />
        </FieldGroup>
        <div className="flex items-center gap-2">
          {savedMessage && <span className="text-sm font-medium text-success">{savedMessage}</span>}
          <Button onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save floor plan"}
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-3">
        <span className="text-xs font-semibold text-muted-foreground">Add:</span>
        <Button size="sm" variant="secondary" onClick={() => addSpace("chair")}>
          + Chair
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addSpace("door")}>
          + Door
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addSpace("roundtable")}>
          + Round table
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addSpace("table")}>
          + Rectangular table
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addSpace("wall")}>
          + Wall
        </Button>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        <Button size="sm" variant="secondary" onClick={() => addSpace("booth")}>
          + Booth
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addSpace("stage")}>
          + Stage
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addSpace("entrance")}>
          + Entrance
        </Button>
        <label className="ml-auto cursor-pointer text-xs font-semibold text-lu-purple-600 hover:underline">
          Upload background image to trace
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
        {backgroundImageUrl && (
          <button
            type="button"
            onClick={() => setBackgroundImageUrl(undefined)}
            className="cursor-pointer text-xs text-danger hover:underline"
          >
            Remove image
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <FloorPlanCanvas
          plan={{ ...plan, name, backgroundImageUrl, spaces }}
          selectedId={selectedId}
          editable
          svgRef={svgRef}
          onSpaceClick={(s) => setSelectedId(s.id)}
          onSpacePointerDown={handlePointerDown}
          onResizeHandlePointerDown={handleResizePointerDown}
        />

        <div className="rounded-lg border border-border bg-surface p-4">
          {selected ? (
            <div className="space-y-3">
              <FieldGroup className="mb-0">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={selected.label} onChange={(e) => updateSelected({ label: e.target.value })} />
              </FieldGroup>
              <FieldGroup className="mb-0">
                <Label htmlFor="type">Type</Label>
                <Select
                  id="type"
                  value={selected.type}
                  onChange={(e) => updateSelected({ type: e.target.value as SpaceType })}
                >
                  <option value="chair">Chair</option>
                  <option value="door">Door</option>
                  <option value="roundtable">Round table</option>
                  <option value="table">Rectangular table</option>
                  <option value="wall">Wall</option>
                  <option value="booth">Booth</option>
                  <option value="stage">Stage</option>
                  <option value="walkway">Walkway</option>
                  <option value="entrance">Entrance</option>
                </Select>
              </FieldGroup>
              <FieldGroup className="mb-0">
                <Label htmlFor="status">Availability</Label>
                <Select
                  id="status"
                  value={selected.status}
                  onChange={(e) => updateSelected({ status: e.target.value as SpaceStatus })}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="blocked">Blocked</option>
                </Select>
              </FieldGroup>
              <div className="grid grid-cols-2 gap-2">
                <FieldGroup className="mb-0">
                  <Label htmlFor="w">Width</Label>
                  <Input
                    id="w"
                    type="number"
                    value={Math.round(selected.w)}
                    onChange={(e) => updateSelected({ w: Number(e.target.value) })}
                  />
                </FieldGroup>
                <FieldGroup className="mb-0">
                  <Label htmlFor="h">Height</Label>
                  <Input
                    id="h"
                    type="number"
                    value={Math.round(selected.h)}
                    onChange={(e) => updateSelected({ h: Number(e.target.value) })}
                  />
                </FieldGroup>
              </div>
              {selected.type === "booth" && (
                <FieldGroup className="mb-0">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={selected.price ?? 0}
                    onChange={(e) => updateSelected({ price: Number(e.target.value) })}
                  />
                </FieldGroup>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" onClick={duplicateSelected}>
                  Duplicate
                </Button>
                <Button variant="danger" size="sm" onClick={deleteSelected}>
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Click an item to select it. Drag it to move, drag the square handles on its edges and corners to
              resize, or use Duplicate to copy it. Use the buttons above to add new items.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
