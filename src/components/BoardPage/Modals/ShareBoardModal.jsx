import { X, UserPlus, Shield, Trash2, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useBoard } from "../../../context/BoardContext";
import { useAuth } from "../../../context/AuthContext";
import { userService } from "../../../services/userService";
import { useBoardPresence } from "../../../hooks/useBoardPresence";

export const ShareBoardModal = ({ isOpen, onClose, board }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const { addMember, updateMemberRole, removeMember } = useBoard();
  const { currentUser } = useAuth();
  const { onlineUsers } = useBoardPresence(board?.id);

  // Get members from board prop
  const members = board?.members || [];
  const isOwner = board?.owner_id === currentUser?.id;

  // Create a set of online user IDs for quick lookup
  const onlineUserIds = new Set(onlineUsers.map((u) => u.id));

  // Sort members: online users first
  const sortedMembers = [...members].sort((a, b) => {
    const aOnline = onlineUserIds.has(a.user?.id);
    const bOnline = onlineUserIds.has(b.user?.id);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return 0;
  });

  // Debounced search for users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await userService.searchUsers(searchQuery);
        // Filter out users who are already members or the owner
        const existingMemberIds = members.map((m) => m.user?.id);
        const filteredResults = results.filter(
          (user) =>
            user.id !== board?.owner_id && !existingMemberIds.includes(user.id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, members, board?.owner_id]);

  const handleAddMember = async (user) => {
    if (!board?.id || isAddingMember) return;

    setIsAddingMember(true);
    try {
      await addMember(board.id, user.id, inviteRole);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!board?.id) return;
    try {
      await removeMember(board.id, userId);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!board?.id) return;
    try {
      await updateMemberRole(board.id, userId, newRole);
    } catch (error) {
      // Error handled in context
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col border border-neutral-200/60 dark:border-neutral-700/60 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Share Board
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Manage access to {board?.name}
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

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Search and Add Member Section - Only for owners */}
            {isOwner && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users by name or email..."
                      className="pl-9 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 animate-spin" />
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-24 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        {inviteRole === "editor" ? "Editor" : "Viewer"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="dark:bg-neutral-900 dark:border-neutral-700"
                    >
                      <DropdownMenuItem
                        onClick={() => setInviteRole("viewer")}
                        className="dark:text-neutral-200 dark:hover:bg-neutral-800"
                      >
                        Viewer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setInviteRole("editor")}
                        className="dark:text-neutral-200 dark:hover:bg-neutral-800"
                      >
                        Editor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer border-b border-neutral-200 dark:border-neutral-700 last:border-b-0"
                        onClick={() => handleAddMember(user)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-neutral-200 dark:border-neutral-700">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 text-xs font-medium">
                              {(user.full_name || user.username || "U")
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {/* {user.full_name || user.username} */}
                              {user.username}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {/* {user.username} */}
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400"
                          disabled={isAddingMember}
                        >
                          {isAddingMember ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Add"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && !isSearching && searchResults.length === 0 && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-2">
                    No users found matching "{searchQuery}"
                  </p>
                )}
              </div>
            )}

            {/* Owner Section */}
            {board?.owner && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Owner
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar
                        className={`h-9 w-9 border border-neutral-200 dark:border-neutral-700 ${
                          !onlineUserIds.has(board.owner.id) ? "opacity-75" : ""
                        }`}
                      >
                        <AvatarImage
                          src={board.owner.avatar_url}
                          className={
                            !onlineUserIds.has(board.owner.id)
                              ? "grayscale-[30%]"
                              : ""
                          }
                        />
                        <AvatarFallback className="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 text-xs font-medium">
                          {(board.owner.full_name || "O")
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 border-2 border-white dark:border-neutral-900 rounded-full ${
                          onlineUserIds.has(board.owner.id)
                            ? "bg-green-500"
                            : "bg-neutral-400 dark:bg-neutral-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                        {board.owner.full_name}
                        {board.owner.id === currentUser?.id && (
                          <span className="text-neutral-400 font-normal">
                            (you)
                          </span>
                        )}
                        <span
                          className={`text-xs font-normal ${
                            onlineUserIds.has(board.owner.id)
                              ? "text-green-600 dark:text-green-400"
                              : "text-neutral-400 dark:text-neutral-500"
                          }`}
                        >
                          •{" "}
                          {onlineUserIds.has(board.owner.id)
                            ? "Online"
                            : "Offline"}
                        </span>
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {board.owner.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Owner
                  </span>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Members ({members.length})
              </h3>

              <div className="space-y-3">
                {sortedMembers.length === 0 ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                    No members added yet
                  </p>
                ) : (
                  sortedMembers.map((member) => (
                    <div
                      key={member.user?.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar
                            className={`h-9 w-9 border border-neutral-200 dark:border-neutral-700 ${
                              !onlineUserIds.has(member.user?.id)
                                ? "opacity-75"
                                : ""
                            }`}
                          >
                            <AvatarImage
                              src={member.user?.avatar_url}
                              className={
                                !onlineUserIds.has(member.user?.id)
                                  ? "grayscale-[30%]"
                                  : ""
                              }
                            />
                            <AvatarFallback className="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 text-xs font-medium">
                              {(member.user?.full_name || "U")
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-2.5 w-2.5 border-2 border-white dark:border-neutral-900 rounded-full ${
                              onlineUserIds.has(member.user?.id)
                                ? "bg-green-500"
                                : "bg-neutral-400 dark:bg-neutral-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                            {member.user?.full_name}
                            {member.user?.id === currentUser?.id && (
                              <span className="text-neutral-400 font-normal">
                                (you)
                              </span>
                            )}
                            <span
                              className={`text-xs font-normal ${
                                onlineUserIds.has(member.user?.id)
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-neutral-400 dark:text-neutral-500"
                              }`}
                            >
                              •{" "}
                              {onlineUserIds.has(member.user?.id)
                                ? "Online"
                                : "Offline"}
                            </span>
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {member.user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner ? (
                          <>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                                >
                                  <span className="capitalize">
                                    {member.role}
                                  </span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="dark:bg-neutral-900 dark:border-neutral-700"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateRole(member.user?.id, "viewer")
                                  }
                                  className="dark:text-neutral-200 dark:hover:bg-neutral-800"
                                >
                                  Viewer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateRole(member.user?.id, "editor")
                                  }
                                  className="dark:text-neutral-200 dark:hover:bg-neutral-800"
                                >
                                  Editor
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveMember(member.user?.id)
                              }
                              className="text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
