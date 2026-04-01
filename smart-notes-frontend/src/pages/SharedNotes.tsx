import { useState, useEffect, useCallback } from "react";
import { getSharedWithMe, revokeShare } from "../api/share";
import type { Note } from "../types/index";
import { useAuth } from "../hooks/useAuth";
import SharedNoteCard from "../components/SharedNoteCard";
import NoteEditor from "../pages/NoteEditor"; // <-- Import the NoteEditor modal

interface SharedNoteWithPermission {
  note: Note;
  permission: "view" | "edit";
}

const SharedNotes = () => {
  const { user } = useAuth();

  const [items, setItems] = useState<SharedNoteWithPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- NEW: MODAL STATES ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<"view" | "edit">("view");

  const openNote = (id: number, permission: "view" | "edit") => {
    setSelectedNoteId(id);
    setSelectedPermission(permission);
    setIsEditorOpen(true);
  };

  // Abstracted fetch logic so we can refresh the grid when a shared note is edited
  const fetchSharedNotes = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchSharedNotes();
  }, [fetchSharedNotes]);

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
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 relative">
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
              onOpen={() => openNote(note.id, permission)}
              onLeave={(e) => handleLeave(note, e)}
            />
          ))}
        </div>
      )}

      {/* --- THE NOTE EDITOR MODAL --- */}
      <NoteEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        noteId={selectedNoteId}
        permission={selectedPermission} // Passes whether they can view or edit
        onSaved={fetchSharedNotes} // Refreshes titles/tags if they edit something
      />
    </div>
  );
};

export default SharedNotes;