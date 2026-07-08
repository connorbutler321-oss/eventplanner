"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { FloorPlanCanvas } from "./FloorPlanCanvas";
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

  const selected = spaces.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const svg = svgRef.current;
      const drag = dragState.current;
      if (!svg || !drag) return;
      const point = toSvgPoint(svg, e.clientX, e.clientY);
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

  function addSpace(type: SpaceType) {
    const s: FloorPlanSpace = {
      id: tempId(),
      label: type === "booth" ? `New` : type[0].toUpperCase() + type.slice(1),
      type,
      x: 40,
      y: 40,
      w: type === "stage" ? 160 : 100,
      h: type === "stage" ? 60 : 80,
      status: "available",
      price: type === "booth" ? 50 : undefined,
    };
    setSpaces((prev) => [...prev, s]);
    setSelectedId(s.id);
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
      await saveFloorPlanAction(plan.id, {
        name,
        backgroundImageUrl,
        canvasWidth: plan.canvasWidth,
        canvasHeight: plan.canvasHeight,
        spaces,
      });
      setSavedMessage("Saved!");
      setTimeout(() => setSavedMessage(null), 2000);
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
        <span className="text-xs font-semibold text-gray-500">Add:</span>
        <Button size="sm" variant="secondary" onClick={() => addSpace("booth")}>
          + Booth
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addSpace("table")}>
          + Table
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addSpace("stage")}>
          + Stage
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addSpace("walkway")}>
          + Walkway
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
          svgRef={svgRef}
          onSpaceClick={(s) => setSelectedId(s.id)}
          onSpacePointerDown={handlePointerDown}
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
                  <option value="booth">Booth</option>
                  <option value="table">Table</option>
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
                    value={selected.w}
                    onChange={(e) => updateSelected({ w: Number(e.target.value) })}
                  />
                </FieldGroup>
                <FieldGroup className="mb-0">
                  <Label htmlFor="h">Height</Label>
                  <Input
                    id="h"
                    type="number"
                    value={selected.h}
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
              <Button variant="danger" size="sm" className="w-full" onClick={deleteSelected}>
                Delete space
              </Button>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              Click a space to edit it, or drag it to reposition. Use the buttons above to add new spaces.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
