import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createNote, getNote, updateNote, toggleArchive } from "../api/note";
import {
  listTags,
  createTag,
  addTagToNote,
  removeTagFromNote,
} from "../api/tag";
import {
  shareNote,
  listNoteShares,
  revokeShare,
  updateSharePermission,
} from "../api/share";
import type { Note, Tag, SharedNote } from "../types";
import { useAuth } from "../hooks/useAuth";

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isEditMode = Boolean(id);
  const noteId = id ? Number(id) : null;

  // note data
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // tags
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [noteTags, setNoteTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");

  // sharing
  const [shares, setShares] = useState<SharedNote[]>([]);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState<"view" | "edit">(
    "view"
  );

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"note" | "tags" | "share">("note");

  // Load note if editing
  useEffect(() => {
    if (!noteId) return;

    setIsLoading(true);
    getNote(noteId)
      .then((res) => {
        const n = res.data;
        setNote(n);
        setTitle(n.title);
        setContent(n.content || "");
        setNoteTags(n.tags);
      })
      .catch(() => setError("Failed to load note"))
      .finally(() => setIsLoading(false));
  }, [noteId]);

  // Load shares (only for owner)
  useEffect(() => {
    if (!note || !user) return;
    if (note.owner_id !== user.id) return;

    listNoteShares(noteId!)
      .then((res) => setShares(res.data))
      .catch(() => {});
  }, [note, user]);

  // Load all tags
  useEffect(() => {
    listTags()
      .then((res) => setAllTags(res.data))
      .catch(() => {});
  }, []);

  // Permissions & Access Control
  const isOwner = note ? note.owner_id === user?.id : true;
  const sharedPermission = location.state?.permission; 

  // Lock down the editor if they are not the owner and only have 'view' access
  const isReadOnly = !isOwner && sharedPermission === "view";

  // Save note handler
  const handleSave = async () => {
    if (isReadOnly) return;
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      if (isEditMode && noteId) {
        const res = await updateNote(noteId, { title, content });
        setNote(res.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        const res = await createNote(title, content);
        navigate(`/notes/${res.data.id}`, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  // Archive toggle (Owner only per API)
  const handleArchive = async () => {
    if (!noteId || !isOwner) return;
    try {
      const res = await toggleArchive(noteId);
      setNote(res.data);
    } catch {
      alert("Failed to toggle archive");
    }
  };

  // Add tag (Owner only per API)
  const handleAddTag = async (tagId: number) => {
    if (!noteId || !isOwner) return;
    try {
      const res = await addTagToNote(noteId, tagId);
      setNoteTags(res.data.tags);
    } catch {
      alert("Failed to add tag");
    }
  };

  // Remove tag (Owner only per API)
  const handleRemoveTag = async (tagId: number) => {
    if (!noteId || !isOwner) return;
    try {
      const res = await removeTagFromNote(noteId, tagId);
      setNoteTags(res.data.tags);
    } catch {
      alert("Failed to remove tag");
    }
  };

  // Create new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim() || !isOwner) return;
    try {
      const res = await createTag(newTagName.trim());
      setAllTags((prev) => [...prev, res.data]);
      setNewTagName("");
      if (noteId) {
        await handleAddTag(res.data.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create tag");
    }
  };

  // Share note (Owner only)
  const handleShare = async () => {
    if (!noteId || !shareEmail.trim() || !isOwner) return;

    setShareError("");
    setShareSuccess("");

    try {
      const res = await shareNote(noteId, shareEmail.trim(), sharePermission);

      setShares((prev) => {
        const exists = prev.find((s) => s.id === res.data.id);
        if (exists) {
          return prev.map((s) => (s.id === res.data.id ? res.data : s));
        }
        return [...prev, res.data];
      });

      setShareEmail("");
      setShareSuccess(`Shared with ${shareEmail}`);
      setTimeout(() => setShareSuccess(""), 3000);
    } catch (err: any) {
      setShareError(err.response?.data?.detail || "Failed to share");
    }
  };

  // Revoke access (Owner only)
  const handleRevokeShare = async (userId: number) => {
    if (!noteId || !isOwner) return;
    if (!confirm("Are you sure you want to revoke access?")) return;

    try {
      await revokeShare(noteId, userId);
      setShares((prev) => prev.filter((s) => s.shared_with_user_id !== userId));
    } catch {
      alert("Failed to revoke");
    }
  };

  // Update permission (Owner only)
  const handleUpdatePermission = async (
    userId: number,
    permission: "view" | "edit"
  ) => {
    if (!noteId || !isOwner) return;
    try {
      const res = await updateSharePermission(noteId, userId, permission);
      setShares((prev) =>
        prev.map((s) => (s.shared_with_user_id === userId ? res.data : s))
      );
    } catch {
      alert("Failed to update permission");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading your note...</p>
        </div>
      </div>
    );
  }

  const availableTags = allTags.filter(
    (t) => !noteTags.some((nt) => nt.id === t.id)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">

      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          Back
        </button>

        <div className="flex items-center gap-3">

          {/* Read-Only Badge */}
          {isReadOnly && (
             <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg mr-2">
                View Only
             </span>
          )}

          {isEditMode && isOwner && note && (
            <button
              onClick={handleArchive}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                note.is_archived
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {note.is_archived ? "Unarchive" : "Archive"}
            </button>
          )}

          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Create Note"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          Note saved successfully!
        </div>
      )}

      {/* Main Editor Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            readOnly={isReadOnly}
            placeholder="Untitled Note"
            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 bg-transparent mb-6 p-0 outline-none read-only:text-gray-700"
          />

          {isEditMode && (
            <div className="flex gap-6 mb-6 border-b border-gray-100">
              {(["note", "tags", "share"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* TAB: NOTE */}
          {activeTab === "note" && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              readOnly={isReadOnly}
              placeholder={isReadOnly ? "This note is empty." : "Start typing your note here..."}
              className={`w-full min-h-[400px] text-gray-700 bg-gray-50 p-4 rounded-lg outline-none transition-all resize-y text-lg leading-relaxed border border-transparent ${
                isReadOnly 
                ? "cursor-default" 
                : "hover:bg-gray-100 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              }`}
            />
          )}

          {/* TAB: TAGS */}
          {activeTab === "tags" && isEditMode && (
            <div className="animate-fade-in">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                Current Tags
              </h3>

              <div className="flex flex-wrap gap-2 mb-8">
                {noteTags.length === 0 && (
                  <span className="text-sm text-gray-400 italic">No tags added yet.</span>
                )}
                {noteTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {tag.name}
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        className="ml-2 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-blue-200 text-blue-500 hover:text-blue-800 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isOwner && (
                <>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                    Add Existing Tag
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {availableTags.length === 0 && (
                      <span className="text-sm text-gray-400">
                        All available tags are already applied.
                      </span>
                    )}
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleAddTag(tag.id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        + {tag.name}
                      </button>
                    ))}
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                    Create New Tag
                  </h3>
                  <div className="flex gap-3 max-w-md">
                    <input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="e.g. Project Ideas"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <button
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                      className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: SHARE */}
          {activeTab === "share" && isEditMode && (
            <div className="animate-fade-in max-w-2xl">
              {isOwner ? (
                <>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                    Share with others
                  </h3>

                  {shareError && (
                    <div className="mb-4 text-red-600 text-sm">{shareError}</div>
                  )}
                  {shareSuccess && (
                    <div className="mb-4 text-green-600 text-sm">{shareSuccess}</div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mb-10">
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <div className="flex gap-3">
                      <select
                        value={sharePermission}
                        onChange={(e) =>
                          setSharePermission(e.target.value as "view" | "edit")
                        }
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        <option value="view">Can View</option>
                        <option value="edit">Can Edit</option>
                      </select>
                      <button
                        onClick={handleShare}
                        disabled={!shareEmail.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        Send Invite
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                    People with access
                  </h3>

                  {shares.length === 0 ? (
                    <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100">
                      This note is not shared with anyone yet.
                    </p>
                  ) : (
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
                      {shares.map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                              {s.shared_with_email?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {s.shared_with_email}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <select
                              value={s.permission}
                              onChange={(e) =>
                                handleUpdatePermission(
                                  s.shared_with_user_id,
                                  e.target.value as "view" | "edit"
                                )
                              }
                              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-transparent text-gray-600 cursor-pointer"
                            >
                              <option value="view">Viewer</option>
                              <option value="edit">Editor</option>
                            </select>

                            <button
                              onClick={() =>
                                handleRevokeShare(s.shared_with_user_id)
                              }
                              className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg text-center">
                  <h3 className="text-blue-800 font-medium mb-1">Shared Note</h3>
                  <p className="text-sm text-blue-600">
                    You do not have permission to manage sharing settings for this note.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;