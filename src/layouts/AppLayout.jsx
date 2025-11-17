export const AppLayout = ({ children }) => {
  return (
    <div className="h-screen w-full bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card/80 flex flex-col">
        <div className="h-12 flex items-center px-4 border-b border-border/60 text-sm font-semibold">
          Idea Flow
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2 text-sm space-y-1">
          <button className="w-full text-left px-2 py-1 rounded-md hover:bg-muted">
            Board
          </button>
          <button className="w-full text-left px-2 py-1 rounded-md hover:bg-muted">
            Analytics
          </button>
          <button className="w-full text-left px-2 py-1 rounded-md hover:bg-muted">
            Settings
          </button>
        </nav>
        <div className="border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          Sidebar footer
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-12 border-b border-border bg-card/80 px-4 flex items-center justify-between">
          <div className="text-sm font-medium">Topbar / navigation</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>User</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};
