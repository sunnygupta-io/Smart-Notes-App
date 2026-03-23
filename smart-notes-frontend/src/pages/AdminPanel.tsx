import { useState, useEffect, useCallback } from "react";
import {
  listAllUsers,
  getUserNotes,
  deactivateUser,
  reactivateUser,
  deleteUser,
  getPlatformStats
} from "../api/admin";
import type { User, Note, PlatformStats } from "../types/index";

type ActiveView =
  | { type: "none" }
  | { type: "notes"; user: User };

export default function AdminPanel() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 4;

  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [activeView, setActiveView] = useState<ActiveView>({ type: "none" });
  const [userNotes, setUserNotes] = useState<Note[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlatformStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params: any = { page, page_size: PAGE_SIZE };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter === "active";

      const res = await listAllUsers(params);
      setUsers(res.data.items);
      setTotal(res.data.total);
    } catch {
      setError("Failed to load users. Please try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  const handleViewNotes = async (user: User) => {
    setActiveView({ type: "notes", user });
    setIsLoadingNotes(true);
    try {
      const res = await getUserNotes(user.id);
      setUserNotes(res.data);
    } catch {
      setUserNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleDeactivate = async (user: User) => {
    if (!confirm(`Deactivate ${user.email}? They won't be able to log in.`)) return;
    try {
      const res = await deactivateUser(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to deactivate user");
    }
  };

  const handleReactivate = async (user: User) => {
    try {
      const res = await reactivateUser(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to reactivate user");
    }
  };

  const handleDelete = async (user: User) => {
    if(
      !confirm(
        `Permanently delete ${user.email}?\n\nThis will delete ALL their notes and data. This cannot be undone.`
      )
    ) return;

    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotal((prev) => prev - 1);
      
      if (activeView.type === "notes" && activeView.user.id === user.id) {
        setActiveView({ type: "none" });
      }
      getPlatformStats()
        .then((res) => setStats(res.data))
        .catch(() => {});
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete user");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Console</h1>
          <p className="text-sm text-gray-500 mt-1">Manage users, monitor activity, and oversee platform health.</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard
              icon="👥"
              label="Total Users"
              value={stats.users.total}
              sub={`${stats.users.active} active · ${stats.users.inactive} inactive`}
            />
            <StatCard
              icon="📝"
              label="Total Notes"
              value={stats.notes.total}
              sub={`${stats.notes.active} active · ${stats.notes.archived} archived`}
            />
            <StatCard 
              icon="🏷️" 
              label="Total Tags" 
              value={stats.tags} 
              sub="Across all users" 
            />
            <StatCard
              icon="🤝"
              label="Active Shares"
              value={stats.active_shares}
              sub={`${stats.unread_notifications} unread notifications`}
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 w-full min-w-0">
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer bg-gray-50 hover:bg-white transition-all"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer bg-gray-50 hover:bg-white transition-all"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {(roleFilter || statusFilter) && (
                <button
                  onClick={() => {
                    setRoleFilter("");
                    setStatusFilter("");
                  }}
                  className="w-full sm:w-auto text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}

              <span className="ml-auto text-sm font-medium text-gray-500 hidden sm:block">
                {total} {total === 1 ? "User" : "Users"}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                <span className="font-bold">!</span> {error}
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                            <span className="text-gray-500">Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-gray-500">
                          No users found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          isSelected={
                            activeView.type === "notes" &&
                            activeView.user.id === user.id
                          }
                          onViewNotes={handleViewNotes}
                          onDeactivate={handleDeactivate}
                          onReactivate={handleReactivate}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    Prev
                  </button>
                  <span className="px-4 text-sm text-gray-500 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {activeView.type === "notes" && (
            <div className="w-full lg:w-96 shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)] sticky top-24">
              <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    User Notes
                  </h3>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">
                    {activeView.user.email}
                  </p>
                </div>
                <button
                  onClick={() => setActiveView({ type: "none" })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1 bg-gray-50/50">
                {isLoadingNotes ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : userNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-3xl mb-2 block">📄</span>
                    <p className="text-sm text-gray-500">This user hasn't created any notes.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-semibold text-gray-900 leading-snug">
                            {note.title}
                          </p>
                          {note.is_archived && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md shrink-0">
                              Archived
                            </span>
                          )}
                        </div>

                        {note.content && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                            {note.content}
                          </p>
                        )}

                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {note.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                          Updated: {new Date(note.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Components ────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  sub?: string;
  icon: string;
}

function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {sub && <p className="text-xs font-medium text-gray-400">{sub}</p>}
    </div>
  );
}

interface UserRowProps {
  user: User;
  isSelected: boolean;
  onViewNotes: (user: User) => void;
  onDeactivate: (user: User) => void;
  onReactivate: (user: User) => void;
  onDelete: (user: User) => void;
}

function UserRow({
  user,
  isSelected,
  onViewNotes,
  onDeactivate,
  onReactivate,
  onDelete,
}: UserRowProps) {
  const isAdmin = user.role === "admin";

  return (
    <tr
      className={`transition-colors border-l-4 ${
        isSelected
          ? "bg-blue-50/50 border-blue-500"
          : "hover:bg-gray-50 border-transparent"
      }`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold border border-gray-300">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-900">{user.email}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
            isAdmin
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {user.role}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-sm text-gray-600 font-medium">
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-gray-500 text-sm">
        {new Date(user.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>

      <td className="px-6 py-4 text-right">
        {isAdmin ? (
          <span className="text-xs text-gray-400 italic px-3">Protected</span>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onViewNotes(user)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 bg-blue-50 hover:bg-blue-100"
              }`}
            >
              Notes
            </button>

            {user.is_active ? (
              <button
                onClick={() => onDeactivate(user)}
                className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Deactivate
              </button>
            ) : (
              <button
                onClick={() => onReactivate(user)}
                className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Reactivate
              </button>
            )}

            <button
              onClick={() => onDelete(user)}
              className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}