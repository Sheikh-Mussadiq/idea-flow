import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Plus, X } from "lucide-react";

export const AvatarGroup = ({ members, maxDisplay = 3, onAddMember, onRemoveMember, size = "md", canEdit = true }) => {
  const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const displayMembers = members?.slice(0, maxDisplay) || [];
  const remaining = members?.length > maxDisplay ? members.length - maxDisplay : 0;

  const getMemberId = (member) => member.user?.id || member.user_id || member.id;
  const getMemberName = (member) => member.user?.full_name || member.name || member.user?.email || "?";
  const getMemberAvatar = (member) => member.user?.avatar_url || member.avatar_url;

  return (
    <div className="flex items-center">
      <div className="flex items-center -space-x-2">
        {displayMembers.map((member, index) => {
          const memberId = getMemberId(member);
          const memberName = getMemberName(member);
          const memberAvatar = getMemberAvatar(member);
          return (
            <div key={memberId || index} className="relative group">
          <Avatar
            className={`${sizeClass} border-2 border-white ring-1 ring-neutral-200 hover:z-10 transition-all`}
          >
                <AvatarImage src={memberAvatar} />
                <AvatarFallback className="bg-primary-500/10 text-primary-500 font-medium">
                  {memberName?.charAt(0) || "?"}
                </AvatarFallback>
          </Avatar>
              {canEdit && onRemoveMember && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveMember(member);
                  }}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                  title={`Remove ${memberName}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          );
        })}
        {remaining > 0 && (
          <div
            className={`${sizeClass} flex items-center justify-center rounded-full border-2 border-white bg-neutral-100 text-neutral-600 font-medium ring-1 ring-neutral-200`}
          >
            +{remaining}
          </div>
        )}
      </div>
      {onAddMember && (
        <button
          onClick={onAddMember}
          className={`${sizeClass} ml-2 flex items-center justify-center rounded-full border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-primary-400 hover:text-primary-500 transition-colors`}
        >
          <Plus className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
