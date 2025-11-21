import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Plus } from "lucide-react";

export const AvatarGroup = ({ members, maxDisplay = 3, onAddMember, size = "md" }) => {
  const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const displayMembers = members?.slice(0, maxDisplay) || [];
  const remaining = members?.length > maxDisplay ? members.length - maxDisplay : 0;

  return (
    <div className="flex items-center">
      <div className="flex items-center -space-x-2">
        {displayMembers.map((member, index) => (
          <Avatar
            key={member.id || index}
            className={`${sizeClass} border-2 border-white ring-1 ring-neutral-200 hover:z-10 transition-all`}
          >
            <AvatarFallback className="bg-primary-500/10 text-primary-500 font-medium">
              {member.avatar || member.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        ))}
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
