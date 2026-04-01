import type { Note } from "../types";

export interface NoteCardProps {
  note: Note;
  onOpen: () => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
  onArchive: (id: number, e: React.MouseEvent) => void;
}

export default function NoteCard({
  note,
  onOpen,
  onDelete,
  onArchive,
}: NoteCardProps) {
  const formattedDate = new Date(note.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={onOpen}
      className={`group relative flex flex-col h-full rounded-2xl p-6 cursor-pointer border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
        note.is_archived
          ? "bg-[#f9fafb] border-gray-200 hover:border-gray-300"
          : "bg-white border-gray-100 hover:border-blue-200"
      }`}
    >
      {/* Top Section: Title & Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-3 flex-1">
          {note.title || "Untitled Note"}
        </h3>
        
        {/* Note Type Indicator */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {note.is_archived && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
              Archived
            </span>
          )}
          {/* Subtle icon indicating it's a rich text document */}
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
      </div>

      {/* Middle Section: Flexible spacer to push tags and footer to the bottom */}
      <div className="flex-grow"></div>

      {/* Tags Section */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {note.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Section: Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/80">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Created: {formattedDate}
        </span>

        {/* Hover Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => onArchive(note.id, e)}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 rounded-md transition-colors"
          >
            {note.is_archived ? "Unarchive" : "Archive"}
          </button>
          <button
            onClick={(e) => onDelete(note.id, e)}
            className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}