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
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useBoard } from "../context/BoardContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
import { TruncatedText } from "../components/ui/TruncatedText";
import { useAuth } from "../context/AuthContext";
import { CreateBoardModal } from "../components/BoardPage/Modals/CreateBoardModal";
import { CreateCategoryModal } from "../components/BoardPage/Modals/CreateCategoryModal";

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
  const { currentUser } = useAuth();
  const initials =
    currentUser?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "UU";

  const {
    boards,
    userCategories,
    archiveBoard,
    deleteBoard,
    duplicateBoard,
    toggleFavorite,
    createCategory,
    updateBoard,
  } = useBoard();

  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    favorites: true,
    boards: true,
    categories: true,
    flows: true,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

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
      className="h-full bg-white dark:bg-neutral-950 flex shrink-0 transition-all duration-300 ease-in-out p-1.5"
      style={{ width: isExpanded ? "348px" : "72px" }}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Rounded Container for both sidebars */}
      <div
        className="bg-primary-100 dark:bg-neutral-900 rounded-xl p-2 flex h-full transition-all duration-300 ease-in-out"
        style={{ width: isExpanded ? "324px" : "64px" }}
      >
        {/* Primary Sidebar (Icons) */}
        <div className="w-12 h-full rounded-xl flex flex-col items-center shrink-0">
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
                className={`group relative w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                  activePrimary === item.id
                    ? "bg-primary-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg shadow-primary-900/20 dark:shadow-none"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-900/5 dark:hover:bg-neutral-800/50"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    activePrimary === item.id ? "fill-current" : ""
                  }`}
                />
                <span className="text-[9px] font-bold uppercase tracking-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <button
              onMouseEnter={() => setIsExpanded(false)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-900/5 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              onMouseEnter={() => setIsExpanded(false)}
              onClick={() => navigate("/settings")}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-900/5 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>

            <div onMouseEnter={() => setIsExpanded(false)}>
              <Avatar className="h-9 w-9 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:ring-2 hover:ring-primary-100 dark:hover:ring-neutral-700 transition-all">
                <AvatarImage src={currentUser?.avatar_url} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Secondary Sidebar (Contextual) */}
        <div
          className="h-full ml-2 bg-white dark:bg-neutral-800 rounded-xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: isExpanded ? "344px" : "0px",
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
                    <button
                      onClick={() => toggleSection("favorites")}
                      className="w-full h-10 flex items-center justify-between px-2 hover:bg-neutral-900/5 dark:hover:bg-neutral-800/50 rounded-lg transition-all group"
                    >
                      <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.08em] group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                        Favorites
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-transform duration-200 ${
                          expandedSections.favorites ? "" : "-rotate-90"
                        }`}
                      />
                    </button>
                    {expandedSections.favorites && (
                      <div className="space-y-1 mt-1">
                        {boards
                          .filter(
                            (board) => board.is_favorite && !board.is_archived
                          )
                          .map((board) => {
                            const isActive = board.id === boardId;

                            return (
                              <div
                                key={board.id}
                                className={`group w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                                  isActive
                                    ? "bg-neutral-900 dark:bg-white shadow-xl shadow-neutral-900/10 text-white dark:text-neutral-900"
                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-900/5 dark:hover:bg-neutral-700/30 has-[[data-state=open]]:bg-neutral-900/5 has-[[data-state=open]]:dark:bg-neutral-700/30 hover:text-neutral-900 dark:hover:text-neutral-200"
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
                                  <TruncatedText
                                    as="span"
                                    className="truncate"
                                    title={board.name}
                                  >
                                    {board.name}
                                  </TruncatedText>
                                </button>

                                <div className="flex items-center gap-2 opacity-100">
                                  {board.cardCount > 0 && (
                                    <span className="text-[10px] font-medium text-neutral-400">
                                      {board.cardCount}
                                    </span>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="p-1 hover:bg-neutral-900/10 dark:hover:bg-neutral-700/50 data-[state=open]:bg-neutral-900/5 dark:data-[state=open]:bg-neutral-700/30 rounded-md transition-colors">
                                        <MoreHorizontal className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      side="right"
                                      align="start"
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
                    )}
                  </div>

                  {/* Boards */}
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleSection("boards")}
                      className="w-full h-10 flex items-center justify-between px-2 hover:bg-neutral-900/5 dark:hover:bg-neutral-800/50 rounded-lg transition-all group"
                    >
                      <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.08em] group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                        All Boards
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCreateModalOpen(true);
                          }}
                          className="hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md p-1 transition-colors"
                        >
                          <Plus className="h-4 w-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" />
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-transform duration-200 ${
                            expandedSections.boards ? "" : "-rotate-90"
                          }`}
                        />
                      </div>
                    </button>
                    {expandedSections.boards && (
                      <div className="space-y-1 mt-1">
                        {boards
                          .filter((board) => !board.is_archived)
                          .map((board) => {
                            const isActive = board.id === boardId;

                            return (
                              <div
                                key={board.id}
                                className={`group w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                                  isActive
                                    ? "bg-neutral-900 dark:bg-white shadow-xl shadow-neutral-900/10 text-white dark:text-neutral-900"
                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-900/5 dark:hover:bg-neutral-700/30 has-[[data-state=open]]:bg-neutral-900/5 has-[[data-state=open]]:dark:bg-neutral-700/30 hover:text-neutral-900 dark:hover:text-neutral-200"
                                }`}
                              >
                                <button
                                  onClick={() =>
                                    navigate(`/boards/${board.id}/kanban`)
                                  }
                                  className="flex-1 flex items-center gap-3 min-w-0 text-left"
                                >
                                  <span className="text-base shrink-0">
                                    {board.icon}
                                  </span>
                                  <TruncatedText
                                    as="span"
                                    className="truncate"
                                    title={board.name}
                                  >
                                    {board.name}
                                  </TruncatedText>
                                </button>

                                <div className="flex items-center gap-2">
                                  {board.cardCount > 0 && (
                                    <span className="text-[10px] font-medium text-neutral-400 shrink-0">
                                      {board.cardCount}
                                    </span>
                                  )}
                                  <div className="opacity-100">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className="p-1 hover:bg-neutral-900/10 dark:hover:bg-neutral-700/50 data-[state=open]:bg-neutral-900/5 dark:data-[state=open]:bg-neutral-700/30 rounded-md transition-colors">
                                          <MoreHorizontal className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        side="right"
                                        align="start"
                                        className="w-48 dark:bg-neutral-900 dark:border-neutral-700"
                                      >
                                        <DropdownMenuItem
                                          onClick={() =>
                                            toggleFavorite(board.id)
                                          }
                                        >
                                          <Star
                                            className={`mr-2 h-4 w-4 ${
                                              board.is_favorite
                                                ? "fill-orange-400 text-orange-400"
                                                : ""
                                            }`}
                                          />
                                          <span>
                                            {board.is_favorite
                                              ? "Unfavorite"
                                              : "Favorite"}
                                          </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="dark:bg-neutral-700" />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            duplicateBoard(board.id)
                                          }
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

                                        <DropdownMenuSeparator className="dark:bg-neutral-700" />
                                        <DropdownMenuLabel>
                                          Move to Category
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            updateBoard(board.id, {
                                              category: null,
                                            })
                                          }
                                          className="justify-between"
                                        >
                                          <span>None</span>
                                          {!board.category && (
                                            <Check className="h-3 w-3" />
                                          )}
                                        </DropdownMenuItem>
                                        {userCategories.map((cat) => (
                                          <DropdownMenuItem
                                            key={cat.id}
                                            onClick={() =>
                                              updateBoard(board.id, {
                                                category: cat.name,
                                              })
                                            }
                                            className="justify-between"
                                          >
                                            <div className="flex items-center gap-2">
                                              <div
                                                className="h-2 w-2 rounded-full"
                                                style={{
                                                  backgroundColor: cat.color,
                                                }}
                                              />
                                              <span className="truncate max-w-[100px]">
                                                {cat.name}
                                              </span>
                                            </div>
                                            {board.category === cat.name && (
                                              <Check className="h-3 w-3" />
                                            )}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleSection("categories")}
                      className="w-full h-10 flex items-center justify-between px-2 hover:bg-neutral-900/5 dark:hover:bg-neutral-800/50 rounded-lg transition-all group"
                    >
                      <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.08em] group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                        Categories
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCategoryModalOpen(true);
                          }}
                          className="hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md p-1 transition-colors"
                        >
                          <Plus className="h-4 w-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" />
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-transform duration-200 ${
                            expandedSections.categories ? "" : "-rotate-90"
                          }`}
                        />
                      </div>
                    </button>
                    {expandedSections.categories && (
                      <div className="space-y-1 mt-1">
                        {/* Categories List */}

                        {userCategories.map((category) => {
                          const categoryBoards = boards.filter(
                            (board) => board.category === category.name
                          );
                          const isExpanded = expandedCategories[category.id];

                          return (
                            <div key={category.id} className="space-y-0.5">
                              <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-900/5 dark:hover:bg-neutral-700/30 transition-all group"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div
                                    className={`transition-transform duration-200 ${
                                      isExpanded ? "rotate-90" : ""
                                    }`}
                                  >
                                    <ChevronRight className="h-3 w-3 text-neutral-400 group-hover:text-neutral-600" />
                                  </div>
                                  <div className="flex items-center gap-2 truncate">
                                    <div
                                      className="h-2 w-2 rounded-full shrink-0"
                                      style={{
                                        backgroundColor: category.color,
                                      }}
                                    />
                                    <span className="truncate">
                                      {category.name}
                                    </span>
                                  </div>
                                </div>
                                {categoryBoards.length > 0 && (
                                  <span className="text-[10px] font-medium text-neutral-400">
                                    {categoryBoards.length}
                                  </span>
                                )}
                              </button>

                              {/* Boards in Category */}
                              {isExpanded && (
                                <div className="pl-4 space-y-0.5 animate-in slide-in-from-top-1 fade-in duration-200">
                                  {categoryBoards.map((board) => (
                                    <div
                                      key={board.id}
                                      className="group relative"
                                    >
                                      <div
                                        onClick={() =>
                                          navigate(`/boards/${board.id}`)
                                        }
                                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                          boardId === board.id
                                            ? "bg-neutral-900 dark:bg-white shadow-xl shadow-neutral-900/10 font-bold text-white dark:text-neutral-900"
                                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-900/5 dark:hover:bg-neutral-700/30 has-[[data-state=open]]:bg-neutral-900/5 has-[[data-state=open]]:dark:bg-neutral-700/30 hover:text-neutral-900 dark:hover:text-neutral-200 font-semibold"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 truncate">
                                          <span className="text-base shrink-0">
                                            {board.icon || "🐳"}
                                          </span>
                                          <div className="flex flex-col items-start truncate">
                                            <span className="font-semibold truncate">
                                              {board.name}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Dropdown Menu for Category Item - reusing same menu structure but minimal if needed 
                                            Actually let's copy the full dropdown from 'All Boards' to maintain consistency
                                         */}
                                        <div
                                          onClick={(e) => e.stopPropagation()}
                                          className="opacity-100"
                                        >
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg hover:bg-neutral-900/10 dark:hover:bg-neutral-700/50 data-[state=open]:bg-neutral-900/5 dark:data-[state=open]:bg-neutral-700/30 transition-colors -mr-1"
                                              >
                                                <MoreHorizontal className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                              side="right"
                                              align="start"
                                              className="w-56"
                                            >
                                              <DropdownMenuItem
                                                onClick={() =>
                                                  navigate(
                                                    `/boards/${board.id}`
                                                  )
                                                }
                                              >
                                                <Share2 className="mr-2 h-4 w-4" />
                                                <span>Open Board</span>
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator className="dark:bg-neutral-700" />
                                              <DropdownMenuItem
                                                onClick={() =>
                                                  toggleFavorite(board.id)
                                                }
                                              >
                                                <Star
                                                  className={`mr-2 h-4 w-4 ${
                                                    board.is_favorite
                                                      ? "fill-orange-400 text-orange-400"
                                                      : ""
                                                  }`}
                                                />
                                                <span>
                                                  {board.is_favorite
                                                    ? "Unfavorite"
                                                    : "Favorite"}
                                                </span>
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator className="dark:bg-neutral-700" />
                                              <DropdownMenuLabel>
                                                Move to Category
                                              </DropdownMenuLabel>
                                              <DropdownMenuItem
                                                onClick={() =>
                                                  updateBoard(board.id, {
                                                    category: null,
                                                  })
                                                }
                                                className="justify-between"
                                              >
                                                <span>None</span>
                                                {!board.category && (
                                                  <Check className="h-3 w-3" />
                                                )}
                                              </DropdownMenuItem>
                                              {userCategories.map((cat) => (
                                                <DropdownMenuItem
                                                  key={cat.id}
                                                  onClick={() =>
                                                    updateBoard(board.id, {
                                                      category: cat.name,
                                                    })
                                                  }
                                                  className="justify-between"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <div
                                                      className="h-2 w-2 rounded-full"
                                                      style={{
                                                        backgroundColor:
                                                          cat.color,
                                                      }}
                                                    />
                                                    <span className="truncate max-w-[100px]">
                                                      {cat.name}
                                                    </span>
                                                  </div>
                                                  {board.category ===
                                                    cat.name && (
                                                    <Check className="h-3 w-3" />
                                                  )}
                                                </DropdownMenuItem>
                                              ))}
                                              <DropdownMenuSeparator className="dark:bg-neutral-700" />
                                              <DropdownMenuItem
                                                onClick={() =>
                                                  duplicateBoard(board.id)
                                                }
                                              >
                                                <Copy className="mr-2 h-4 w-4" />
                                                <span>Duplicate</span>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() =>
                                                  archiveBoard(board.id)
                                                }
                                              >
                                                <ArchiveIcon className="mr-2 h-4 w-4" />
                                                <span>Archive</span>
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {categoryBoards.length === 0 && (
                                    <div className="px-3 py-2 text-xs text-neutral-400 italic">
                                      No boards
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Archive */}
                  <div className="pt-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-white dark:hover:bg-neutral-700/30 hover:shadow-sm transition-all">
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
                    <button
                      onClick={() => toggleSection("flows")}
                      className="w-full h-10 flex items-center justify-between px-2 hover:bg-neutral-900/5 dark:hover:bg-neutral-800/50 rounded-lg transition-all group"
                    >
                      <div className="text-[11px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.08em] group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                        AI Flows
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded p-1 transition-colors"
                        >
                          <Plus className="h-3 w-3 text-neutral-400" />
                        </div>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${
                            expandedSections.flows ? "" : "-rotate-90"
                          }`}
                        />
                      </div>
                    </button>

                    {expandedSections.flows && (
                      <div className="space-y-1 mt-1">
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
                                className={`w-full flex flex-col gap-1 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                  isActive
                                    ? "bg-neutral-900 dark:bg-white shadow-xl shadow-neutral-900/10 text-white dark:text-neutral-900"
                                    : "hover:bg-neutral-900/5 dark:hover:bg-neutral-700/30 hover:shadow-sm"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full min-w-0 gap-2">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Zap className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                                    <TruncatedText
                                      as="span"
                                      className="font-bold text-neutral-900 dark:text-white truncate"
                                      title={flow.name}
                                    >
                                      {flow.name}
                                    </TruncatedText>
                                  </div>
                                  <span className="text-[10px] font-medium text-neutral-400 shrink-0">
                                    {flow.ideasCount}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400 min-w-0">
                                  <span className="text-base shrink-0">
                                    {flow.boardIcon}
                                  </span>
                                  <TruncatedText
                                    as="span"
                                    className="truncate"
                                    title={flow.boardName}
                                  >
                                    {flow.boardName}
                                  </TruncatedText>
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
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </aside>
  );
};
