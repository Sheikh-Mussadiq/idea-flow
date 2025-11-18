export const AppLayout = ({ children }) => {
  return (
    <div className="h-screen w-full bg-neutral-50 text-neutral-900 flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-neutral-200 bg-white/80 flex flex-col">
        <div className="h-12 flex items-center px-4 border-b border-neutral-200 text-sm font-semibold">
          Idea Flow
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2 text-sm space-y-1">
          <button className="w-full text-left px-2 py-1 rounded-md hover:bg-neutral-100">
            Board
          </button>
          <button className="w-full text-left px-2 py-1 rounded-md hover:bg-neutral-100">
            Analytics
          </button>
          <button className="w-full text-left px-2 py-1 rounded-md hover:bg-neutral-100">
            Settings
          </button>
        </nav>
        <div className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500">
          Sidebar footer
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-12 border-b border-neutral-200 bg-white/80 px-4 flex items-center justify-between">
          <div className="text-sm font-medium">Topbar / navigation</div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>User</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};
