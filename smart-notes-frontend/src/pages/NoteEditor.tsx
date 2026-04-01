import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { createNote, getNote, updateNote, toggleArchive } from "../api/note";
import { listTags, createTag, addTagToNote, removeTagFromNote } from "../api/tag";
import { shareNote, listNoteShares, revokeShare, updateSharePermission } from "../api/share";
import type { Note, Tag, SharedNote } from "../types";
import { useAuth } from "../hooks/useAuth";

// --- TIPTAP IMPORTS ---
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Link from '@tiptap/extension-link';

// --- DEFINED OUTSIDE COMPONENT TO PREVENT VITE HMR WARNINGS ---
const TIPTAP_EXTENSIONS = [
  StarterKit,
  Underline,
  Highlight.configure({ HTMLAttributes: { class: 'bg-yellow-200 rounded px-1 text-black font-medium' } }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TaskList.configure({ HTMLAttributes: { class: 'not-prose pl-2' } }), 
  TaskItem.configure({ nested: true }),
  Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer break-words' } })
];

// --- UNIFIED GLOBAL CSS FOR TIPTAP ---
const EditorStyles = `
  ul[data-type="taskList"] { list-style: none !important; padding-left: 0 !important; }
  ul[data-type="taskList"] p { margin: 0 !important; }
  ul[data-type="taskList"] li { display: flex !important; align-items: flex-start !important; gap: 0.5rem !important; margin-bottom: 0.25rem !important; }
  ul[data-type="taskList"] input[type="checkbox"] { margin-top: 0.35rem !important; cursor: pointer !important; accent-color: #2563eb !important; }
  mark { background-color: #fef08a !important; color: #000 !important; padding: 0.125rem 0.25rem !important; border-radius: 0.25rem !important; font-weight: 500 !important; }
  pre { background-color: #1f2937 !important; color: #f9fafb !important; padding: 1rem !important; border-radius: 0.5rem !important; overflow-x: auto !important; }
  blockquote { border-left: 4px solid #e5e7eb !important; padding-left: 1rem !important; font-style: italic !important; color: #4b5563 !important; }
`;

// --- TIPTAP CUSTOM TOOLBAR ---
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btnClass = (isActive: boolean) =>
    `px-2.5 py-1.5 text-sm font-medium rounded transition-colors ${
      isActive ? "bg-blue-200 text-blue-800 shadow-inner" : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
    }`;

  const setLink = () => {
    if (editor.state.selection.empty) {
      alert("Please highlight the text you want to link first!");
      return;
    }
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    
    if (url === null) return; 
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const fixedUrl = /^https?:\/\//.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: fixedUrl }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">H2</button>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold"><span className="font-bold">B</span></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic"><span className="italic">I</span></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline"><span className="underline">U</span></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))} title="Strikethrough"><span className="line-through">S</span></button>
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={btnClass(editor.isActive('highlight'))} title="Highlight"><span className="bg-yellow-200 px-1 rounded text-black">Mark</span></button>
      <button onClick={setLink} className={btnClass(editor.isActive('link'))} title="Add Link">🔗</button>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left">⫷</button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center">≡</button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right">⫸</button>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List">• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Numbered List">1. List</button>
      <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={btnClass(editor.isActive('taskList'))} title="Task List">☑ Task</button>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Quote">❞ Quote</button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))} title="Code Block">{"</>"}</button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="px-2.5 py-1.5 text-sm font-medium rounded text-gray-600 hover:bg-gray-200" title="Divider Line">—</button>
    </div>
  );
};

// --- MODAL PROPS ---
export interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  noteId?: number | null;
  permission?: "view" | "edit";
  onSaved?: () => void;
}

const NoteEditor = ({ isOpen, onClose, noteId, permission, onSaved }: NoteEditorProps) => {
  const { user } = useAuth();
  const isEditMode = Boolean(noteId);

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [noteTags, setNoteTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  
  const [shares, setShares] = useState<SharedNote[]>([]);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState<"view" | "edit">("view");

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"note" | "tags" | "share">("note");

  const printRef = useRef<HTMLDivElement>(null);

  const isOwner = note ? note.owner_id === user?.id : true;
  const isReadOnly = !isOwner && permission === "view";

  const editor = useEditor({
    extensions: TIPTAP_EXTENSIONS,
    content: "",
    editable: !isReadOnly,
    editorProps: { attributes: { class: 'focus:outline-none min-h-[250px]' } },
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  useEffect(() => {
    if (!isOpen) return;
    setError(""); setSaveSuccess(false); setActiveTab("note");

    if (!noteId) {
      setNote(null); setTitle(""); setContent(""); setNoteTags([]); setShares([]);
      if (editor) editor.commands.setContent("");
      setIsLoading(false);
    } else {
      setIsLoading(true);
      getNote(noteId)
        .then((res) => {
          const n = res.data;
          setNote(n); setTitle(n.title); setContent(n.content || ""); setNoteTags(n.tags);
          if (editor && n.content) editor.commands.setContent(n.content);
        })
        .catch(() => setError("Failed to load note"))
        .finally(() => setIsLoading(false));

    }

    listTags().then((res) => setAllTags(res.data)).catch(() => {});
  }, [isOpen, noteId, editor]);

useEffect(() => {
    if (!note || !user || !isOpen) return;
    
    if (note.owner_id === user.id) {
      listNoteShares(note.id)
        .then((res) => setShares(res.data))
        .catch(() => {});
    }
  }, [note, user, isOpen]);

  const handleDownloadPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: title ? title.replace(/\s+/g, '_') : 'Untitled_Note',
  });

  const handleSave = async () => {
    if (isReadOnly) return;
    if (!title.trim()) { setError("Title is required"); return; }
    setIsSaving(true); setError(""); setSaveSuccess(false);
    try {
      if (isEditMode && noteId) {
        const res = await updateNote(noteId, { title, content });
        setNote(res.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        if (onSaved) onSaved();
      } else {
        await createNote(title, content);
        if (onSaved) onSaved();
        onClose();
      }
    } catch (err: any) { setError(err.response?.data?.detail || "Failed to save note"); } 
    finally { setIsSaving(false); }
  };

  const handleArchive = async () => { 
    if (!noteId || !isOwner) return;
    try { const res = await toggleArchive(noteId); setNote(res.data); if (onSaved) onSaved(); } catch { alert("Failed to toggle archive"); }
  };
  const handleAddTag = async (tagId: number) => { 
    if (!noteId || !isOwner) return;
    try { const res = await addTagToNote(noteId, tagId); setNoteTags(res.data.tags); if(onSaved) onSaved(); } catch { alert("Failed to add tag"); }
  };
  const handleRemoveTag = async (tagId: number) => { 
    if (!noteId || !isOwner) return;
    try { const res = await removeTagFromNote(noteId, tagId); setNoteTags(res.data.tags); if(onSaved) onSaved(); } catch { alert("Failed to remove tag"); }
  };
  const handleCreateTag = async () => { 
    if (!newTagName.trim() || !isOwner) return;
    try {
      const res = await createTag(newTagName.trim());
      setAllTags((prev) => [...prev, res.data]);
      setNewTagName("");
      if (noteId) await handleAddTag(res.data.id);
    } catch (err: any) { alert(err.response?.data?.detail || "Failed to create tag"); }
  };
  const handleShare = async () => { 
    if (!noteId || !shareEmail.trim() || !isOwner) return;
    setShareError(""); setShareSuccess("");
    try {
      const res = await shareNote(noteId, shareEmail.trim(), sharePermission);
      setShares((prev) => {
        const exists = prev.find((s) => s.id === res.data.id);
        if (exists) return prev.map((s) => (s.id === res.data.id ? res.data : s));
        return [...prev, res.data];
      });
      setShareEmail(""); setShareSuccess(`Shared with ${shareEmail}`);
      setTimeout(() => setShareSuccess(""), 3000);
    } catch (err: any) { setShareError(err.response?.data?.detail || "Failed to share"); }
  };
  const handleRevokeShare = async (userId: number) => { 
    if (!noteId || !isOwner) return;
    if (!confirm("Are you sure you want to revoke access?")) return;
    try { await revokeShare(noteId, userId); setShares((prev) => prev.filter((s) => s.shared_with_user_id !== userId)); } catch { alert("Failed to revoke"); }
  };
  const handleUpdatePermission = async (userId: number, permission: "view" | "edit") => { 
    if (!noteId || !isOwner) return;
    try { const res = await updateSharePermission(noteId, userId, permission); setShares((prev) => prev.map((s) => (s.shared_with_user_id === userId ? res.data : s))); } catch { alert("Failed to update permission"); }
  };

  if (!isOpen) return null;
  const availableTags = allTags.filter((t) => !noteTags.some((nt) => nt.id === t.id));

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden relative">
        
        {/* MODAL HEADER */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/90 sticky top-0 z-10">
          <button onClick={onClose} className="group flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            {isReadOnly && <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold px-2 md:px-3 py-1.5 rounded-lg">View Only</span>}
            <button onClick={() => handleDownloadPDF()} className="bg-emerald-600 hover:bg-emerald-800 text-white font-medium px-3 md:px-4 py-1.5 rounded-lg text-sm shadow-sm transition-all whitespace-nowrap">PDF</button>
            {isEditMode && isOwner && note && (
              <button onClick={handleArchive} className={`text-sm font-medium px-3 md:px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap ${note.is_archived ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {note.is_archived ? "Unarchive" : "Archive"}
              </button>
            )}
            {!isReadOnly && (
              <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 md:px-5 py-1.5 rounded-lg text-sm shadow-sm transition-all disabled:opacity-50 whitespace-nowrap">
                {isSaving ? "Saving..." : isEditMode ? "Save" : "Create"}
              </button>
            )}
          </div>
        </div>

        {/* HIDDEN PRINT CONTAINER */}
        <div style={{ display: "none" }}>
          <div ref={printRef} className="prose prose-sm sm:prose-base lg:prose-lg max-w-none print-content" style={{ padding: '40px', color: '#000', wordWrap: 'break-word' }}>
            <style type="text/css" media="print">
              {`@page { margin: 20mm; } ${EditorStyles}`}
            </style>
            <h1 className="border-b border-gray-300 pb-2 mb-6 text-4xl font-bold mt-0 break-words">{title || 'Untitled Note'}</h1>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>

        {/* SCROLLABLE MODAL BODY */}
        <div className="overflow-y-auto flex-1 p-4 md:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              {saveSuccess && <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">Note saved successfully!</div>}

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                readOnly={isReadOnly}
                placeholder="Untitled Note"
                className="w-full text-3xl md:text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 bg-transparent mb-6 p-0 outline-none read-only:text-gray-700 break-words"
              />

              {isEditMode && (
                <div className="flex gap-6 mb-6 border-b border-gray-100 overflow-x-auto">
                  {(["note", "tags", "share"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-blue-600" : "text-gray-500 hover:text-gray-800"}`}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                    </button>
                  ))}
                </div>
              )}

              {/* TAB: NOTE */}
              {activeTab === "note" && (
                <div className={`border rounded-xl bg-white transition-colors ${isReadOnly ? 'border-transparent' : 'border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 shadow-sm'}`}>
                  {!isReadOnly && <MenuBar editor={editor} />}
                  
                  {/* INJECT UNIFIED STYLES */}
                  <style>{EditorStyles}</style>

                  {/* PROSE WRAPPER */}
                  <div className="prose prose-sm sm:prose-base max-w-none prose-p:my-1 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-headings:font-bold prose-headings:text-gray-900 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 p-4 md:p-6 min-h-[300px] break-words overflow-wrap-anywhere">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              )}

              {/* TAB: TAGS */}
              {activeTab === "tags" && isEditMode && (
                <div className="animate-fade-in pt-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Current Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {noteTags.length === 0 && <span className="text-sm text-gray-400 italic">No tags added yet.</span>}
                    {noteTags.map((tag) => (
                      <span key={tag.id} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {tag.name}
                        {isOwner && <button onClick={() => handleRemoveTag(tag.id)} className="ml-2 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-blue-200 text-blue-500 hover:text-blue-800 transition-colors">×</button>}
                      </span>
                    ))}
                  </div>

                  {isOwner && (
                    <>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Add Existing Tag</h3>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {availableTags.length === 0 && <span className="text-sm text-gray-400">All available tags are already applied.</span>}
                        {availableTags.map((tag) => (
                          <button key={tag.id} onClick={() => handleAddTag(tag.id)} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors">+ {tag.name}</button>
                        ))}
                      </div>

                      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Create New Tag</h3>
                      <div className="flex gap-3 max-w-md">
                        <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="e.g. Project Ideas" className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                        <button onClick={handleCreateTag} disabled={!newTagName.trim()} className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">Create</button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB: SHARE */}
              {activeTab === "share" && isEditMode && (
                <div className="animate-fade-in pt-2">
                  {isOwner ? (
                    <>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Share with others</h3>
                      {shareError && <div className="mb-4 text-red-600 text-sm">{shareError}</div>}
                      {shareSuccess && <div className="mb-4 text-green-600 text-sm">{shareSuccess}</div>}
                      <div className="flex flex-col sm:flex-row gap-3 mb-10">
                        <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="Enter email address" className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                        <div className="flex gap-3">
                          <select value={sharePermission} onChange={(e) => setSharePermission(e.target.value as "view" | "edit")} className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                            <option value="view">Can View</option>
                            <option value="edit">Can Edit</option>
                          </select>
                          <button onClick={handleShare} disabled={!shareEmail.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap">Send Invite</button>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">People with access</h3>
                      {shares.length === 0 ? (
                        <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100">This note is not shared with anyone yet.</p>
                      ) : (
                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
                          {shares.map((s) => (
                            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">{s.shared_with_email?.charAt(0).toUpperCase()}</div>
                                <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{s.shared_with_email}</span>
                              </div>
                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                <select value={s.permission} onChange={(e) => handleUpdatePermission(s.shared_with_user_id, e.target.value as "view" | "edit")} className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 cursor-pointer">
                                  <option value="view">Viewer</option>
                                  <option value="edit">Editor</option>
                                </select>
                                <button onClick={() => handleRevokeShare(s.shared_with_user_id)} className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors">Revoke</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg text-center">
                      <h3 className="text-blue-800 font-medium mb-1">Shared Note</h3>
                      <p className="text-sm text-blue-600">You do not have permission to manage sharing settings for this note.</p>
                    </div>
                  )}
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