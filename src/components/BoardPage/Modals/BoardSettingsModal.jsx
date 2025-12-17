import { X, Lock, Globe, Users, Bell, Archive, Smile } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useBoard } from "../../../context/BoardContext";

const EMOJI_OPTIONS = [
  "🐳",
  "🚀",
  "💡",
  "🔥",
  "🎨",
  "💻",
  "📈",
  "📝",
  "📅",
  "⚙️",
  "🌟",
  "🎯",
  "🧩",
  "🎮",
  "🎧",
  "📸",
  "🎥",
  "🎤",
  "🎵",
  "📚",
  "💼",
  "💸",
  "🏠",
  "🚗",
  "✈️",
  "🌍",
  "🍔",
  "🍕",
  "⚽",
  "🏀",
];

export const BoardSettingsModal = ({ isOpen, onClose, board }) => {
  const { updateBoard, userCategories } = useBoard();
  const [settings, setSettings] = useState({
    name: board?.name || "",
    description: board?.description || "",
    icon: board?.icon || "🐳",
    category: board?.category || null,
    visibility: board?.visibility || "private",
    allowComments: board?.allowComments ?? true,
    allowInvites: board?.allowInvites ?? true,
    emailNotifications: board?.emailNotifications ?? true,
    autoArchive: board?.autoArchive ?? false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Update settings when board changes
  useEffect(() => {
    if (board) {
      setSettings({
        name: board.name || "",
        description: board.description || "",
        icon: board.icon || "🐳",
        category: board.category || null,
        visibility: board.visibility || "private",
        allowComments: board.allowComments ?? true,
        allowInvites: board.allowInvites ?? true,
        emailNotifications: board.emailNotifications ?? true,
        autoArchive: board.autoArchive ?? false,
      });
    }
  }, [board, isOpen]);

  const handleSave = async () => {
    if (!settings.name.trim()) {
      toast.error("Board name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await updateBoard(board.id, {
        name: settings.name,
        description: settings.description,
        icon: settings.icon,
        category: settings.category,
      });
      toast.success("Board settings saved successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving board settings:", error);
      toast.error("Failed to save board settings");
    } finally {
      setIsSaving(false);
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
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-neutral-200/60 dark:border-neutral-700/60 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                Board Settings
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Configure your board preferences
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
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* General Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General
              </h3>

              <div className="flex gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Icon
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="h-10 w-10 text-2xl flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {settings.icon}
                    </button>

                    {showEmojiPicker && (
                      <>
                        <div
                          className="fixed inset-0 z-0"
                          onClick={() => setShowEmojiPicker(false)}
                        />
                        <div className="absolute top-12 left-0 z-10 p-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl w-64 grid grid-cols-6 gap-1">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setSettings({ ...settings, icon: emoji });
                                setShowEmojiPicker(false);
                              }}
                              className="h-8 w-8 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Board Name
                  </label>
                  <Input
                    value={settings.name}
                    onChange={(e) =>
                      setSettings({ ...settings, name: e.target.value })
                    }
                    placeholder="Enter board name"
                    className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {userCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setSettings({ ...settings, category: category.name })
                      }
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border ${
                        settings.category === category.name
                          ? "bg-white dark:bg-neutral-800 border-primary-500 ring-1 ring-primary-500"
                          : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-neutral-700 dark:text-neutral-200">
                        {category.name}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, category: null })}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                      !settings.category
                        ? "bg-white dark:bg-neutral-800 border-primary-500 ring-1 ring-primary-500 text-neutral-900 dark:text-white"
                        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600"
                    }`}
                  >
                    No Category
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) =>
                    setSettings({ ...settings, description: e.target.value })
                  }
                  placeholder="Add a description for your board"
                  rows={5}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 whitespace-pre-wrap"
                />
              </div>
            </div>

            {/* Visibility & Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Visibility & Permissions
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <input
                    type="radio"
                    name="visibility"
                    checked={settings.visibility === "private"}
                    onChange={() =>
                      setSettings({ ...settings, visibility: "private" })
                    }
                    className="h-4 w-4 text-primary-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      <span className="font-medium text-neutral-900 dark:text-white">
                        Private
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Only invited members can view and edit
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <input
                    type="radio"
                    name="visibility"
                    checked={settings.visibility === "public"}
                    onChange={() =>
                      setSettings({ ...settings, visibility: "public" })
                    }
                    className="h-4 w-4 text-primary-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      <span className="font-medium text-neutral-900 dark:text-white">
                        Public
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Anyone with the link can view
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    <div>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Allow member invites
                      </span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Members can invite others
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowInvites}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        allowInvites: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded text-primary-500"
                  />
                </label>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferences
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      Email notifications
                    </span>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Receive updates via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded text-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Archive className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    <div>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Auto-archive completed tasks
                      </span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Archive tasks after 30 days
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoArchive}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoArchive: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded text-primary-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="dark:hover:bg-neutral-800"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
