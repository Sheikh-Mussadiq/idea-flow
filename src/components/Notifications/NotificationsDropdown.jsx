import React from "react";
import { Check, Trash2, BellOff } from "lucide-react";
import { Button } from "../ui/button";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "../../context/NotificationsContext";
import { ScrollArea } from "../ui/scroll-area";

export const NotificationsDropdown = ({ onClose }) => {
  const { notifications, markAllAsRead, clearAll, markAsRead } = useNotifications();

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    // In a real app, this would navigate to the relevant task/board
    console.log("Navigate to:", notification);
  };

  return (
    <div className="w-80 md:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <h3 className="font-semibold text-neutral-900">Notifications</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={markAllAsRead}
            className="h-8 w-8 text-neutral-400 hover:text-primary-600"
            title="Mark all as read"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAll}
            className="h-8 w-8 text-neutral-400 hover:text-red-600"
            title="Clear all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <BellOff className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-neutral-100 bg-neutral-50 text-center">
        <button
          onClick={onClose}
          className="text-xs text-neutral-500 hover:text-neutral-900 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};
