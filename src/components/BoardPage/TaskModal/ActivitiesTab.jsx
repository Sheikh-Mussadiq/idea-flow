import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  CheckCircle,
  UserPlus,
  Calendar,
  Tag,
  Paperclip,
  MessageCircle,
} from "lucide-react";

export const ActivitiesTab = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "status_change":
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case "assigned":
        return <UserPlus className="h-4 w-4 text-primary-500" />;
      case "due_date":
        return <Calendar className="h-4 w-4 text-warning-500" />;
      case "label":
        return <Tag className="h-4 w-4 text-purple-500" />;
      case "attachment":
        return <Paperclip className="h-4 w-4 text-blue-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-neutral-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {activities.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-neutral-200 dark:bg-neutral-700" />

          {/* Activities */}
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="relative flex gap-3 pl-0"
              >
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0 h-8 w-8 flex items-center justify-center bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-neutral-900 dark:text-neutral-200">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {activity.action}
                        </span>
                      </p>
                      {activity.details && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {activity.details}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
          No activity yet. Actions on this task will appear here.
        </div>
      )}
    </div>
  );
};
