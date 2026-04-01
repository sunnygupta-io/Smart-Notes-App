import { useState, useEffect, useCallback } from 'react';
import { searchNotes, deleteNote, toggleArchive } from '../api/note';
import { listTags } from '../api/tag';
import type { Note, Tag } from '../types';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../pages/NoteEditor'; // Ensure this path matches your file structure
import { useAuth } from '../hooks/useAuth';



const Dashboard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<number | ''>('');
  const [showArchived, setShowArchived] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8; 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- NEW: MODAL STATES ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  const openNewNote = () => {
    setSelectedNoteId(null);
    setIsEditorOpen(true);
  };

  const openExistingNote = (id: number) => {
    setSelectedNoteId(id);
    setIsEditorOpen(true);
  };

  const {user}= useAuth()
  // 1. Unified Fetch Logic
  const fetchNotes = useCallback(async () => {
    if(!user) return 
    setIsLoading(true);
    setError('');

    try {
      const res = await searchNotes({
        q: query || undefined,
        tag_id: tagFilter !== '' ? tagFilter : undefined,
        is_archived: showArchived,
        date_from: dateFrom ? new Date(`${dateFrom}T00:00:00`).toISOString() : undefined,
        date_to: dateTo ? new Date(`${dateTo}T23:59:59.999`).toISOString() : undefined,
        page,
        page_size: PAGE_SIZE,
      });

      setNotes(res.data.items);
      setTotal(res.data.total);
    } catch {
      setError('Failed to load notes. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }, [query, tagFilter, showArchived, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    listTags()
      .then((res) => setTags(res.data))
      .catch(() => {});
  }, []);

  // Reset to page 1 ONLY when filters change
  useEffect(() => {
    setPage(1);
  }, [query, tagFilter, showArchived, dateFrom, dateTo]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this note permanently?')) return;

    try {
      await deleteNote(id);
      fetchNotes(); // Re-fetch to keep pagination in sync
    } catch {
      alert('Failed to delete note');
    }
  };

  const handleArchive = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleArchive(id);
      fetchNotes(); // Re-fetch to keep pagination in sync
    } catch {
      alert('Failed to archive note');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 font-sans relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Notes</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and filter your thoughts</p>
          </div>
          <button
            onClick={openNewNote}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="text-lg leading-none">+</span> New Note
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or content..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-[#f9fafb] focus:bg-white"
              />
            </div>

            <div className="w-full lg:w-48 shrink-0">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-[#f9fafb] focus:bg-white cursor-pointer transition-all"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-5 border-t border-gray-50">
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-[#f9fafb] focus:bg-white transition-all text-gray-600"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">To</span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom} 
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-[#f9fafb] focus:bg-white transition-all text-gray-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer"
                />
                <span className="group-hover:text-gray-900 transition-colors">Show Archived</span>
              </label>

              {(query || tagFilter !== '' || showArchived || dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setQuery('');
                    setTagFilter('');
                    setShowArchived(false);
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="text-sm text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-8 flex items-center gap-3">
            <span className="font-bold">!</span> {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium text-sm">Fetching your notes...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="text-5xl mb-5 opacity-80">📝</div>
            <p className="text-xl font-bold text-gray-900 mb-2">No notes found</p>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-sm leading-relaxed">
              {query || tagFilter !== '' || showArchived || dateFrom || dateTo
                ? "We couldn't find anything matching your filters. Try tweaking your search or clearing the filters."
                : "You haven't created any notes yet. Capture your first thought!"}
            </p>
            {!query && tagFilter === '' && !showArchived && !dateFrom && !dateTo && (
              <button
                onClick={openNewNote}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5"
              >
                Create Your First Note
              </button>
            )}
          </div>
        )}

        {/* Notes Grid */}
        {!isLoading && notes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onOpen={() => openExistingNote(note.id)}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 pb-8">
            <div className="inline-flex items-center gap-1 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg transition-all ${
                    p === page
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- THE NOTE EDITOR MODAL --- */}
      <NoteEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        noteId={selectedNoteId} 
        onSaved={fetchNotes} 
      />
    </div>
  );
};

export default Dashboard;