import { X, Plus, Move, MessageSquare, UserPlus, UserCheck, Tag, Trash2, Layout } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { mockBoardActivity } from "../../data/mockData";

const activityIcons = {
  plus: Plus,
  move: Move,
  message: MessageSquare,
  "user-plus": UserPlus,
  "user-check": UserCheck,
  tag: Tag,
  trash: Trash2,
  layout: Layout,
};

export const BoardActivityPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[440px] bg-white dark:bg-neutral-900 shadow-xl z-50 animate-slide-in-right flex flex-col border-l border-neutral-200/60 dark:border-neutral-700/60">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Board Activity
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Recent changes and updates
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {mockBoardActivity.map((activity) => {
              const IconComponent = activityIcons[activity.icon] || Layout;
              
              return (
                <div key={activity.id} className="flex gap-4">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 ring-2 ring-neutral-200 dark:ring-neutral-700 shrink-0">
                    <AvatarFallback className="bg-primary-500/10 text-primary-500 dark:bg-primary-500/20 text-sm font-medium">
                      {activity.user.avatar}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-neutral-900 dark:text-neutral-100">
                          <span className="font-semibold">{activity.user.name}</span>
                          {" "}
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {activity.action}
                          </span>
                          {" "}
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {activity.target}
                          </span>
                          {activity.details && (
                            <span className="text-neutral-600 dark:text-neutral-400">
                              {" "}{activity.details}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                      
                      {/* Icon */}
                      <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                        <IconComponent className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200/60 dark:border-neutral-700/60 bg-neutral-50 dark:bg-neutral-950">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            Showing recent activity from the last 7 days
          </p>
        </div>
      </div>
    </>
  );
};
