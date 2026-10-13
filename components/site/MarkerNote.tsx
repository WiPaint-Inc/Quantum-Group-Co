import { markers, type Marker } from "@/content/site";
import { showInternalNotes } from "@/lib/flags";

export function MarkerNotes({ keys }: { keys: string[] }) {
  if (!showInternalNotes()) return null;
  const notes = keys
    .map((key) => markers.find((marker) => marker.key === key))
    .filter((marker): marker is Marker => Boolean(marker));
  if (notes.length === 0) return null;
  return (
    <ul className="mt-6 space-y-2">
      {notes.map((note) => (
        <li key={note.key} className="border border-dashed border-gold/70 px-3 py-2 text-sm text-gold-2">
          [{note.kind}: {note.needed}]
        </li>
      ))}
    </ul>
  );
}
