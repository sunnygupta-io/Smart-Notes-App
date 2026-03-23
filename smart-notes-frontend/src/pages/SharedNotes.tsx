import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSharedWithMe, revokeShare } from "../api/share";
import type { Note } from "../types/index";
import { useAuth } from "../hooks/useAuth";

interface SharedNoteWithPermission {
  note: Note;
  permission: "view" | "edit";
}

 const SharedNotes=()=> {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState<SharedNoteWithPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSharedNotes = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await getSharedWithMe();
    
        setItems(res.data);
      } catch {
        setError("Failed to load your shared notes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedNotes();
  }, []);

  const handleLeave = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm(`Are you sure you want to leave "${note.title}"? You will lose access.`)) return;

    try {
      await revokeShare(note.id, user.id);
      setItems((prev) => prev.filter((item) => item.note.id !== note.id));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to leave the note.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shared With Me</h1>
        <p className="text-sm text-gray-500 mt-2">
          {items.length} {items.length === 1 ? "note" : "notes"} shared with you
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
          <p className="text-gray-500 font-medium text-sm">Loading shared notes...</p>
        </div>
      ) : items.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="text-4xl mb-3">🤝</div>
          <p className="text-lg font-medium text-gray-900 mb-1">No shared notes yet</p>
          <p className="text-sm text-gray-500">
            When a colleague shares a note with you, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ note, permission }) => (
            <SharedNoteCard
              key={note.id}
              note={note}
              permission={permission}
              onOpen={() => navigate(`/notes/${note.id}`,{state: {permission}})}
              onLeave={(e) => handleLeave(note, e)}
            />
          ))}
        </div>
      )}
    </div>
  );
}


interface SharedNoteCardProps {
  note: Note;
  permission: string;
  onOpen: () => void;
  onLeave: (e: React.MouseEvent) => void;
}

function SharedNoteCard({ note, permission, onOpen, onLeave }: SharedNoteCardProps) {
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

export default SharedNotes