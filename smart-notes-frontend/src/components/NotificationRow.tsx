import type { Notification } from "../types/index";

export interface NotificationRowProps {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function NotificationRow({ notification, onMarkRead, onDelete }: NotificationRowProps) {
  const formattedTime = new Date(notification.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
        notification.is_read
          ? "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
          : "bg-blue-50/50 border-blue-100 hover:border-blue-200 shadow-sm"
      }`}
    >
      <div className="mt-1.5 shrink-0 flex items-center justify-center w-4">
        <div
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            notification.is_read ? "bg-transparent" : "bg-blue-600 shadow-sm"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-relaxed ${
            notification.is_read ? "text-gray-600" : "text-gray-900 font-medium"
          }`}
        >
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1.5 font-medium">{formattedTime}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {!notification.is_read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
            title="Mark as read"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}