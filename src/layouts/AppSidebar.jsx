import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Sparkles,
  LayoutDashboard,
  Settings,
  Search,
  Star,
  Archive,
  ChevronDown,
  Zap,
  HelpCircle,
  LogOut,
  Plus,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const PRIMARY_NAV = [
  { id: "home", icon: Home, label: "Home", to: "/" },
  { id: "ai-flow", icon: Zap, label: "AI Flow", to: "/flow" },
  { id: "tasks", icon: LayoutDashboard, label: "Tasks", to: "/board" },
];

const PROJECTS = [
  { id: 1, label: "Sales Forecast", count: 2, icon: Sparkles },
  { id: 2, label: "Sentiment AI", count: 7, icon: Sparkles },
  { id: 3, label: "Task Automate", count: 18, icon: Sparkles, active: true },
  { id: 4, label: "Script AI", count: 3, icon: Sparkles },
  { id: 5, label: "Lead Scoring", count: 15, icon: Sparkles },
  { id: 6, label: "Heatmap AI", count: 4, icon: Sparkles },
  { id: 7, label: "Social Boost", count: 9, icon: Sparkles },
];

const CATEGORIES = [
  { id: 1, label: "Marketing AI" },
  { id: 2, label: "Chatbots" },
  { id: 3, label: "Finance AI" },
];

export const AppSidebar = () => {
  const location = useLocation();
  const [activePrimary, setActivePrimary] = useState(() => {
    if (location.pathname.startsWith("/flow")) return "ai-flow";
    if (location.pathname === "/") return "home";
    return "tasks";
  });
  const [previewPrimary, setPreviewPrimary] = useState(activePrimary);
  const [isExpanded, setIsExpanded] = useState(false);

  const ITEMS_WITH_CONTENT = ["tasks", "ai-flow"];

  useEffect(() => {
    if (location.pathname.startsWith("/flow")) {
      setActivePrimary("ai-flow");
      setPreviewPrimary("ai-flow");
    } else if (location.pathname === "/") {
      setActivePrimary("home");
      setPreviewPrimary("home");
    } else if (location.pathname.startsWith("/board")) {
      setActivePrimary("tasks");
      setPreviewPrimary("tasks");
    }
  }, [location.pathname]);

  const handleItemHover = (itemId) => {
    setPreviewPrimary(itemId);
    if (ITEMS_WITH_CONTENT.includes(itemId)) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <aside 
      className="w-[72px] h-full bg-neutral-50 z-50 relative"
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Primary Sidebar (Icons) */}
      <div 
        className="w-full h-full bg-white border-r border-neutral-200 flex flex-col items-center py-6 z-20 relative"
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        {/* Main Nav Icons */}
        <nav className="flex-1 w-full flex flex-col items-center gap-4 px-2">
          {PRIMARY_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePrimary(item.id)}
              onMouseEnter={() => handleItemHover(item.id)}
              className={`group relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                activePrimary === item.id
                  ? "bg-white text-primary-600 shadow-lg shadow-primary-500/10 ring-1 ring-neutral-200"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${
                  activePrimary === item.id ? "fill-current" : ""
                }`}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
              
              {/* Active Indicator */}
              {activePrimary === item.id && (
                <div className="absolute -right-[13px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary-500 rounded-l-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-4 mb-4">
          <button 
            onMouseEnter={() => setIsExpanded(false)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button 
            onMouseEnter={() => setIsExpanded(false)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
          <div onMouseEnter={() => setIsExpanded(false)}>
            <Avatar className="h-9 w-9 border border-neutral-200 cursor-pointer hover:ring-2 hover:ring-primary-100 transition-all">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Secondary Sidebar (Contextual) */}
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: isExpanded ? 260 : 0, 
          opacity: isExpanded ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute left-[72px] top-0 h-full bg-neutral-50/95 backdrop-blur-sm border-r border-neutral-200 flex flex-col overflow-hidden shadow-2xl z-10"
      >
        <div className="w-[260px] flex flex-col h-full">
          {/* Search */}
          <div className="h-16 flex items-center px-4 border-b border-neutral-100/50 shrink-0">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 rounded-xl bg-white border border-transparent focus:border-primary-200 pl-9 pr-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-50 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
            {previewPrimary === "tasks" && (
              <>
                {/* Favorites */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Favorites
                    </div>
                    <ChevronDown className="h-3 w-3 text-neutral-400" />
                  </div>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-all">
                    <Star className="h-4 w-4 text-orange-400" />
                    <span>AI Writer</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-all">
                    <Star className="h-4 w-4 text-blue-400" />
                    <span>Data Insights</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-all">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>Predictive AI</span>
                  </button>
                </div>

                {/* Projects */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      All Projects
                    </div>
                    <ChevronDown className="h-3 w-3 text-neutral-400" />
                  </div>
                  {PROJECTS.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        item.active
                          ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-100"
                          : "text-neutral-600 hover:bg-white hover:shadow-sm hover:text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-1.5 w-1.5 rounded-full ${item.active ? "bg-primary-500" : "bg-neutral-300"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.count && (
                        <span className="text-[10px] font-medium text-neutral-400">
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Categories
                    </div>
                    <ChevronDown className="h-3 w-3 text-neutral-400" />
                  </div>
                  {CATEGORIES.map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <span className="text-primary-400">#</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Archive */}
                <div className="pt-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-all">
                    <Archive className="h-4 w-4 text-neutral-400" />
                    <span>Archive</span>
                  </button>
                </div>
              </>
            )}

            {previewPrimary === "ai-flow" && (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">AI Flows</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Manage your automated workflows here.
                </p>
                <Button size="sm" className="mt-4 w-full" variant="outline">
                  <Plus className="h-3 w-3 mr-2" />
                  New Flow
                </Button>
              </div>
            )}
          </div>

          {/* Premium Card */}
          <div className="p-4 border-t border-neutral-200/50 shrink-0">
            <div className="bg-white rounded-xl p-4 border border-neutral-200/60 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-xs text-neutral-900">Unlock Premium</h4>
                  <button className="text-neutral-400 hover:text-neutral-600">
                    <span className="sr-only">Close</span>
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500 mb-3 leading-relaxed">
                  Get advanced AI insights and unlimited automation.
                </p>
                <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white text-[10px] h-7 rounded-lg font-medium shadow-md shadow-primary-500/20 transition-all">
                  Upgrade to premium
                </Button>
              </div>
              
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-primary-100/50 rounded-full blur-2xl group-hover:bg-primary-100/80 transition-all"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-purple-100/50 rounded-full blur-xl group-hover:bg-purple-100/80 transition-all"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </aside>
  );
};
