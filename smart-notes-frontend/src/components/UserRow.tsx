import type { User } from "../types/index";

export interface UserRowProps {
  user: User;
  isSelected: boolean;
  onViewNotes: (user: User) => void;
  onDeactivate: (user: User) => void;
  onReactivate: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserRow({
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