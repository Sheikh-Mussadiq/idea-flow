import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
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
import { boardCategories } from "../data/mockData.js";
import { ThemeToggle } from "../components/ThemeToggle";
import { useBoard } from "../context/BoardContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  Archive as ArchiveIcon,
  Copy,
  Share2,
  Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";

const PRIMARY_NAV = [
  { id: "home", icon: Home, label: "Home", to: "/" },
  { id: "ai-flow", icon: Zap, label: "AI Flow", to: null }, // No navigation, only opens sub-sidebar
  { id: "boards", icon: LayoutDashboard, label: "Boards", to: null }, // No navigation, only opens sub-sidebar
];

export const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [activePrimary, setActivePrimary] = useState(() => {
    if (location.pathname.startsWith("/boards")) return "boards";
    if (location.pathname === "/") return "home";
    return "home";
  });
  const [previewPrimary, setPreviewPrimary] = useState(activePrimary);
  const [isExpanded, setIsExpanded] = useState(false);

  const { boards, archiveBoard, deleteBoard, duplicateBoard, toggleFavorite } =
    useBoard();

  const ITEMS_WITH_CONTENT = ["boards", "ai-flow"];

  useEffect(() => {
    if (location.pathname.startsWith("/boards")) {
      setActivePrimary("boards");
      setPreviewPrimary("boards");
    } else if (location.pathname === "/") {
      setActivePrimary("home");
      setPreviewPrimary("home");
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
      className="h-full bg-white dark:bg-neutral-950 flex shrink-0 transition-all duration-300 ease-in-out p-2"
      style={{ width: isExpanded ? "348px" : "96px" }}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Rounded Container for both sidebars */}
      <div
        className="bg-primary-100 dark:bg-neutral-900 rounded-2xl p-2 flex h-full transition-all duration-300 ease-in-out"
        style={{ width: isExpanded ? "324px" : "80px" }}
      >
        {/* Primary Sidebar (Icons) */}
        <div className="w-[64px] h-full rounded-xl flex flex-col items-center shrink-0">
          {/* Logo */}
          <div className="mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-neutral-700 text-primary-900 dark:text-white flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          {/* Main Nav Icons */}
          <nav className="flex-1 w-full flex flex-col items-center gap-4 px-2">
            {PRIMARY_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePrimary(item.id);
                  // Only navigate if item has a route
                  if (item.to) {
                    navigate(item.to);
                  }
                  // For items with sub-sidebar content, expand the sidebar
                  if (ITEMS_WITH_CONTENT.includes(item.id)) {
                    setIsExpanded(true);
                  }
                }}
                onMouseEnter={() => handleItemHover(item.id)}
                className={`group relative w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  activePrimary === item.id
                    ? "bg-primary-900 dark:bg-white text-white dark:text-neutral-900 shadow-md"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    activePrimary === item.id ? "fill-current" : ""
                  }`}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <button
              onMouseEnter={() => setIsExpanded(false)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              onMouseEnter={() => setIsExpanded(false)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <div onMouseEnter={() => setIsExpanded(false)} className="scale-75">
              <ThemeToggle />
            </div>

            <div onMouseEnter={() => setIsExpanded(false)}>
              <Avatar className="h-9 w-9 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:ring-2 hover:ring-primary-100 dark:hover:ring-neutral-700 transition-all">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Secondary Sidebar (Contextual) */}
        <div
          className="h-full bg-white dark:bg-neutral-800 rounded-xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: isExpanded ? "244px" : "0px",
            opacity: isExpanded ? 1 : 0,
            // marginLeft: isExpanded ? '8px' : '0px'
          }}
        >
          <div className="w-full flex flex-col h-full">
            {/* Search */}
            <div className="h-16 flex items-center px-4 border-b border-neutral-100/50 dark:border-neutral-700/50 shrink-0">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-9 rounded-xl bg-white dark:bg-neutral-900 border border-transparent focus:border-primary-200 dark:focus:border-neutral-600 pl-9 pr-4 text-sm text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-50 dark:focus:ring-neutral-700 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
              {previewPrimary === "boards" && (
                <>
                  {/* Favorites */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Favorites
                      </div>
                      <ChevronDown className="h-3 w-3 text-neutral-400" />
                    </div>
                    {boards
                      .filter(
                        (board) => board.is_favorite && !board.is_archived
                      )
                      .map((board) => {
                        const isActive = board.id === boardId;

                        return (
                          <div
                            key={board.id}
                            className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              isActive
                                ? "bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white"
                                : "text-neutral-600 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-200"
                            }`}
                          >
                            <button
                              onClick={() =>
                                navigate(`/boards/${board.id}/kanban`)
                              }
                              className="flex-1 flex items-center gap-3 min-w-0 text-left"
                            >
                              <Star className="h-4 w-4 text-orange-400 fill-orange-400 shrink-0" />
                              <span className="text-base shrink-0">
                                {board.icon}
                              </span>
                              <span className="truncate">{board.name}</span>
                            </button>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {board.cardCount > 0 && (
                                <span className="text-[10px] font-medium text-neutral-400">
                                  {board.cardCount}
                                </span>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
                                    <MoreHorizontal className="h-3 w-3 text-neutral-400" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48 dark:bg-neutral-900 dark:border-neutral-700"
                                >
                                  <DropdownMenuItem
                                    onClick={() => toggleFavorite(board.id)}
                                  >
                                    <Star className="mr-2 h-4 w-4" />
                                    <span>Unfavorite</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="dark:bg-neutral-700" />
                                  <DropdownMenuItem
                                    onClick={() => duplicateBoard(board.id)}
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    <span>Duplicate</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => archiveBoard(board.id)}
                                  >
                                    <ArchiveIcon className="mr-2 h-4 w-4" />
                                    <span>Archive</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Boards */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        All Boards
                      </div>
                      <button className="hover:bg-white rounded p-0.5 transition-colors">
                        <Plus className="h-3 w-3 text-neutral-400" />
                      </button>
                    </div>
                    {boards
                      .filter((board) => !board.is_archived)
                      .map((board) => {
                        const isActive = board.id === boardId;

                        return (
                          <button
                            key={board.id}
                            onClick={() =>
                              navigate(`/boards/${board.id}/kanban`)
                            }
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              isActive
                                ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-100"
                                : "text-neutral-600 hover:bg-white hover:shadow-sm hover:text-neutral-900"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base">{board.icon}</span>
                              <span className="truncate">{board.name}</span>
                            </div>
                            {board.cardCount > 0 && (
                              <span className="text-[10px] font-medium text-neutral-400">
                                {board.cardCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>

                  {/* Categories */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Categories
                      </div>
                      <ChevronDown className="h-3 w-3 text-neutral-400" />
                    </div>
                    {boardCategories.map((category) => {
                      // Note: Category filtering might need adjustment if categories aren't in DB yet
                      const categoryBoards = boards.filter(
                        (board) => board.category === category.name
                      );

                      return (
                        <button
                          key={category.id}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-white hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="truncate">{category.name}</span>
                          </div>
                          {categoryBoards.length > 0 && (
                            <span className="text-[10px] font-medium text-neutral-400">
                              {categoryBoards.length}
                            </span>
                          )}
                        </button>
                      );
                    })}
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
                <>
                  {/* AI Flows */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        AI Flows
                      </div>
                      <button className="hover:bg-white rounded p-0.5 transition-colors">
                        <Plus className="h-3 w-3 text-neutral-400" />
                      </button>
                    </div>
                    {/* Get all flows from all boards */}
                    {boards
                      .filter((board) => !board.is_archived)
                      .flatMap((board) =>
                        (board.ai_flows || []).map((flow) => ({
                          ...flow,
                          boardId: board.id,
                          boardName: board.name,
                          boardColor: board.color,
                          boardIcon: board.icon,
                          ideasCount:
                            flow.ideasCount || flow.ideas?.length || 0,
                        }))
                      )
                      .map((flow) => {
                        const isActive = boardId === flow.boardId;

                        return (
                          <button
                            key={flow.id}
                            onClick={() =>
                              navigate(
                                `/boards/${flow.boardId}/flow/${flow.id}`
                              )
                            }
                            className={`w-full flex flex-col gap-1 px-3 py-2.5 rounded-lg text-sm transition-all ${
                              isActive
                                ? "bg-white dark:bg-neutral-800 shadow-sm ring-1 ring-neutral-100 dark:ring-neutral-700"
                                : "hover:bg-white dark:hover:bg-neutral-800 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5 text-primary-500" />
                                <span className="font-medium text-neutral-900 dark:text-white truncate">
                                  {flow.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-medium text-neutral-400">
                                {flow.ideasCount}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                              <span className="text-base shrink-0">
                                {flow.boardIcon}
                              </span>
                              <span className="truncate">{flow.boardName}</span>
                            </div>
                          </button>
                        );
                      })}
                    {/* Show message if no flows */}
                    {boards
                      .filter((b) => !b.is_archived)
                      .flatMap((b) => b.ai_flows || []).length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-neutral-400">
                        No AI flows yet. Create a board to get started.
                      </div>
                    )}
                  </div>

                  {/* Create New Flow */}
                  <div className="pt-2">
                    <Button size="sm" className="w-full" variant="outline">
                      <Plus className="h-3 w-3 mr-2" />
                      New AI Flow
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Premium Card */}
            <div className="p-4 border-t border-neutral-200/50 shrink-0">
              <div className="bg-white rounded-xl p-4 border border-neutral-200/60 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-xs text-neutral-900">
                      Unlock Premium
                    </h4>
                    <button className="text-neutral-400 hover:text-neutral-600">
                      <span className="sr-only">Close</span>
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
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
        </div>
      </div>
    </aside>
  );
};
