import { X, Lock, Globe, Users, Bell, Archive } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useState } from "react";
import { toast } from "sonner";

export const BoardSettingsModal = ({ isOpen, onClose, board }) => {
  const [settings, setSettings] = useState({
    name: board?.name || "",
    description: board?.description || "",
    visibility: board?.visibility || "private",
    allowComments: board?.allowComments ?? true,
    allowInvites: board?.allowInvites ?? true,
    emailNotifications: board?.emailNotifications ?? true,
    autoArchive: board?.autoArchive ?? false,
  });

  const handleSave = () => {
    toast.success("Board settings saved successfully!");
    console.log("Saved settings:", settings);
    onClose();
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

              <div className="space-y-2">
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
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
