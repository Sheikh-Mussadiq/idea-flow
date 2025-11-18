import { AppSidebar } from "./AppSidebar.jsx";

export const AppLayout = ({ children }) => {
  return (
    <div className="h-screen w-full bg-neutral-50 text-neutral-900 flex">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-14 border-b border-neutral-200 bg-white/80 px-6 flex items-center justify-between">
          <div className="text-sm font-medium text-neutral-900">Dashboard</div>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <div className="h-7 w-7 rounded-full bg-primary-500/10 flex items-center justify-center text-[11px] font-medium text-primary-500">
              U
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden bg-neutral-50/60">
          {children}
        </main>
      </div>
    </div>
  );
};
