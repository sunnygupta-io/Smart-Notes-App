import type { Note } from '../types';

export interface NoteCardProps {
  note: Note;
  onOpen: () => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
  onArchive: (id: number, e: React.MouseEvent) => void;
}

export default function NoteCard({ note, onOpen, onDelete, onArchive }: NoteCardProps) {
  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onOpen}
      className={`group relative flex flex-col h-full rounded-2xl p-6 cursor-pointer border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
        note.is_archived
          ? 'bg-[#f9fafb] border-gray-200 hover:border-gray-300'
          : 'bg-white border-gray-100 hover:border-blue-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 flex-1">
          {note.title}
        </h3>
        {note.is_archived && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-1 rounded-md shrink-0">
            Archived
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-5 leading-relaxed flex-1 line-clamp-3">
        {note.content || <span className="italic opacity-70">No content...</span>}
      </p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {note.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/80">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Created: {formattedDate}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => onArchive(note.id, e)}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 rounded-md transition-colors"
          >
            {note.is_archived ? 'Unarchive' : 'Archive'}
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