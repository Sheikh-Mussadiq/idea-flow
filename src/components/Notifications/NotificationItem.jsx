import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AtSign,
  User,
  Clock,
  Zap,
  Mail,
  Shield,
  Bell,
} from "lucide-react";

const getIcon = (type) => {
  switch (type) {
    case "mention":
      return <AtSign className="h-4 w-4 text-blue-500" />;
    case "assignment":
      return <User className="h-4 w-4 text-green-500" />;
    case "due":
      return <Clock className="h-4 w-4 text-orange-500" />;
    case "activity":
      return <Zap className="h-4 w-4 text-yellow-500" />;
    case "invite":
      return <Mail className="h-4 w-4 text-purple-500" />;
    case "role":
      return <Shield className="h-4 w-4 text-red-500" />;
    default:
      return <Bell className="h-4 w-4 text-neutral-500" />;
  }
};

export const NotificationItem = ({ notification, onClick }) => {
  const containerClasses = `flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
    notification.read
      ? "bg-white hover:bg-neutral-50"
      : "bg-blue-50/50 hover:bg-blue-50"
  }`;

  const messageClasses = `text-sm leading-snug ${
    notification.read ? "text-neutral-600" : "text-neutral-900 font-medium"
  }`;

  return (
    <div
      onClick={() => onClick(notification)}
      className={containerClasses}
    >
      <div className="mt-1 flex-shrink-0 bg-white p-1.5 rounded-full shadow-sm border border-neutral-100">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={messageClasses}>
          {notification.message}
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>
      {!notification.read && (
        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
      )}
    </div>
  );
};
