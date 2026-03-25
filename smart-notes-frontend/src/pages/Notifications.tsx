import { useState, useEffect } from "react";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../api/notifications";
import type { Notification } from "../types/index";
import NotificationRow from "../components/NotificationRow";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);

  const fetchNotifications = async (
    currentPage: number,
    unreadOnlyFilter: boolean,
    append = false
  ) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await listNotifications(unreadOnlyFilter, currentPage);
      const data = res.data;

      if (append) {
        setNotifications((prev) => [...prev, ...data]);
      } else {
        setNotifications(data);
      }

      setHasMore(data.length === PAGE_SIZE);
    } catch {
      setError("Failed to load notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, unreadOnly);
    setPage(1);
  }, [unreadOnly]);

  const handleMarkRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      alert("Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      alert("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications? This cannot be undone.")) return;
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch {
      alert("Failed to clear notifications");
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, unreadOnly, true);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              Notifications
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="bg-gray-200/60 p-1 rounded-xl inline-flex gap-1 mb-8 shadow-inner">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !unreadOnly
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              unreadOnly
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Unread
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <span className="font-bold">!</span> {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 font-medium text-sm">Fetching notifications...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-lg font-semibold text-gray-900 mb-1">All caught up!</p>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {unreadOnly
                ? "You don't have any unread notifications at the moment."
                : "There are no notifications to show here."}
            </p>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load older notifications"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;