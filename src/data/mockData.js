// Mock AI-generated content ideas
export const mockAIIdeas = [
  {
    title: "Interactive Product Demos",
    description:
      "Create engaging video demonstrations showing product features in real-world scenarios. Focus on problem-solving aspects and user benefits.",
  },
  {
    title: "Customer Success Stories",
    description:
      "Share authentic testimonials and case studies from satisfied customers. Include metrics and specific outcomes achieved.",
  },
  {
    title: "Educational Content Series",
    description:
      "Develop a series of tutorial-style posts teaching valuable skills related to your product. Build authority and trust.",
  },
  {
    title: "Behind-the-Scenes Content",
    description:
      "Give followers a peek into your company culture, team members, and day-to-day operations. Humanize your brand.",
  },
  {
    title: "Industry Trend Analysis",
    description:
      "Share insights on current trends affecting your industry. Position your brand as a thought leader.",
  },
  {
    title: "User-Generated Content Campaigns",
    description:
      "Encourage customers to share their experiences. Feature their content to build community and social proof.",
  },
];

// Mock comments for ideas
export const mockComments = {
  1: [
    {
      id: "c1",
      author: "Maria Chen",
      avatar: "MC",
      text: "This is a great direction! We should focus on mobile-first demos.",
      timestamp: "2 hours ago",
      reactions: { thumbsUp: 5, heart: 2 },
    },
    {
      id: "c2",
      author: "Tom Wilson",
      avatar: "TW",
      text: "Agreed! Can we also add some metrics about engagement?",
      timestamp: "1 hour ago",
      reactions: { thumbsUp: 3, heart: 1 },
    },
  ],
};

// Mock team members
export const mockTeamMembers = [
  { id: "1", name: "Alex Morgan", avatar: "AM", avatarUrl: null },
  { id: "2", name: "Maria Chen", avatar: "MC", avatarUrl: null },
  { id: "3", name: "David Kim", avatar: "DK", avatarUrl: null },
  { id: "4", name: "Sarah Johnson", avatar: "SJ", avatarUrl: null },
  { id: "5", name: "Tom Wilson", avatar: "TW", avatarUrl: null },
];

// Mock users for boards
export const mockUsers = [
  {
    id: "user-1",
    name: "Alex Morgan",
    email: "alex@example.com",
    avatar: "AM",
    avatarUrl: null,
    role: "owner",
  },
  {
    id: "user-2",
    name: "Maria Chen",
    email: "maria@example.com",
    avatar: "MC",
    avatarUrl: null,
    role: "editor",
  },
  {
    id: "user-3",
    name: "David Kim",
    email: "david@example.com",
    avatar: "DK",
    avatarUrl: null,
    role: "editor",
  },
  {
    id: "user-4",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "SJ",
    avatarUrl: null,
    role: "viewer",
  },
];

// Mock labels for tasks
export const mockLabels = [
  { id: "label-1", name: "High Priority", color: "#ef4444" },
  { id: "label-2", name: "Design", color: "#8b5cf6" },
  { id: "label-3", name: "Development", color: "#3b82f6" },
  { id: "label-4", name: "Marketing", color: "#f59e0b" },
  { id: "label-5", name: "Research", color: "#10b981" },
];

// Mock commenters with avatar data
export const mockCommenters = [
  { name: "Maria Chen", avatar: "MC", avatarUrl: null },
  { name: "Tom Wilson", avatar: "TW", avatarUrl: null },
  { name: "Alex Morgan", avatar: "AM", avatarUrl: null },
  { name: "Sarah Johnson", avatar: "SJ", avatarUrl: null },
];

// Mock boards with complete data
export const mockBoards = [
  {
    id: "board-1",
    name: "Content Marketing Strategy",
    description: "Planning and executing our Q1 content marketing campaigns",
    color: "#6366f1",
    icon: "📝",
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    members: [mockUsers[0], mockUsers[1], mockUsers[2]],
    isFavorite: true,
    category: "Marketing",
    isArchived: false,
    settings: {
      themeColor: "#6366f1",
      defaultLabels: mockLabels,
    },
  },
  {
    id: "board-2",
    name: "Product Launch",
    description: "Coordinating our new product launch activities",
    color: "#22c55e",
    icon: "🚀",
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
    members: [mockUsers[0], mockUsers[2], mockUsers[3]],
    isFavorite: true,
    category: "Product",
    isArchived: false,
    settings: {
      themeColor: "#22c55e",
      defaultLabels: mockLabels,
    },
  },
  {
    id: "board-3",
    name: "Design System",
    description: "Building and maintaining our design system components",
    color: "#8b5cf6",
    icon: "🎨",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    members: [mockUsers[1], mockUsers[2]],
    isFavorite: false,
    category: "Design",
    isArchived: false,
    settings: {
      themeColor: "#8b5cf6",
      defaultLabels: mockLabels,
    },
  },
];

// Board categories
export const boardCategories = [
  { id: "cat-1", name: "Marketing", color: "#f59e0b" },
  { id: "cat-2", name: "Product", color: "#22c55e" },
  { id: "cat-3", name: "Design", color: "#8b5cf6" },
  { id: "cat-4", name: "Engineering", color: "#3b82f6" },
];

// Mock cards/ideas for boards
export const mockCards = [
  // Content Marketing Strategy Board
  {
    id: "card-1",
    boardId: "board-1",
    title: "Blog Post: 10 Marketing Trends for 2024",
    description: "Write comprehensive blog post covering emerging marketing trends",
    type: "manual",
    kanbanStatus: "In Progress",
    priority: "high",
    assignedTo: mockUsers[1],
    labels: [mockLabels[3]], // Marketing
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    showInFlow: false,
    members: [mockUsers[1], mockUsers[2]],
    attachments: [],
    subtasks: [
      { id: "st-1", text: "Research trends", completed: true },
      { id: "st-2", text: "Write outline", completed: true },
      { id: "st-3", text: "Draft content", completed: false },
    ],
  },
  {
    id: "card-2",
    boardId: "board-1",
    title: "Social Media Campaign - Q1",
    description: "Plan and execute social media campaign for Q1 product launch",
    type: "manual",
    kanbanStatus: "Review",
    priority: "high",
    assignedTo: mockUsers[0],
    labels: [mockLabels[3], mockLabels[0]], // Marketing, High Priority
    dueDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    showInFlow: false,
    members: [mockUsers[0], mockUsers[1]],
    attachments: [{ name: "campaign-brief.pdf" }],
    subtasks: [],
  },
  {
    id: "card-3",
    boardId: "board-1",
    title: "Email Newsletter Template",
    description: "Design new email newsletter template for monthly updates",
    type: "manual",
    kanbanStatus: "Backlog",
    priority: "medium",
    assignedTo: mockUsers[2],
    labels: [mockLabels[1]], // Design
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    showInFlow: false,
    members: [mockUsers[2]],
    attachments: [],
    subtasks: [],
  },

  // Product Launch Board
  {
    id: "card-4",
    boardId: "board-2",
    title: "Landing Page Design",
    description: "Create landing page design for new product launch",
    type: "manual",
    kanbanStatus: "Done",
    priority: "high",
    assignedTo: mockUsers[2],
    labels: [mockLabels[1], mockLabels[0]], // Design, High Priority
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    showInFlow: false,
    members: [mockUsers[2]],
    attachments: [{ name: "landing-page-mockup.fig" }],
    subtasks: [],
  },
  {
    id: "card-5",
    boardId: "board-2",
    title: "Product Demo Video",
    description: "Record and edit product demonstration video",
    type: "manual",
    kanbanStatus: "In Progress",
    priority: "high",
    assignedTo: mockUsers[0],
    labels: [mockLabels[3]], // Marketing
    dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    showInFlow: false,
    members: [mockUsers[0], mockUsers[3]],
    attachments: [],
    subtasks: [
      { id: "st-4", text: "Script writing", completed: true },
      { id: "st-5", text: "Recording", completed: false },
      { id: "st-6", text: "Editing", completed: false },
    ],
  },

  // Design System Board
  {
    id: "card-6",
    boardId: "board-3",
    title: "Button Component Library",
    description: "Build comprehensive button component with all variants",
    type: "manual",
    kanbanStatus: "Done",
    priority: "medium",
    assignedTo: mockUsers[2],
    labels: [mockLabels[2], mockLabels[1]], // Development, Design
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    showInFlow: false,
    members: [mockUsers[2]],
    attachments: [],
    subtasks: [],
  },
  {
    id: "card-7",
    boardId: "board-3",
    title: "Color Palette Documentation",
    description: "Document color system and usage guidelines",
    type: "manual",
    kanbanStatus: "In Progress",
    priority: "medium",
    assignedTo: mockUsers[1],
    labels: [mockLabels[1]], // Design
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    showInFlow: false,
    members: [mockUsers[1], mockUsers[2]],
    attachments: [],
    subtasks: [],
  },
];

// Mock AI flows linked to boards
export const mockAIFlows = [
  {
    id: "flow-1",
    boardId: "board-1",
    boardName: "Content Marketing Strategy",
    boardColor: "#6366f1",
    name: "Content Ideas Generator",
    description: "AI-generated content ideas for marketing campaigns",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    ideas: [
      {
        id: "ai-idea-1",
        title: "Interactive Product Demos",
        description: "Create engaging video demonstrations showing product features in real-world scenarios.",
        type: "ai",
        showInFlow: true,
        boardId: "board-1",
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
      {
        id: "ai-idea-2",
        title: "Customer Success Stories",
        description: "Share authentic testimonials and case studies from satisfied customers.",
        type: "ai",
        showInFlow: true,
        boardId: "board-1",
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
      {
        id: "ai-idea-3",
        title: "Educational Content Series",
        description: "Develop tutorial-style posts teaching valuable skills related to your product.",
        type: "ai",
        showInFlow: true,
        boardId: "board-1",
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: "flow-2",
    boardId: "board-2",
    boardName: "Product Launch",
    boardColor: "#22c55e",
    name: "Launch Campaign Ideas",
    description: "AI-generated ideas for product launch campaigns",
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    ideas: [
      {
        id: "ai-idea-4",
        title: "Launch Event Planning",
        description: "Organize virtual launch event with live demos and Q&A sessions.",
        type: "ai",
        showInFlow: true,
        boardId: "board-2",
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      },
      {
        id: "ai-idea-5",
        title: "Influencer Partnership Program",
        description: "Partner with industry influencers for product reviews and demonstrations.",
        type: "ai",
        showInFlow: true,
        boardId: "board-2",
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      },
    ],
  },
  {
    id: "flow-3",
    boardId: "board-3",
    boardName: "Design System",
    boardColor: "#8b5cf6",
    name: "Component Ideas",
    description: "AI-generated component and pattern suggestions",
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    ideas: [
      {
        id: "ai-idea-6",
        title: "Advanced Data Table Component",
        description: "Build flexible data table with sorting, filtering, and pagination.",
        type: "ai",
        showInFlow: true,
        boardId: "board-3",
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      },
    ],
  },
];

// Mock Notifications
export const mockNotifications = [
  {
    id: "notif-1",
    userId: "user-1",
    message: "Alex Morgan assigned you to 'Landing Page Design'",
    type: "assignment",
    taskId: "card-4",
    boardId: "board-2",
    createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
    read: false,
  },
  {
    id: "notif-2",
    userId: "user-1",
    message: "Maria Chen mentioned you in 'Social Media Campaign'",
    type: "mention",
    taskId: "card-2",
    boardId: "board-1",
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    read: false,
  },
  {
    id: "notif-3",
    userId: "user-1",
    message: "Due date approaching for 'Product Demo Video'",
    type: "due",
    taskId: "card-5",
    boardId: "board-2",
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    read: true,
  },
  {
    id: "notif-4",
    userId: "user-1",
    message: "David Kim invited you to 'Design System' board",
    type: "invite",
    boardId: "board-3",
    createdAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    read: true,
  },
];

// Mock board activity data
export const mockBoardActivity = [
  {
    id: "act1",
    type: "task_created",
    user: { name: "Sarah Johnson", avatar: "SJ" },
    action: "created task",
    target: "Implement dark mode",
    timestamp: "2 minutes ago",
    icon: "plus",
  },
  {
    id: "act2",
    type: "task_moved",
    user: { name: "Mike Chen", avatar: "MC" },
    action: "moved",
    target: "User authentication flow",
    details: "from In Progress to Done",
    timestamp: "15 minutes ago",
    icon: "move",
  },
  {
    id: "act3",
    type: "comment_added",
    user: { name: "Emma Davis", avatar: "ED" },
    action: "commented on",
    target: "API integration",
    timestamp: "1 hour ago",
    icon: "message",
  },
  {
    id: "act4",
    type: "member_added",
    user: { name: "Tom Wilson", avatar: "TW" },
    action: "added",
    target: "Alex Rodriguez",
    details: "to the board",
    timestamp: "2 hours ago",
    icon: "user-plus",
  },
  {
    id: "act5",
    type: "task_assigned",
    user: { name: "Sarah Johnson", avatar: "SJ" },
    action: "assigned",
    target: "Database optimization",
    details: "to Mike Chen",
    timestamp: "3 hours ago",
    icon: "user-check",
  },
];
