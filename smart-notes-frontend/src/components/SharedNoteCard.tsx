import type { Note } from "../types/index";

export interface SharedNoteCardProps {
  note: Note;
  permission: string;
  onOpen: () => void;
  onLeave: (e: React.MouseEvent) => void;
}

export default function SharedNoteCard({ note, permission, onOpen, onLeave }: SharedNoteCardProps) {
  const formattedDate = new Date(note.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const preview = note.content
    ? note.content.length > 120
      ? note.content.slice(0, 120) + "..."
      : note.content
    : "No content available";

  return (
    <div
      onClick={onOpen}
      className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col h-full group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900 text-base leading-snug flex-1 line-clamp-2">
          {note.title}
        </h3>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
            permission === "edit"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          Can {permission}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4 leading-relaxed flex-1 line-clamp-3">
        {preview}
      </p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {note.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-400">Updated {formattedDate}</span>
        <button
          onClick={onLeave}
          className="text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          Leave Note
        </button>
      </div>
    </div>
  );
}