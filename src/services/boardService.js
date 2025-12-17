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
  // Get user specific categories
  async getUserCategories(userId) {
    if (!userId) return [];

    const { data, error } = await supabase
      .from("board_categories")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    if (error) throw error;
    return data;
  },

  async createCategory(userId, name, color) {
    if (!userId) throw new Error("User ID is required");

    const { data, error } = await supabase
      .from("board_categories")
      .insert({
        user_id: userId,
        name,
        color,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async assignBoardToCategory(userId, boardId, categoryId) {
    if (!userId) throw new Error("User ID is required");

    // First remove existing assignment for this board/user
    await supabase
      .from("board_category_assignments")
      .delete()
      .match({ user_id: userId, board_id: boardId });

    if (!categoryId) return null;

    const { data, error } = await supabase
      .from("board_category_assignments")
      .insert({
        user_id: userId,
        board_id: boardId,
        category_id: categoryId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Optimized fetch for sidebar/dashboard (lightweight)
  async getBoardsList(userId) {
    // We need to fetch basic board info + user specific favs and categories
    const { data, error } = await supabase
      .from("boards")
      .select(
        `
        id,
        name,
        description,
        color,
        icon,
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
        ),
        favourites:board_favourites(id, user_id),
        category_assignments:board_category_assignments(
          user_id,
          category:board_categories(id, name, color)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform data to include card count and flow ideas count
    return data.map((board) => ({
      ...board,
      // Check if current user has favorited this board
      is_favorite:
        board.favourites && board.favourites.some((f) => f.user_id === userId),
      // Get the category name for the current user
      category:
        board.category_assignments?.find((ca) => ca.user_id === userId)
          ?.category?.name || null,
      categoryColor:
        board.category_assignments?.find((ca) => ca.user_id === userId)
          ?.category?.color || null,
      cardCount: board.cards?.[0]?.count || 0,
      ai_flows: (board.ai_flows || []).map((flow) => ({
        ...flow,
        ideas: flow.ideas, // Keep the count object for now
        ideasCount: flow.ideas?.[0]?.count || 0,
      })),
    }));
  },

  // Get complete board details (cumulative fetch)
  async getBoardDetails(userId, boardId) {
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
        ),
        favourites:board_favourites(id),
        category_assignments:board_category_assignments(
          category:board_categories(id, name, color)
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
      is_favorite: data.favourites && data.favourites.length > 0, // Assuming RLS filters favourites to current user
      category: data.category_assignments?.[0]?.category?.name || null, // Assuming RLS filters assignments
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

  async createBoard(userId, board) {
    // 1. Create the board
    // Remove is_favorite from the insert payload as it's no longer on boards table
    const { is_favorite, ...boardData } = board;

    // Ensure owner_id is set
    const boardPayload = {
      ...boardData,
      owner_id: userId,
    };

    const { data: newBoard, error: boardError } = await supabase
      .from("boards")
      .insert(boardPayload)
      .select()
      .single();

    if (boardError) throw boardError;

    // Handle favorite if initially true (rare for creation, but possible)
    if (is_favorite) {
      await supabase.from("board_favourites").insert({
        user_id: userId,
        board_id: newBoard.id,
      });
    }

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
      console.error("Error setting up board defaults:", error);
      return newBoard;
    }
  },

  async updateBoard(userId, boardId, updates) {
    // Separate board updates from category updates
    const { category, ...boardUpdates } = updates;

    let updatedBoard = null;

    if (Object.keys(boardUpdates).length > 0) {
      const { data, error } = await supabase
        .from("boards")
        .update(boardUpdates)
        .eq("id", boardId)
        .select()
        .single();

      if (error) throw error;
      updatedBoard = data;
    }

    // Handle category update if present
    if (category !== undefined) {
      const categories = await this.getUserCategories(userId);
      let targetCategoryId = null;

      if (category) {
        const existingCat = categories.find((c) => c.name === category);
        if (existingCat) {
          targetCategoryId = existingCat.id;
        } else {
          // Create new category implicitly or fail?
          // Let's create it for UX
          // We need a color, random or default
          const newCat = await this.createCategory(userId, category, "#8b5cf6");
          targetCategoryId = newCat.id;
        }
      }

      await this.assignBoardToCategory(userId, boardId, targetCategoryId);
    }

    // If we didn't update board itself but did update category, return fetched board
    if (!updatedBoard) {
      return this.getBoardDetails(userId, boardId);
    }

    return updatedBoard;
  },

  async deleteBoard(boardId) {
    const { error } = await supabase.from("boards").delete().eq("id", boardId);

    if (error) throw error;
  },

  async toggleFavorite(userId, boardId, isFavorite) {
    if (!userId) throw new Error("User ID is required");

    if (isFavorite) {
      // Add favorite
      const { error } = await supabase
        .from("board_favourites")
        .insert({ user_id: userId, board_id: boardId });

      if (error && error.code !== "23505") throw error; // Ignore unique violation
    } else {
      // Remove favorite
      const { error } = await supabase
        .from("board_favourites")
        .delete()
        .match({ user_id: userId, board_id: boardId });

      if (error) throw error;
    }

    return { id: boardId, is_favorite: isFavorite };
  },
};
