import { useState, type DragEvent } from "react";

export function useDragOrder<T extends { id: string }>(
  items: T[],
  onReorder: (ids: string[]) => void,
) {
  const [dragId, setDragId] = useState<string | null>(null);

  function itemProps(id: string) {
    return {
      draggable: true,
      onDragStart: () => setDragId(id),
      onDragOver: (e: DragEvent) => e.preventDefault(),
      onDrop: () => {
        if (!dragId || dragId === id) return;
        const ids = items.map((i) => i.id);
        const from = ids.indexOf(dragId);
        const to = ids.indexOf(id);
        if (from < 0 || to < 0) return;
        const [moved] = ids.splice(from, 1);
        ids.splice(to, 0, moved!);
        onReorder(ids);
        setDragId(null);
      },
      onDragEnd: () => setDragId(null),
      "aria-grabbed": dragId === id,
    };
  }

  return { itemProps, dragId };
}
