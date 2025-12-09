import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Editor } from "react-draft-wysiwyg";
import {
  EditorState,
  ContentState,
  convertToRaw,
  RichUtils,
  Modifier,
  getVisibleSelectionRect,
} from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { stateFromHTML } from "draft-js-import-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Undo2,
  Redo2,
  Palette,
  Highlighter,
  Smile,
  X,
  Check,
} from "lucide-react";
import EmojiPickerReact from "emoji-picker-react";

// Text colors with style names
const TEXT_COLORS = [
  { name: "Default", color: null, style: null },
  { name: "Gray", color: "#6B7280", style: "COLOR_GRAY" },
  { name: "Red", color: "#EF4444", style: "COLOR_RED" },
  { name: "Orange", color: "#F97316", style: "COLOR_ORANGE" },
  { name: "Yellow", color: "#EAB308", style: "COLOR_YELLOW" },
  { name: "Green", color: "#22C55E", style: "COLOR_GREEN" },
  { name: "Blue", color: "#3B82F6", style: "COLOR_BLUE" },
  { name: "Purple", color: "#8B5CF6", style: "COLOR_PURPLE" },
  { name: "Pink", color: "#EC4899", style: "COLOR_PINK" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", color: null, style: null },
  { name: "Yellow", color: "#FEF08A", style: "BG_YELLOW" },
  { name: "Green", color: "#BBF7D0", style: "BG_GREEN" },
  { name: "Blue", color: "#BFDBFE", style: "BG_BLUE" },
  { name: "Purple", color: "#DDD6FE", style: "BG_PURPLE" },
  { name: "Pink", color: "#FBCFE8", style: "BG_PINK" },
  { name: "Orange", color: "#FED7AA", style: "BG_ORANGE" },
];

// Custom style map for colors
const customStyleMap = {
  COLOR_GRAY: { color: "#6B7280" },
  COLOR_RED: { color: "#EF4444" },
  COLOR_ORANGE: { color: "#F97316" },
  COLOR_YELLOW: { color: "#EAB308" },
  COLOR_GREEN: { color: "#22C55E" },
  COLOR_BLUE: { color: "#3B82F6" },
  COLOR_PURPLE: { color: "#8B5CF6" },
  COLOR_PINK: { color: "#EC4899" },
  BG_YELLOW: { backgroundColor: "#FEF08A" },
  BG_GREEN: { backgroundColor: "#BBF7D0" },
  BG_BLUE: { backgroundColor: "#BFDBFE" },
  BG_PURPLE: { backgroundColor: "#DDD6FE" },
  BG_PINK: { backgroundColor: "#FBCFE8" },
  BG_ORANGE: { backgroundColor: "#FED7AA" },
  BG_ORANGE: { backgroundColor: "#FED7AA" },
};

// Configuration for converting custom styles to HTML
const exportOptions = {
  inlineStyles: {
    // Text Colors
    ...TEXT_COLORS.reduce((acc, c) => {
      if (c.style) acc[c.style] = { style: { color: c.color } };
      return acc;
    }, {}),
    // Highlight Colors
    ...HIGHLIGHT_COLORS.reduce((acc, c) => {
      if (c.style) acc[c.style] = { style: { backgroundColor: c.color } };
      return acc;
    }, {}),
  },
};

// Configuration for converting HTML back to Draft state
const importOptions = {
  customInlineFn: (element, { Style }) => {
    const color = element.style.color;
    const backgroundColor = element.style.backgroundColor;

    if (color) {
      // Find matching text color
      const colorMatch = TEXT_COLORS.find(
        (c) =>
          c.style &&
          c.color &&
          (c.color.toLowerCase() === color.toLowerCase() ||
            // Handle safe conversions if browser uses rgb/rgba
            // For now simple hex matching, improved logic can be added if needed
            c.color.toLowerCase() === rgbToHex(color).toLowerCase())
      );
      if (colorMatch) return Style(colorMatch.style);
    }

    if (backgroundColor) {
      // Find matching highlight
      const bgMatch = HIGHLIGHT_COLORS.find(
        (c) =>
          c.style &&
          c.color &&
          (c.color.toLowerCase() === backgroundColor.toLowerCase() ||
            c.color.toLowerCase() === rgbToHex(backgroundColor).toLowerCase())
      );
      if (bgMatch) return Style(bgMatch.style);
    }

    return null;
  },
};

// Helper to convert RGB to Hex for style matching (basic implementation)
const rgbToHex = (rgb) => {
  if (!rgb || rgb.startsWith("#")) return rgb;
  const rgbValues = rgb.match(/\d+/g);
  if (!rgbValues || rgbValues.length < 3) return rgb;
  return (
    "#" +
    rgbValues
      .slice(0, 3)
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

// Floating Toolbar Button (compact)
const FloatingButton = ({ icon: Icon, isActive, onClick, title }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    title={title}
    className={`p-1 rounded transition-all duration-100 ${
      isActive
        ? "bg-white/20 text-white"
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`}
  >
    <Icon size={15} strokeWidth={2.5} />
  </button>
);

// Static Toolbar Button
const ToolbarButton = ({
  icon: Icon,
  isActive,
  onClick,
  title,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-1.5 rounded-md transition-all duration-150 flex items-center justify-center relative
      ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      ${
        isActive
          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200"
      }`}
  >
    <Icon size={18} strokeWidth={2} />
  </button>
);

const ToolbarSeparator = () => (
  <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />
);
const FloatingSeparator = () => <div className="w-px h-3 bg-white/30 mx-0.5" />;

// Dropdown wrapper
const ToolbarDropdown = ({ isOpen, onClose, children, align = "left" }) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      ref={dropdownRef}
      className={`absolute top-full mt-1 ${
        align === "right" ? "right-0" : "left-0"
      } z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-2 min-w-[140px]`}
    >
      {children}
    </div>
  );
};

// Portal-based Emoji Dropdown to avoid overflow clipping
const EmojiDropdown = ({ isOpen, onClose, buttonRef, children }) => {
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 380; // Height of emoji picker

      // Calculate position - open upward if not enough space below
      const spaceBelow = viewportHeight - rect.bottom;
      const openUpward =
        spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setPosition({
        top: openUpward ? rect.top - dropdownHeight - 8 : rect.bottom + 4,
        left: Math.max(8, rect.right - 320), // Align right, but keep 8px padding from edge
      });
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef?.current &&
        !buttonRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>,
    document.body
  );
};

// Color Picker
const ColorPicker = ({ colors, onSelect, currentStyle, title }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-neutral-500 dark:text-neutral-400 px-1 mb-1">
      {title}
    </span>
    <div className="grid grid-cols-5 gap-1">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onSelect(c.style)}
          title={c.name}
          className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${
            currentStyle === c.style
              ? "border-indigo-500 scale-110"
              : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
          }`}
          style={{ backgroundColor: c.color || "#f3f4f6" }}
        >
          {c.style === null && <X size={12} className="text-neutral-400" />}
          {currentStyle === c.style && c.style && (
            <Check size={12} className="text-white drop-shadow-sm" />
          )}
        </button>
      ))}
    </div>
  </div>
);

// Portal-based dropdown for floating toolbar to avoid clipping
const FloatingToolbarDropdown = ({
  isOpen,
  onClose,
  buttonRef,
  children,
  width = 180,
}) => {
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      setIsPositioned(false);
      // Wait for next frame to get actual dropdown dimensions
      requestAnimationFrame(() => {
        if (dropdownRef.current && buttonRef.current) {
          const buttonRect = buttonRef.current.getBoundingClientRect();
          const dropdownRect = dropdownRef.current.getBoundingClientRect();

          setPosition({
            top: buttonRect.top - dropdownRect.height - 8,
            left: Math.max(
              8,
              buttonRect.left + buttonRect.width / 2 - width / 2
            ),
          });
          setIsPositioned(true);
        }
      });
    }
  }, [isOpen, buttonRef, width]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef?.current &&
        !buttonRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl p-2 transition-opacity"
      style={{
        top: position.top,
        left: position.left,
        minWidth: width,
        opacity: isPositioned ? 1 : 0,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};

// Mini Color Picker content - used inside FloatingToolbarDropdown
const MiniColorPicker = ({
  colors,
  onSelect,
  onClose,
  title,
  currentStyle,
}) => (
  <div>
    <span className="text-xs text-neutral-500 dark:text-neutral-400 px-1 mb-1.5 block">
      {title}
    </span>
    <div className="flex flex-wrap gap-1">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => {
            onSelect(c.style);
            onClose();
          }}
          title={c.name}
          className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center flex-shrink-0 ${
            currentStyle === c.style
              ? "border-indigo-500 scale-110"
              : c.style === null
              ? "border-dashed border-neutral-300 dark:border-neutral-600"
              : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
          } hover:scale-110`}
          style={{ backgroundColor: c.color || "#f3f4f6" }}
        >
          {c.style === null && <X size={12} className="text-neutral-400" />}
          {currentStyle === c.style && c.style && (
            <Check size={12} className="text-white drop-shadow-sm" />
          )}
        </button>
      ))}
    </div>
  </div>
);

// Floating Link Input - matches static toolbar style
const FloatingLinkInput = ({ onSubmit, onClose }) => {
  const [url, setUrl] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (url.trim()) {
      onSubmit(
        url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`
      );
    }
  };

  return (
    <div onMouseDown={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Insert Link
        </span>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="px-2 py-1.5 text-sm border border-neutral-200 dark:border-neutral-600 rounded-md bg-transparent dark:text-white focus:outline-none focus:border-indigo-500"
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Link
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Emoji Picker wrapper using emoji-picker-react
const EmojiPicker = ({ onSelect, onClose }) => (
  <div
    className="emoji-picker-container"
    onMouseDown={(e) => e.stopPropagation()}
  >
    <EmojiPickerReact
      onEmojiClick={(emojiData) => {
        onSelect(emojiData.emoji);
        onClose?.();
      }}
      width={300}
      height={350}
      searchPlaceholder="Search emoji..."
      skinTonesDisabled={false}
      previewConfig={{ showPreview: false }}
      lazyLoadEmojis={true}
    />
  </div>
);

const LinkInput = ({ onSubmit, onClose }) => {
  const [url, setUrl] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim())
      onSubmit(
        url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`
      );
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 min-w-[220px]">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        Insert Link
      </span>
      <input
        ref={inputRef}
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="px-2 py-1.5 text-sm border border-neutral-200 dark:border-neutral-600 rounded-md bg-transparent dark:text-white focus:outline-none focus:border-indigo-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Link
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

/**
 * RichTextEditor with floating selection toolbar
 */
export const RichTextEditor = ({
  value = "",
  onChange,
  disabled = false,
  placeholder = "Add more details, notes, or context...",
}) => {
  const [editorState, setEditorState] = useState(() => {
    if (value) {
      try {
        const contentState = stateFromHTML(value, importOptions);
        return EditorState.createWithContent(contentState);
      } catch (e) {
        console.error("Error creating initial state:", e);
      }
    }
    return EditorState.createEmpty();
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [floatingToolbar, setFloatingToolbar] = useState({
    visible: false,
    top: 0,
    left: 0,
  });
  const [floatingDropdown, setFloatingDropdown] = useState(null);
  const editorWrapperRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const floatingColorRef = useRef(null);
  const floatingHighlightRef = useRef(null);
  const floatingLinkRef = useRef(null);

  useEffect(() => {
    if (!isInitialized && value) {
      try {
        const contentState = stateFromHTML(value, importOptions);
        setEditorState(EditorState.createWithContent(contentState));
      } catch (error) {
        console.error("Error parsing HTML:", error);
      }
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const handleEditorStateChange = (newState) => {
    setEditorState(newState);
    setIsInitialized(true);

    const html = stateToHTML(newState.getCurrentContent(), exportOptions);
    const isEmpty = html === "<p><br></p>" || html.trim() === "";
    onChange?.(isEmpty ? "" : html);

    // Update floating toolbar position
    updateFloatingToolbar(newState);
  };

  const updateFloatingToolbar = useCallback(
    (state) => {
      const selection = state.getSelection();

      // If a floating dropdown is open, keep the toolbar visible
      if (floatingDropdown) {
        return;
      }

      if (selection.isCollapsed()) {
        setFloatingToolbar({ visible: false, top: 0, left: 0 });
        savedSelectionRef.current = null;
        return;
      }

      // Save the selection for later use
      if (selection.getHasFocus()) {
        savedSelectionRef.current = selection;
      }

      // Get selection rect
      const selectionRect = getVisibleSelectionRect(window);
      if (!selectionRect || !editorWrapperRef.current) {
        // Keep toolbar if there's a saved selection and it's not collapsed
        if (
          !savedSelectionRef.current ||
          savedSelectionRef.current.isCollapsed()
        ) {
          setFloatingToolbar({ visible: false, top: 0, left: 0 });
        }
        return;
      }

      const wrapperRect = editorWrapperRef.current.getBoundingClientRect();
      const toolbarWidth = 220; // Toolbar width estimate
      const toolbarHalfWidth = toolbarWidth / 2;

      const top = selectionRect.top - wrapperRect.top - 40;
      let left =
        selectionRect.left - wrapperRect.left + selectionRect.width / 2;

      // Boundary detection - ensure toolbar stays within container
      const minLeft = toolbarHalfWidth;
      const maxLeft = wrapperRect.width - toolbarHalfWidth;

      // Clamp the left position
      left = Math.max(minLeft, Math.min(left, maxLeft));

      setFloatingToolbar({
        visible: true,
        top: Math.max(-10, top), // Allow slight overflow at top
        left,
      });
    },
    [floatingDropdown]
  );

  const hasInlineStyle = (style) =>
    editorState.getCurrentInlineStyle().has(style);
  const hasBlockType = (blockType) => {
    const selection = editorState.getSelection();
    const block = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey());
    return block.getType() === blockType;
  };

  const toggleInlineStyle = (style) => {
    handleEditorStateChange(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType) => {
    handleEditorStateChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const handleUndo = () =>
    handleEditorStateChange(EditorState.undo(editorState));
  const handleRedo = () =>
    handleEditorStateChange(EditorState.redo(editorState));

  const getCurrentColorStyle = (prefix) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    const colorStyles = prefix === "COLOR" ? TEXT_COLORS : HIGHLIGHT_COLORS;
    for (const c of colorStyles) {
      if (c.style && currentStyle.has(c.style)) return c.style;
    }
    return null;
  };

  const applyColorStyle = (style, type) => {
    // Use saved selection if current selection is collapsed (lost focus)
    let selection = editorState.getSelection();
    if (
      selection.isCollapsed() &&
      savedSelectionRef.current &&
      !savedSelectionRef.current.isCollapsed()
    ) {
      selection = savedSelectionRef.current;
    }

    const colorList = type === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS;
    let contentState = editorState.getCurrentContent();

    // Remove existing colors of this type
    colorList.forEach((c) => {
      if (c.style) {
        contentState = Modifier.removeInlineStyle(
          contentState,
          selection,
          c.style
        );
      }
    });

    // Apply new color
    if (style) {
      contentState = Modifier.applyInlineStyle(contentState, selection, style);
    }

    let newEditorState = EditorState.push(
      editorState,
      contentState,
      "change-inline-style"
    );
    // Restore selection
    newEditorState = EditorState.forceSelection(newEditorState, selection);

    // If we applied style to a range, prevent it from continuing when typing connects
    if (style && !selection.isCollapsed()) {
      const currentStyles = newEditorState.getCurrentInlineStyle();
      if (currentStyles.has(style)) {
        newEditorState = EditorState.setInlineStyleOverride(
          newEditorState,
          currentStyles.remove(style)
        );
      }
    }

    handleEditorStateChange(newEditorState);
    setOpenDropdown(null);
    setFloatingDropdown(null);
  };

  const handleReturn = (e, newState) => {
    if (e.shiftKey) {
      handleEditorStateChange(RichUtils.insertSoftNewline(newState));
      return "handled";
    }

    // Split block normally
    let contentState = newState.getCurrentContent();
    const selection = newState.getSelection();
    contentState = Modifier.splitBlock(contentState, selection);
    let newEditorState = EditorState.push(
      newState,
      contentState,
      "split-block"
    );

    // Reset all inline styles for the new block (prevent color stickiness)
    const currentStyles = newEditorState.getCurrentInlineStyle();
    if (currentStyles.size > 0) {
      newEditorState = EditorState.setInlineStyleOverride(
        newEditorState,
        currentStyles.clear()
      );
    }

    handleEditorStateChange(newEditorState);
    return "handled";
  };

  const insertEmoji = (emoji) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const newContentState = Modifier.insertText(contentState, selection, emoji);
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "insert-characters"
    );
    handleEditorStateChange(
      EditorState.forceSelection(
        newEditorState,
        newContentState.getSelectionAfter()
      )
    );
    setOpenDropdown(null);
  };

  const insertLink = (url) => {
    // Use saved selection if current selection is collapsed (lost focus)
    let selection = editorState.getSelection();
    if (
      selection.isCollapsed() &&
      savedSelectionRef.current &&
      !savedSelectionRef.current.isCollapsed()
    ) {
      selection = savedSelectionRef.current;
    }

    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        "LINK",
        "MUTABLE",
        { url }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      let newEditorState = EditorState.set(editorState, {
        currentContent: contentStateWithEntity,
      });
      newEditorState = RichUtils.toggleLink(
        newEditorState,
        selection,
        entityKey
      );
      handleEditorStateChange(newEditorState);
    }
    setOpenDropdown(null);
    setFloatingDropdown(null);
    savedSelectionRef.current = null;
  };

  const isSelectionCollapsed = editorState.getSelection().isCollapsed();

  return (
    <div
      className="rich-text-editor flex flex-col h-full"
      ref={editorWrapperRef}
    >
      {/* Static Toolbar - Fixed at top */}
      {!disabled && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-neutral-200/60 dark:border-neutral-700/60 flex-wrap flex-shrink-0 bg-neutral-50 dark:bg-neutral-800/50">
          <ToolbarButton
            icon={Bold}
            isActive={hasInlineStyle("BOLD")}
            onClick={() => toggleInlineStyle("BOLD")}
            title="Bold"
          />
          <ToolbarButton
            icon={Italic}
            isActive={hasInlineStyle("ITALIC")}
            onClick={() => toggleInlineStyle("ITALIC")}
            title="Italic"
          />
          <ToolbarButton
            icon={Underline}
            isActive={hasInlineStyle("UNDERLINE")}
            onClick={() => toggleInlineStyle("UNDERLINE")}
            title="Underline"
          />
          <ToolbarButton
            icon={Strikethrough}
            isActive={hasInlineStyle("STRIKETHROUGH")}
            onClick={() => toggleInlineStyle("STRIKETHROUGH")}
            title="Strikethrough"
          />
          <ToolbarSeparator />
          <div className="relative">
            <ToolbarButton
              icon={Palette}
              isActive={openDropdown === "textColor"}
              onClick={() =>
                setOpenDropdown(
                  openDropdown === "textColor" ? null : "textColor"
                )
              }
              title="Text Color"
            />
            <ToolbarDropdown
              isOpen={openDropdown === "textColor"}
              onClose={() => setOpenDropdown(null)}
            >
              <ColorPicker
                colors={TEXT_COLORS}
                onSelect={(s) => applyColorStyle(s, "text")}
                currentStyle={getCurrentColorStyle("COLOR")}
                title="Text Color"
              />
            </ToolbarDropdown>
          </div>
          <div className="relative">
            <ToolbarButton
              icon={Highlighter}
              isActive={openDropdown === "highlight"}
              onClick={() =>
                setOpenDropdown(
                  openDropdown === "highlight" ? null : "highlight"
                )
              }
              title="Highlight"
            />
            <ToolbarDropdown
              isOpen={openDropdown === "highlight"}
              onClose={() => setOpenDropdown(null)}
            >
              <ColorPicker
                colors={HIGHLIGHT_COLORS}
                onSelect={(s) => applyColorStyle(s, "highlight")}
                currentStyle={getCurrentColorStyle("BG")}
                title="Highlight"
              />
            </ToolbarDropdown>
          </div>
          <ToolbarSeparator />
          <ToolbarButton
            icon={List}
            isActive={hasBlockType("unordered-list-item")}
            onClick={() => toggleBlockType("unordered-list-item")}
            title="Bullet List"
          />
          <ToolbarButton
            icon={ListOrdered}
            isActive={hasBlockType("ordered-list-item")}
            onClick={() => toggleBlockType("ordered-list-item")}
            title="Numbered List"
          />
          <ToolbarSeparator />
          <div className="relative">
            <ToolbarButton
              icon={Link2}
              isActive={openDropdown === "link"}
              onClick={() =>
                setOpenDropdown(openDropdown === "link" ? null : "link")
              }
              title="Insert Link"
              disabled={isSelectionCollapsed}
            />
            <ToolbarDropdown
              isOpen={openDropdown === "link"}
              onClose={() => setOpenDropdown(null)}
            >
              <LinkInput
                onSubmit={insertLink}
                onClose={() => setOpenDropdown(null)}
              />
            </ToolbarDropdown>
          </div>
          <div className="relative" ref={emojiButtonRef}>
            <ToolbarButton
              icon={Smile}
              isActive={openDropdown === "emoji"}
              onClick={() =>
                setOpenDropdown(openDropdown === "emoji" ? null : "emoji")
              }
              title="Emoji"
            />
          </div>
          <EmojiDropdown
            isOpen={openDropdown === "emoji"}
            onClose={() => setOpenDropdown(null)}
            buttonRef={emojiButtonRef}
          >
            <EmojiPicker
              onSelect={insertEmoji}
              onClose={() => setOpenDropdown(null)}
            />
          </EmojiDropdown>
          <ToolbarSeparator />
          <ToolbarButton
            icon={Undo2}
            isActive={false}
            onClick={handleUndo}
            title="Undo"
          />
          <ToolbarButton
            icon={Redo2}
            isActive={false}
            onClick={handleRedo}
            title="Redo"
          />
        </div>
      )}

      {/* Floating Selection Toolbar */}
      {floatingToolbar.visible && !disabled && (
        <div
          className="absolute z-50 flex items-center gap-0.5 px-2 py-1 bg-neutral-900 dark:bg-neutral-950 rounded-lg shadow-xl border border-neutral-700"
          style={{
            top: floatingToolbar.top,
            left: floatingToolbar.left,
            transform: "translateX(-50%)",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <FloatingButton
            icon={Bold}
            isActive={hasInlineStyle("BOLD")}
            onClick={() => toggleInlineStyle("BOLD")}
            title="Bold"
          />
          <FloatingButton
            icon={Italic}
            isActive={hasInlineStyle("ITALIC")}
            onClick={() => toggleInlineStyle("ITALIC")}
            title="Italic"
          />
          <FloatingButton
            icon={Underline}
            isActive={hasInlineStyle("UNDERLINE")}
            onClick={() => toggleInlineStyle("UNDERLINE")}
            title="Underline"
          />
          <FloatingButton
            icon={Strikethrough}
            isActive={hasInlineStyle("STRIKETHROUGH")}
            onClick={() => toggleInlineStyle("STRIKETHROUGH")}
            title="Strikethrough"
          />
          <FloatingSeparator />
          <div className="relative" ref={floatingColorRef}>
            <FloatingButton
              icon={Palette}
              isActive={floatingDropdown === "color"}
              onClick={() =>
                setFloatingDropdown(
                  floatingDropdown === "color" ? null : "color"
                )
              }
              title="Text Color"
            />
          </div>
          <FloatingToolbarDropdown
            isOpen={floatingDropdown === "color"}
            onClose={() => setFloatingDropdown(null)}
            buttonRef={floatingColorRef}
          >
            <MiniColorPicker
              colors={TEXT_COLORS}
              onSelect={(s) => applyColorStyle(s, "text")}
              onClose={() => setFloatingDropdown(null)}
              title="Text Color"
              currentStyle={getCurrentColorStyle("COLOR")}
            />
          </FloatingToolbarDropdown>
          <div className="relative" ref={floatingHighlightRef}>
            <FloatingButton
              icon={Highlighter}
              isActive={floatingDropdown === "highlight"}
              onClick={() =>
                setFloatingDropdown(
                  floatingDropdown === "highlight" ? null : "highlight"
                )
              }
              title="Highlight"
            />
          </div>
          <FloatingToolbarDropdown
            isOpen={floatingDropdown === "highlight"}
            onClose={() => setFloatingDropdown(null)}
            buttonRef={floatingHighlightRef}
          >
            <MiniColorPicker
              colors={HIGHLIGHT_COLORS}
              onSelect={(s) => applyColorStyle(s, "highlight")}
              onClose={() => setFloatingDropdown(null)}
              title="Highlight"
              currentStyle={getCurrentColorStyle("BG")}
            />
          </FloatingToolbarDropdown>
          <FloatingSeparator />
          <div className="relative" ref={floatingLinkRef}>
            <FloatingButton
              icon={Link2}
              isActive={floatingDropdown === "link"}
              onClick={() =>
                setFloatingDropdown(floatingDropdown === "link" ? null : "link")
              }
              title="Insert Link"
            />
          </div>
          <FloatingToolbarDropdown
            isOpen={floatingDropdown === "link"}
            onClose={() => setFloatingDropdown(null)}
            buttonRef={floatingLinkRef}
            width={220}
          >
            <FloatingLinkInput
              onSubmit={(url) => {
                insertLink(url);
                setFloatingDropdown(null);
              }}
              onClose={() => setFloatingDropdown(null)}
            />
          </FloatingToolbarDropdown>
        </div>
      )}

      <style>{`
        .rich-text-editor { position: relative; }
        .rich-text-editor .rdw-editor-wrapper { border-radius: 0; overflow: visible; flex: 1; display: flex; flex-direction: column; }
        .rich-text-editor .rdw-editor-toolbar { display: none !important; }
        .rich-text-editor .rdw-editor-main { padding: 0.75rem 1rem; font-size: 0.875rem; line-height: 1.6; flex: 1; }
        .rich-text-editor .public-DraftEditorPlaceholder-root { color: rgb(156 163 175); font-size: 0.875rem; }
        .rich-text-editor .public-DraftEditor-content { color: rgb(55 65 81); }
        .dark .rich-text-editor .public-DraftEditor-content { color: rgb(229 231 235); }
        .rich-text-editor a { color: #3B82F6; text-decoration: underline; }
      `}</style>
      {/* Scrollable Editor Container */}
      <div className="flex-1 overflow-y-auto">
        <Editor
          editorState={editorState}
          onEditorStateChange={handleEditorStateChange}
          placeholder={placeholder}
          readOnly={disabled}
          toolbarHidden={true}
          stripPastedStyles={true}
          wrapperClassName="rdw-editor-wrapper"
          editorClassName="rdw-editor-main"
          customStyleMap={customStyleMap}
          handleReturn={handleReturn}
        />
      </div>
    </div>
  );
};
