import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Mail, UserMinus } from "lucide-react";
import { Button } from "../../ui/button";

export const TeamTab = ({
  members = [],
  onRemove,
  onInvite,
  canEdit = true,
}) => {
  const getRoleColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      case "admin":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "member":
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300";
      default:
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Members list */}
      <div className="space-y-2">
        {members.map((member) => {
          const memberId = member.user?.id || member.user_id || member.id;
          const memberName = member.user?.full_name || member.name;
          const memberEmail = member.user?.email || member.email;
          const memberAvatar = member.user?.avatar_url || member.avatar;
          return (
            <div
              key={memberId}
              className="group flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm transition-all"
            >
              <Avatar className="h-10 w-10 border border-neutral-200 dark:border-neutral-700">
                <AvatarFallback className="bg-primary-500/10 text-primary-500 text-sm font-medium">
                  {memberAvatar || memberName?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200 truncate">
                  {memberName}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {memberEmail}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                    member.role
                  )}`}
                >
                  {member.role || "Member"}
                </span>
                {canEdit && member.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove?.(memberId)}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-error-500 dark:text-neutral-500 dark:hover:text-error-400 transition-opacity"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {members.length === 0 && (
        <div className="py-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
          No team members assigned yet.
        </div>
      )}

      {/* Invite button */}
      {canEdit && (
        <Button
          onClick={onInvite}
          variant="outline"
          className="w-full border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <Mail className="h-4 w-4 mr-2" />
          Invite team member
        </Button>
      )}
    </div>
  );
};
