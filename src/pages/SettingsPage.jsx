import { AppLayout } from "../layouts/AppLayout.jsx";
import { ThemeToggle } from "../components/ThemeToggle.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";

const SettingsPage = () => {
  const { currentUser } = useAuth();

  const initials =
    currentUser?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "UU";

  return (
    <AppLayout>
      <div className="h-full w-full flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-3xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Settings
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Manage your appearance and account preferences.
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <Avatar className="h-12 w-12 border border-neutral-200 dark:border-neutral-700">
              <AvatarImage src={currentUser?.avatar_url} />
              <AvatarFallback className="bg-primary-900 text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {currentUser?.full_name || "User"}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {currentUser?.email || "Email not available"}
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Manage account
            </Button>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Appearance
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Choose light, dark, or follow your system preference.
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
