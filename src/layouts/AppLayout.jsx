import { AppSidebar } from "./AppSidebar.jsx";

export const AppLayout = ({ children }) => {
  return (
    <div className="h-screen w-full bg-neutral-50 flex overflow-hidden font-sans text-neutral-900">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
