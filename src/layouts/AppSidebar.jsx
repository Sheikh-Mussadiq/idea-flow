import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Sparkles,
  LayoutDashboard,
  BarChart3,
  Settings,
  Search,
  Star,
  Folder,
  Archive,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

const FAVORITES = [
  { id: "fav-ai-writer", icon: Star, label: "AI Writer" },
  { id: "fav-data-insights", icon: Star, label: "Data Insights" },
  { id: "fav-predictive-ai", icon: Star, label: "Predictive AI" },
];

const PROJECTS = [
  {
    id: "proj-sales-forecast",
    icon: Folder,
    label: "Sales Forecast",
    count: "2",
  },
  { id: "proj-sentiment-ai", icon: Folder, label: "Sentiment AI", count: "7" },
  {
    id: "proj-task-automate",
    icon: Folder,
    label: "Task Automate",
    count: "18",
    active: true,
  },
  { id: "proj-script-ai", icon: Folder, label: "Script AI", count: "3" },
  { id: "proj-lead-scoring", icon: Folder, label: "Lead Scoring", count: "15" },
  { id: "proj-heatmap-ai", icon: Folder, label: "Heatmap AI", count: "4" },
  { id: "proj-social-boost", icon: Folder, label: "Social Boost", count: "9" },
];

const CATEGORIES = [
  { id: "cat-marketing", icon: LayoutDashboard, label: "Marketing AI" },
  { id: "cat-chatbots", icon: LayoutDashboard, label: "Chatbots" },
  { id: "cat-finance", icon: LayoutDashboard, label: "Finance AI" },
];

const ARCHIVE = [
  { id: "archived-projects", icon: Archive, label: "Archived projects" },
];

const AI_FLOWS = [
  { id: "flow-main", icon: Sparkles, label: "Main Content Flow" },
  { id: "flow-marketing", icon: Sparkles, label: "Marketing Flow" },
  { id: "flow-experiments", icon: Sparkles, label: "Experiment Ideas" },
];

export const AppSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname || "/";

  let activePrimary = "home";
  if (pathname.startsWith("/flow")) activePrimary = "ai";
  else if (pathname.startsWith("/tasks")) activePrimary = "tasks";
  else if (pathname.startsWith("/analytics")) activePrimary = "analytics";
  else if (pathname.startsWith("/settings")) activePrimary = "settings";
  const [subOpen, setSubOpen] = useState(true);

  // Auto-expand contextual sidebar for sections that have extra content
  // and auto-collapse when switching to sections without contextual data.
  useEffect(() => {
    if (activePrimary === "ai" || activePrimary === "tasks") {
      setSubOpen(true);
    } else {
      setSubOpen(false);
    }
  }, [activePrimary]);

  const hasContext = activePrimary === "ai" || activePrimary === "tasks";

  return (
    <motion.aside
      className="px-3 py-4 flex flex-col"
      initial={false}
      animate={{
        width: hasContext
          ? subOpen
            ? 288 // full width when sub-sidebar open
            : 180 // primary rail + collapsed strip
          : 120, // compact when no contextual data
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <motion.div
        className="flex-1 rounded-3xl bg-white/95 border border-neutral-200/80 shadow-sm flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-100/80">
          <div className="h-9 w-9 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center text-sm font-semibold">
            IF
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              Idea Flow
            </span>
            <span className="text-xs text-neutral-500">Workspace</span>
          </div>
        </div>

        <nav className="flex-1 px-3 pb-3 text-xs">
          <div className="flex h-full gap-4">
            {/* Primary rail */}
            <div className="w-20 flex flex-col items-center space-y-1 pt-1">
              <SidebarPrimaryLink to="/" icon={Home} label="Home" />
              <SidebarPrimaryLink
                to="/flow"
                icon={Sparkles}
                label="AI Flow"
                subtle
              />
              <SidebarPrimaryLink
                to="/tasks"
                icon={LayoutDashboard}
                label="Tasks"
              />
              <SidebarPrimaryLink
                to="/analytics"
                icon={BarChart3}
                label="Analytics"
              />
              <SidebarPrimaryLink
                to="/settings"
                icon={Settings}
                label="Settings"
              />
            </div>

            {/* Contextual sub-sidebar */}
            <AnimatePresence mode="wait" initial={false}>
              {(activePrimary === "ai" || activePrimary === "tasks") && (
                <motion.div
                  key={`${activePrimary}-${subOpen ? "open" : "closed"}`}
                  className="overflow-hidden border-l border-neutral-100/80"
                  initial={{ opacity: 0, x: 8, width: 0 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    width: subOpen ? 240 : 40,
                  }}
                  exit={{ opacity: 0, x: -8, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="h-full flex flex-col pl-3 pr-1">
                    <div className="flex items-center justify-between mb-2">
                      {subOpen && (
                        <span className="text-[11px] font-medium text-neutral-500">
                          {activePrimary === "ai" ? "Flows" : "Boards"}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSubOpen((prev) => !prev)}
                        className="h-6 w-6 inline-flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors ml-auto"
                      >
                        <ChevronLeft
                          className={`h-3 w-3 transition-transform ${
                            subOpen ? "rotate-0" : "rotate-180"
                          }`}
                        />
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {subOpen && (
                        <motion.div
                          key="subsidebar-content"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="space-y-3"
                        >
                          {/* Search scoped to contextual sidebar */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="text"
                              placeholder={
                                activePrimary === "ai"
                                  ? "Search flows..."
                                  : "Search boards..."
                              }
                              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-9 py-2 text-xs text-neutral-700 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:border-primary-500/60"
                            />
                          </div>

                          {activePrimary === "ai" && (
                            <SidebarSection
                              label="All Flows"
                              items={AI_FLOWS}
                            />
                          )}

                          {activePrimary === "tasks" && (
                            <>
                              <SidebarSection
                                label="Favorites"
                                items={FAVORITES}
                              />
                              <SidebarSection
                                label="All Projects"
                                items={PROJECTS}
                              />
                              <SidebarSection
                                label="Categories"
                                items={CATEGORIES}
                              />
                              <SidebarSection label="Archive" items={ARCHIVE} />
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-neutral-100/80 mt-auto">
          <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-primary-500/5 via-primary-500/0 to-primary-500/10 p-3 text-xs">
            <div className="mb-1.5 font-semibold text-neutral-900">
              Unlock Premium Features
            </div>
            <p className="text-[11px] text-neutral-600 mb-3">
              Advanced AI, automation, and insights for your whole team.
            </p>
            <button className="w-full rounded-xl bg-primary-500 text-white text-xs font-medium py-2 hover:bg-primary-600 transition-colors">
              Upgrade to premium
            </button>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
};

const SidebarPrimaryLink = ({ to, icon: Icon, label, subtle = false }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        "group flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium transition-colors",
        subtle ? "text-neutral-500" : "text-neutral-600",
        isActive && !subtle
          ? "bg-primary-500/10 text-primary-600"
          : "hover:bg-neutral-100",
      ].join(" ")
    }
  >
    <Icon className="h-4 w-4 text-neutral-400 group-hover:text-neutral-500" />
    <span className="truncate text-[10px] leading-tight">{label}</span>
  </NavLink>
);

const SidebarSection = ({ label, items }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400 hover:text-neutral-500"
      >
        <span>{label}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="space-y-0.5 overflow-hidden"
          >
            {items.map((item) => (
              <SidebarItem key={item.id} {...item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, count, active = false }) => (
  <button
    type="button"
    className={[
      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-[11px] text-neutral-600 transition-colors",
      active ? "bg-neutral-100" : "hover:bg-neutral-50",
    ].join(" ")}
  >
    <span className="flex items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-neutral-400" />}
      <span>{label}</span>
    </span>
    {count && <span className="text-[10px] text-neutral-400">{count}</span>}
  </button>
);

export default AppSidebar;
