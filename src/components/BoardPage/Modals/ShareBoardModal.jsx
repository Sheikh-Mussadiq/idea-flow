import { X, Link, Copy, UserPlus, Shield, Trash2, Check } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export const ShareBoardModal = ({ isOpen, onClose, board }) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [copied, setCopied] = useState(false);

  // Mock members data
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "You",
      email: "you@example.com",
      role: "admin",
      avatar: "YO",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "editor",
      avatar: "SJ",
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike@example.com",
      role: "viewer",
      avatar: "MC",
    },
  ]);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    toast.success(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
    setInviteEmail("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://ideaflow.app/board/${board?.id || "123"}`
    );
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = (memberId) => {
    setMembers(members.filter((m) => m.id !== memberId));
    toast.success("Member removed from board");
  };

  const handleUpdateRole = (memberId, newRole) => {
    setMembers(
      members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    toast.success("Member role updated");
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
            {/* Invite Section */}
            <div className="space-y-4">
              <form onSubmit={handleInvite} className="flex gap-2">
                <div className="flex-1 relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Email address"
                    className="pl-9 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-24 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      {inviteRole === "admin"
                        ? "Admin"
                        : inviteRole === "editor"
                        ? "Editor"
                        : "Viewer"}
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
                    <DropdownMenuItem
                      onClick={() => setInviteRole("admin")}
                      className="dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  Invite
                </Button>
              </form>

              <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <Link className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Anyone with the link can view
                  </p>
                  <p className="text-sm text-neutral-900 dark:text-white truncate">
                    https://ideaflow.app/board/{board?.id || "123"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {copied ? "Copied" : "Copy Link"}
                  </span>
                </Button>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Members with access
              </h3>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-neutral-200 dark:border-neutral-700">
                        <AvatarFallback className="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 text-xs font-medium">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {member.name}{" "}
                          {member.id === 1 && (
                            <span className="text-neutral-400 font-normal">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={member.id === 1}
                            className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                          >
                            <span className="capitalize">{member.role}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="dark:bg-neutral-900 dark:border-neutral-700"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateRole(member.id, "viewer")
                            }
                            className="dark:text-neutral-200 dark:hover:bg-neutral-800"
                          >
                            Viewer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateRole(member.id, "editor")
                            }
                            className="dark:text-neutral-200 dark:hover:bg-neutral-800"
                          >
                            Editor
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(member.id, "admin")}
                            className="dark:text-neutral-200 dark:hover:bg-neutral-800"
                          >
                            Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {member.id !== 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
