import { supabase } from "../lib/supabaseClient";

// Helper function to fetch user details for assignee UUIDs
async function fetchAssigneeUsers(assigneeIds) {
  if (!assigneeIds || assigneeIds.length === 0) return [];
  
  const { data: users, error } = await supabase
    .from("users")
    .select("id, full_name, email, avatar_url")
    .in("id", assigneeIds);
  
  if (error) {
    console.error("Error fetching assignee users:", error);
    return [];
  }
  
  return users || [];
}

export const boardService = {
  // Optimized fetch for sidebar/dashboard (lightweight)
  async getBoardsList() {
    const { data, error } = await supabase
      .from("boards")
      .select(
        `
        id,
        name,
        description,
        color,
        icon,
        is_favorite,
        is_archived,
        owner_id,
        updated_at,
        owner:users!owner_id(id,avatar_url, full_name, email),
        members:board_members(
          role,
          user:users(id,avatar_url, full_name, email)
        ),
        cards:cards(count),
        ai_flows(
          id,
          name,
          description,
          ideas:ai_ideas(count)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform data to include card count and flow ideas count
    return data.map((board) => ({
      ...board,
      cardCount: board.cards?.[0]?.count || 0,
      ai_flows: (board.ai_flows || []).map((flow) => ({
        ...flow,
        ideas: flow.ideas, // Keep the count object for now
        ideasCount: flow.ideas?.[0]?.count || 0,
      })),
    }));
  },

  // Get complete board details (cumulative fetch)
  async getBoardDetails(boardId) {
    const { data, error } = await supabase
      .from("boards")
      .select(
        `
        *,
        owner:users!owner_id(*),
        members:board_members(
          role,
          user:users(*)
        ),
        columns:board_columns(
          *,
          cards(
            *,
            subtasks(*),
            attachments:card_attachments(*),
            comments(
              *,
              user:users(*)
            )
          )
        ),
        tags(*),
        ai_flows(
          *,
          ideas:ai_ideas(
            *,
            idea_comments:ai_ideas_comments(
              *,
              user:users(*)
            )
          )
        )
      `
      )
      .eq("id", boardId)
      .single();

    if (error) throw error;

    // Add owner to members array if owner exists
    if (data.owner) {
      // Check if owner is already in members to avoid duplicates
      const ownerInMembers = data.members?.some(
        (m) => m.user?.id === data.owner.id
      );
      if (!ownerInMembers) {
        data.members = [
          { role: "owner", user: data.owner },
          ...(data.members || []),
        ];
      }
    }

    // Transform data to match frontend expectations
    const membersMap = new Map(data.members.map((m) => [m.user.id, m.user]));
    const tagsMap = new Map((data.tags || []).map((t) => [t.id, t]));

    // Collect all unique assignee IDs from all cards
    const allAssigneeIds = new Set();
    if (data.columns) {
      for (const col of data.columns) {
        if (col.cards) {
          for (const card of col.cards) {
            (card.assigned_to || []).forEach((uid) => allAssigneeIds.add(uid));
          }
        }
      }
    }

    // Fetch user details for all assignees (including those not in board members)
    const assigneeUsers = await fetchAssigneeUsers(Array.from(allAssigneeIds));
    const assigneeUsersMap = new Map(assigneeUsers.map((u) => [u.id, u]));

    const cards = [];
    if (data.columns) {
      data.columns.sort((a, b) => a.position - b.position);

      for (const col of data.columns) {
        if (col.cards) {
          col.cards.sort((a, b) => a.position - b.position);

          for (const card of col.cards) {
            // Map assigned_to UUIDs to user objects (from fetched users, not just members)
            const assignees = (card.assigned_to || [])
              .map((uid) => assigneeUsersMap.get(uid))
              .filter(Boolean);

            // Map tag UUIDs to tag objects
            const labels = (card.tags || [])
              .map((tagId) => tagsMap.get(tagId))
              .filter(Boolean);

            // Sort subtasks
            if (card.subtasks) {
              card.subtasks.sort((a, b) => a.position - b.position);
            }

            cards.push({
              ...card,
              kanbanStatus: col.title, // Map column title to status
              assignedTo: assignees[0] || null, // Legacy support for single assignee
              assignees: assignees, // New support for multiple
              labels: labels, // Map tags to labels
              dueDate: card.due_date,
              boardId: data.id,
              type: "manual", // Explicitly set type for cards
              // Attachments are kept as-is - signed URLs will be generated lazily when TaskModal opens
            });
          }
        }
      }
    }

    // Process AI Flows and Ideas
    const flowIdeas = [];
    if (data.ai_flows) {
      data.ai_flows.forEach((flow) => {
        if (flow.ideas) {
          flow.ideas.forEach((aiIdea) => {
            flowIdeas.push({
              ...aiIdea,
              id: aiIdea.id,
              title: aiIdea.title,
              description: aiIdea.description,
              type: "ai",
              boardId: data.id,
              flowId: flow.id,
              parentId: aiIdea.parent_id,
              is_liked: aiIdea.is_liked || false,
              is_disliked: aiIdea.is_disliked || false,
              // Add other fields as necessary to match 'Idea' shape if needed
              kanbanStatus: null,
              assignedTo: null,
              labels: [],
              comments: aiIdea.idea_comments || [],
            });
          });
        }
      });
    }

    return {
      ...data,
      cards: cards,
      flowIdeas: flowIdeas,
      settings: {
        description: data.description,
        themeColor: data.color,
        icon: data.icon,
        defaultLabels: data.tags || [], // Use board tags as labels
      },
    };
  },

  async createBoard(board) {
    // 1. Create the board
    const { data: newBoard, error: boardError } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();

    if (boardError) throw boardError;

    try {
      // 2. Create default columns
      const columns = [
        { board_id: newBoard.id, title: "To Do", position: 0 },
        { board_id: newBoard.id, title: "In Progress", position: 1 },
        { board_id: newBoard.id, title: "Done", position: 2 },
      ];

      const { error: columnsError } = await supabase
        .from("board_columns")
        .insert(columns);

      if (columnsError) throw columnsError;

      // 3. Create default AI Flow
      const defaultFlow = {
        board_id: newBoard.id,
        name: "Main Flow",
        description: "Default flow for AI ideas",
      };

      const { error: flowError } = await supabase
        .from("ai_flows")
        .insert(defaultFlow);

      if (flowError) throw flowError;

      return newBoard;
    } catch (error) {
      // If setup fails, we should probably delete the board to avoid inconsistent state
      // But for now, we'll just log it and return the board (user can fix manually or we can improve later)
      console.error("Error setting up board defaults:", error);
      return newBoard;
    }
  },

  async updateBoard(boardId, updates) {
    const { data, error } = await supabase
      .from("boards")
      .update(updates)
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBoard(boardId) {
    const { error } = await supabase.from("boards").delete().eq("id", boardId);

    if (error) throw error;
  },

  async toggleFavorite(boardId, isFavorite) {
    const { data, error } = await supabase
      .from("boards")
      .update({ is_favorite: isFavorite })
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
