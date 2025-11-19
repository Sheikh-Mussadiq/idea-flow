import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function InviteForm({ activeBoard, setBoards, currentUser }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");

  if (!activeBoard) return null;

  const handleSend = () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    const invite = {
      id: crypto.randomUUID(),
      email: trimmed,
      invitedBy: currentUser.name,
      role,
      status: "pending",
    };

    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoard.id
          ? {
              ...board,
              invites: [...(board.invites || []), invite],
              activity: [
                {
                  id: Date.now().toString(),
                  timestamp: Date.now(),
                  user: currentUser.name,
                  action: `Invited ${trimmed} as ${role}`,
                },
                ...(board.activity || []),
              ],
            }
          : board
      )
    );

    setEmail("");
    setRole("viewer");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email…"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <div className="flex items-center gap-2">
        <select
          className="h-8 rounded-full border border-neutral-200/60 bg-neutral-50 px-2 text-xs capitalize flex-1"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <Button
          type="button"
          size="sm"
          className="h-8 px-3 text-xs"
          disabled={!email.trim()}
          onClick={handleSend}
        >
          Send invite
        </Button>
      </div>
    </div>
  );
}

export function BoardMembersSheet({
  open,
  onOpenChange,
  activeBoard,
  setBoards,
  currentUser,
  isAdmin,
}) {
  if (!activeBoard) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Board members</SheetTitle>
          <SheetDescription className="text-xs">
            Manage who has access to this board and their roles.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4 text-xs">
          <div className="space-y-2">
            <div className="font-medium">Members</div>
            <div className="space-y-2">
              {(activeBoard.members || []).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200/60 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 border border-neutral-200/60">
                      <AvatarFallback className="bg-primary-500/10 text-primary-500 text-xs font-medium">
                        {member.avatar || member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs font-medium">{member.name}</div>
                      <div className="text-xs text-neutral-500">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="h-7 rounded-full border border-neutral-200/60 bg-neutral-50 px-2 text-xs capitalize"
                      value={member.role}
                      disabled={!isAdmin}
                      onChange={(e) => {
                        const nextRole = e.target.value;
                        setBoards((prev) =>
                          prev.map((board) =>
                            board.id === activeBoard.id
                              ? {
                                  ...board,
                                  members: (board.members || []).map((m) =>
                                    m.id === member.id
                                      ? { ...m, role: nextRole }
                                      : m
                                  ),
                                  activity: [
                                    {
                                      id: Date.now().toString(),
                                      timestamp: Date.now(),
                                      user: currentUser.name,
                                      action: `Changed ${member.name}'s role to ${nextRole}`,
                                    },
                                    ...(board.activity || []),
                                  ],
                                }
                              : board
                          )
                        );
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!isAdmin || member.id === currentUser.id}
                      className="h-7 px-2 text-xs text-neutral-500 hover:text-error-500"
                      onClick={() => {
                        setBoards((prev) =>
                          prev.map((board) =>
                            board.id === activeBoard.id
                              ? {
                                  ...board,
                                  members: (board.members || []).filter(
                                    (m) => m.id !== member.id
                                  ),
                                  activity: [
                                    {
                                      id: Date.now().toString(),
                                      timestamp: Date.now(),
                                      user: currentUser.name,
                                      action: `Removed ${member.name} from the board`,
                                    },
                                    ...(board.activity || []),
                                  ],
                                }
                              : board
                          )
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Invite user</div>
            <InviteForm
              activeBoard={activeBoard}
              setBoards={setBoards}
              currentUser={currentUser}
            />
          </div>

          <div className="space-y-2">
            <div className="font-medium">Pending invites</div>
            <div className="space-y-2">
              {(activeBoard.invites || []).length === 0 && (
                <div className="text-xs text-neutral-500">No invites yet.</div>
              )}
              {(activeBoard.invites || []).map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200/60 bg-white px-3 py-2"
                >
                  <div>
                    <div className="text-xs font-medium">{invite.email}</div>
                    <div className="text-xs text-neutral-500">
                      {invite.role} • Invited by {invite.invitedBy}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs capitalize text-neutral-500">
                      {invite.status}
                    </span>
                    {invite.status === "pending" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!isAdmin}
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setBoards((prev) =>
                            prev.map((board) => {
                              if (board.id !== activeBoard.id) return board;
                              const existingMember = (board.members || []).find(
                                (m) => m.email === invite.email
                              );
                              const nextMembers = existingMember
                                ? board.members
                                : [
                                    ...(board.members || []),
                                    {
                                      id: crypto.randomUUID(),
                                      name: invite.email.split("@")[0],
                                      email: invite.email,
                                      avatar: invite.email
                                        .charAt(0)
                                        .toUpperCase(),
                                      role: invite.role,
                                    },
                                  ];
                              return {
                                ...board,
                                members: nextMembers,
                                invites: (board.invites || []).map((i) =>
                                  i.id === invite.id
                                    ? { ...i, status: "accepted" }
                                    : i
                                ),
                                activity: [
                                  {
                                    id: Date.now().toString(),
                                    timestamp: Date.now(),
                                    user: currentUser.name,
                                    action: `Accepted invite for ${invite.email}`,
                                  },
                                  ...(board.activity || []),
                                ],
                              };
                            })
                          );
                        }}
                      >
                        Accept invite
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
