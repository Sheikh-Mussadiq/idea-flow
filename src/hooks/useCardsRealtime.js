import { useEffect, useRef } from "react";
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

/**
 * Hook to subscribe to real-time updates for cards
 * Automatically updates cards when they are created, updated, or deleted
 * Excludes position updates to avoid interfering with drag-and-drop
 * @param {Object|null} currentBoard - The current board object
 * @param {Function} onBoardUpdate - Callback to update the board in parent component
 */
export function useCardsRealtime(currentBoard, onBoardUpdate) {
  const subscriptionsRef = useRef([]);
  const subscribedBoardIdRef = useRef(null);
  const currentBoardRef = useRef(currentBoard);
  const cardIdsRef = useRef([]);

  // Keep currentBoard ref up to date and track card IDs
  useEffect(() => {
    currentBoardRef.current = currentBoard;
    if (currentBoard?.cards) {
      cardIdsRef.current = currentBoard.cards.map((card) => card.id);
    } else {
      cardIdsRef.current = [];
    }
  }, [currentBoard]);

  useEffect(() => {
    if (!currentBoard?.id) {
      // Clean up all subscriptions if no board
      subscriptionsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      subscriptionsRef.current = [];
      subscribedBoardIdRef.current = null;
      return;
    }

    const boardId = currentBoard.id;

    // Skip if already subscribed to this board
    if (subscribedBoardIdRef.current === boardId) {
      return;
    }

    // Clean up previous subscriptions if switching boards
    subscriptionsRef.current.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    subscriptionsRef.current = [];

    subscribedBoardIdRef.current = boardId;

    // Create a map of columns for quick lookup
    // Use ref to get latest columns
    const columnsMap = new Map(
      (currentBoardRef.current?.columns || []).map((col) => [col.id, col])
    );

    // Set up realtime subscription for cards
    const cardsChannel = supabase
      .channel(`cards:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cards",
          filter: `board_id=eq.${boardId}`,
        },
        async (payload) => {
          try {
            if (payload.eventType === "INSERT") {
              // Fetch the full card with all relationships
              const { data: newCard, error } = await supabase
                .from("cards")
                .select(
                  `
                  *,
                  subtasks(*),
                  attachments:card_attachments(*),
                  comments(
                    *,
                    user:users(*)
                  )
                `
                )
                .eq("id", payload.new.id)
                .single();

              if (error) {
                console.error("Error fetching new card:", error);
                return;
              }

              // Get column for kanbanStatus
              const column = columnsMap.get(newCard.column_id);
              const kanbanStatus = column?.title || "Backlog";

              // Transform to frontend format (assignees/labels will be set in onBoardUpdate)
              const frontendCard = {
                ...newCard,
                kanbanStatus,
                assignedTo: null,
                assignees: [],
                labels: [],
                dueDate: newCard.due_date,
                boardId: boardId,
                type: "manual",
                subtasks: newCard.subtasks || [],
                attachments: newCard.attachments || [],
                comments: newCard.comments || [],
              };

              // Fetch user details for assignees
              const assigneeUsers = await fetchAssigneeUsers(newCard.assigned_to || []);
              const assigneeUsersMap = new Map(assigneeUsers.map((u) => [u.id, u]));

              // Update currentBoard with the new card
              // Get members and tags from updated state for proper transformation
              onBoardUpdate((prev) => {
                const assignees = (newCard.assigned_to || [])
                  .map((uid) => assigneeUsersMap.get(uid))
                  .filter(Boolean);

                const tagsMap = new Map(
                  (prev.tags || []).map((t) => [t.id, t])
                );
                const labels = (newCard.tags || [])
                  .map((tagId) => tagsMap.get(tagId))
                  .filter(Boolean);

                const updated = {
                  ...prev,
                  cards: [
                    ...(prev.cards || []),
                    {
                      ...frontendCard,
                      assignedTo: assignees[0] || null,
                      assignees: assignees,
                      labels: labels,
                    },
                  ],
                };
                // Update cardIds ref
                cardIdsRef.current = updated.cards.map((card) => card.id);
                return updated;
              });
            } else if (payload.eventType === "UPDATE") {
              // Check if this is only a position/column_id update
              const oldData = payload.old;
              const newData = payload.new;

              // Get all keys that changed
              const changedKeys = Object.keys(newData).filter(
                (key) => oldData[key] !== newData[key]
              );

              // If only position or column_id changed (or both), skip the update
              // This prevents interference with drag-and-drop operations
              const onlyPositionChange =
                changedKeys.length === 1 && changedKeys[0] === "position";
              const onlyColumnChange =
                changedKeys.length === 1 && changedKeys[0] === "column_id";
              const onlyPositionAndColumnChange =
                changedKeys.length === 2 &&
                changedKeys.includes("position") &&
                changedKeys.includes("column_id");

              if (
                onlyPositionChange ||
                onlyColumnChange ||
                onlyPositionAndColumnChange
              ) {
                // Skip position-only updates
                return;
              }

              // Fetch the full updated card with all relationships
              const { data: updatedCard, error } = await supabase
                .from("cards")
                .select(
                  `
                  *,
                  subtasks(*),
                  attachments:card_attachments(*),
                  comments(
                    *,
                    user:users(*)
                  )
                `
                )
                .eq("id", payload.new.id)
                .single();

              if (error) {
                console.error("Error fetching updated card:", error);
                return;
              }

              // Get column for kanbanStatus
              const column = columnsMap.get(updatedCard.column_id);
              const kanbanStatus = column?.title || "Backlog";

              // Transform to frontend format (assignees/labels will be set in onBoardUpdate)
              const frontendCard = {
                ...updatedCard,
                kanbanStatus,
                assignedTo: null,
                assignees: [],
                labels: [],
                dueDate: updatedCard.due_date,
                boardId: boardId,
                type: "manual",
                subtasks: updatedCard.subtasks || [],
                attachments: updatedCard.attachments || [],
                comments: updatedCard.comments || [],
              };

              // Fetch user details for assignees
              const assigneeUsers = await fetchAssigneeUsers(updatedCard.assigned_to || []);
              const assigneeUsersMap = new Map(assigneeUsers.map((u) => [u.id, u]));

              // Update currentBoard with the updated card
              // Preserve position from current state if it exists (to avoid overwriting drag-and-drop)
              // Get members and tags from updated state for proper transformation
              onBoardUpdate((prev) => {
                const assignees = (updatedCard.assigned_to || [])
                  .map((uid) => assigneeUsersMap.get(uid))
                  .filter(Boolean);

                const tagsMap = new Map(
                  (prev.tags || []).map((t) => [t.id, t])
                );
                const labels = (updatedCard.tags || [])
                  .map((tagId) => tagsMap.get(tagId))
                  .filter(Boolean);

                return {
                  ...prev,
                  cards: (prev.cards || []).map((card) => {
                    if (card.id === frontendCard.id) {
                      // Preserve the current position if it exists (from drag-and-drop)
                      return {
                        ...frontendCard,
                        assignedTo: assignees[0] || null,
                        assignees: assignees,
                        labels: labels,
                        position: card.position || frontendCard.position,
                      };
                    }
                    return card;
                  }),
                };
              });
            } else if (payload.eventType === "DELETE") {
              // Remove the deleted card
              onBoardUpdate((prev) => {
                const updated = {
                  ...prev,
                  cards: (prev.cards || []).filter(
                    (card) => card.id !== payload.old.id
                  ),
                };
                // Update cardIds ref
                cardIdsRef.current = updated.cards.map((card) => card.id);
                return updated;
              });
            }
          } catch (error) {
            console.error("Error handling realtime card update:", error);
          }
        }
      )
      .subscribe();

    subscriptionsRef.current.push(cardsChannel);

    // Set up realtime subscription for subtasks
    const subtasksChannel = supabase
      .channel(`subtasks:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subtasks",
        },
        async (payload) => {
          try {
            // Check if this subtask belongs to a card in this board
            const cardId = payload.new?.card_id || payload.old?.card_id;
            if (!cardIdsRef.current.includes(cardId)) {
              return; // Not relevant to this board
            }

            if (payload.eventType === "INSERT") {
              // Fetch the full subtask
              const { data: newSubtask, error } = await supabase
                .from("subtasks")
                .select("*")
                .eq("id", payload.new.id)
                .single();

              if (error) {
                console.error("Error fetching new subtask:", error);
                return;
              }

              // Update the card's subtasks array
              onBoardUpdate((prev) => ({
                ...prev,
                cards: (prev.cards || []).map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        subtasks: [...(card.subtasks || []), newSubtask].sort(
                          (a, b) => (a.position || 0) - (b.position || 0)
                        ),
                      }
                    : card
                ),
              }));
            } else if (payload.eventType === "UPDATE") {
              // Check if this is only a position update
              const oldData = payload.old;
              const newData = payload.new;

              // Get all keys that changed
              const changedKeys = Object.keys(newData).filter(
                (key) => oldData[key] !== newData[key]
              );

              // If only position changed, skip the update (to avoid interfering with drag-and-drop)
              const onlyPositionChange =
                changedKeys.length === 1 && changedKeys[0] === "position";

              if (onlyPositionChange) {
                return;
              }

              // Fetch the updated subtask
              const { data: updatedSubtask, error } = await supabase
                .from("subtasks")
                .select("*")
                .eq("id", payload.new.id)
                .single();

              if (error) {
                console.error("Error fetching updated subtask:", error);
                return;
              }

              // Update the card's subtasks array
              onBoardUpdate((prev) => ({
                ...prev,
                cards: (prev.cards || []).map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        subtasks: (card.subtasks || [])
                          .map((st) =>
                            st.id === updatedSubtask.id ? updatedSubtask : st
                          )
                          .sort((a, b) => (a.position || 0) - (b.position || 0)),
                      }
                    : card
                ),
              }));
            } else if (payload.eventType === "DELETE") {
              // Remove the deleted subtask
              onBoardUpdate((prev) => ({
                ...prev,
                cards: (prev.cards || []).map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        subtasks: (card.subtasks || []).filter(
                          (st) => st.id !== payload.old.id
                        ),
                      }
                    : card
                ),
              }));
            }
          } catch (error) {
            console.error("Error handling realtime subtask update:", error);
          }
        }
      )
      .subscribe();

    subscriptionsRef.current.push(subtasksChannel);

    // Set up realtime subscription for comments
    const commentsChannel = supabase
      .channel(`comments:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
        },
        async (payload) => {
          try {
            // Check if this comment belongs to a card in this board
            const cardId = payload.new?.card_id || payload.old?.card_id;
            if (!cardIdsRef.current.includes(cardId)) {
              return; // Not relevant to this board
            }

            if (payload.eventType === "INSERT") {
              // Fetch the full comment with user data
              const { data: newComment, error } = await supabase
                .from("comments")
                .select(
                  `
                  *,
                  user:users(*)
                `
                )
                .eq("id", payload.new.id)
                .single();

              if (error) {
                console.error("Error fetching new comment:", error);
                return;
              }

              // Update the card's comments array
              onBoardUpdate((prev) => ({
                ...prev,
                cards: (prev.cards || []).map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        comments: [...(card.comments || []), newComment].sort(
                          (a, b) =>
                            new Date(a.created_at) - new Date(b.created_at)
                        ),
                      }
                    : card
                ),
              }));
            } else if (payload.eventType === "UPDATE") {
              // Fetch the updated comment with user data
              const { data: updatedComment, error } = await supabase
                .from("comments")
                .select(
                  `
                  *,
                  user:users(*)
                `
                )
                .eq("id", payload.new.id)
                .single();

              if (error) {
                console.error("Error fetching updated comment:", error);
                return;
              }

              // Update the card's comments array
              onBoardUpdate((prev) => ({
                ...prev,
                cards: (prev.cards || []).map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        comments: (card.comments || []).map((comment) =>
                          comment.id === updatedComment.id
                            ? updatedComment
                            : comment
                        ),
                      }
                    : card
                ),
              }));
            } else if (payload.eventType === "DELETE") {
              // Remove the deleted comment
              onBoardUpdate((prev) => ({
                ...prev,
                cards: (prev.cards || []).map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        comments: (card.comments || []).filter(
                          (comment) => comment.id !== payload.old.id
                        ),
                      }
                    : card
                ),
              }));
            }
          } catch (error) {
            console.error("Error handling realtime comment update:", error);
          }
        }
      )
      .subscribe();

    subscriptionsRef.current.push(commentsChannel);

    // Cleanup function
    return () => {
      subscriptionsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      subscriptionsRef.current = [];
      subscribedBoardIdRef.current = null;
    };
  }, [currentBoard?.id, onBoardUpdate]);
}

