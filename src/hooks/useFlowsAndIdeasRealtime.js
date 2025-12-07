import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Hook to subscribe to real-time updates for AI flows and ideas
 * Automatically updates flows and ideas when they are created, updated, or deleted
 * @param {Object|null} currentBoard - The current board object
 * @param {Function} onBoardUpdate - Callback to update the board in parent component
 */
export function useFlowsAndIdeasRealtime(currentBoard, onBoardUpdate) {
  const subscriptionsRef = useRef([]);
  const flowIdsRef = useRef([]);
  const subscribedBoardIdRef = useRef(null);

  // Update flowIds ref whenever currentBoard changes
  useEffect(() => {
    if (currentBoard?.ai_flows) {
      flowIdsRef.current = currentBoard.ai_flows.map((flow) => flow.id);
    } else {
      flowIdsRef.current = [];
    }
  }, [currentBoard?.ai_flows]);

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
    if (subscribedBoardIdRef.current && subscribedBoardIdRef.current !== boardId) {
      subscriptionsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      subscriptionsRef.current = [];
    }

    subscribedBoardIdRef.current = boardId;

    // Subscription 1: AI Flows changes for this board
    const flowsChannel = supabase
      .channel(`ai_flows:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ai_flows",
          filter: `board_id=eq.${boardId}`,
        },
        async (payload) => {
          try {
            if (payload.eventType === "INSERT") {
              // Fetch the full flow
              const { data: newFlow, error } = await supabase
                .from("ai_flows")
                .select("*")
                .eq("id", payload.new.id)
                .single();

              if (error) {
                console.error("Error fetching new flow:", error);
                return;
              }

              // Update currentBoard with the new flow
              onBoardUpdate((prev) => {
                const updated = {
                  ...prev,
                  ai_flows: [...(prev.ai_flows || []), { ...newFlow, ideas: [] }],
                };
                // Update flowIds ref
                flowIdsRef.current = updated.ai_flows.map((flow) => flow.id);
                return updated;
              });
            } else if (payload.eventType === "UPDATE") {
              // Fetch the updated flow
              const { data: updatedFlow, error } = await supabase
                .from("ai_flows")
                .select("*")
                .eq("id", payload.new.id)
                .single();

              if (error) {
                console.error("Error fetching updated flow:", error);
                return;
              }

              // Update currentBoard with the updated flow
              onBoardUpdate((prev) => ({
                ...prev,
                ai_flows: (prev.ai_flows || []).map((flow) =>
                  flow.id === updatedFlow.id ? updatedFlow : flow
                ),
              }));
            } else if (payload.eventType === "DELETE") {
              // Remove the deleted flow and its ideas
              onBoardUpdate((prev) => {
                const updated = {
                  ...prev,
                  ai_flows: (prev.ai_flows || []).filter(
                    (flow) => flow.id !== payload.old.id
                  ),
                  flowIdeas: (prev.flowIdeas || []).filter(
                    (idea) => idea.flowId !== payload.old.id
                  ),
                };
                // Update flowIds ref
                flowIdsRef.current = updated.ai_flows.map((flow) => flow.id);
                return updated;
              });
            }
          } catch (error) {
            console.error("Error handling realtime flow update:", error);
          }
        }
      )
      .subscribe();

    subscriptionsRef.current.push(flowsChannel);

    // Subscription 2: AI Ideas changes for flows in this board
    // We need to filter by flow_id being in the list of flowIds
    // Since Supabase doesn't support IN filters directly in realtime, we'll listen to all changes
    // and filter in the callback
    const ideasChannel = supabase
      .channel(`ai_ideas:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ai_ideas",
        },
        async (payload) => {
          try {
            // Check if this idea belongs to a flow in this board
            // Use ref to get current flowIds (avoids stale closure)
            const ideaFlowId = payload.new?.flow_id || payload.old?.flow_id;
            if (!flowIdsRef.current.includes(ideaFlowId)) {
              return; // Not relevant to this board
            }

            if (payload.eventType === "INSERT") {
              // Fetch the full idea with comments
              const { data: newIdea, error } = await supabase
                .from("ai_ideas")
                .select(
                  `
                  *,
                  idea_comments:ai_ideas_comments(
                    *,
                    user:users(*)
                  )
                `
                )
                .eq("id", payload.new.id)
                .single();

              if (error) {
                console.error("Error fetching new idea:", error);
                return;
              }

              // Transform to frontend format
              const frontendIdea = {
                ...newIdea,
                id: newIdea.id,
                title: newIdea.title,
                description: newIdea.description,
                tags: newIdea.tags || [],
                type: "ai",
                boardId: boardId,
                flowId: newIdea.flow_id,
                parentId: newIdea.parent_id,
                is_liked: newIdea.is_liked || false,
                is_disliked: newIdea.is_disliked || false,
                kanbanStatus: null,
                assignedTo: null,
                labels: [],
                idea_comments: newIdea.idea_comments || [],
              };

              // Update currentBoard with the new idea
              onBoardUpdate((prev) => ({
                ...prev,
                flowIdeas: [...(prev.flowIdeas || []), frontendIdea],
              }));
            } else if (payload.eventType === "UPDATE") {
              // Fetch the updated idea with comments
              const { data: updatedIdea, error } = await supabase
                .from("ai_ideas")
                .select(
                  `
                  *,
                  idea_comments:ai_ideas_comments(
                    *,
                    user:users(*)
                  )
                `
                )
                .eq("id", payload.new.id)
                .single();

              if (error) {
                console.error("Error fetching updated idea:", error);
                return;
              }

              // Transform to frontend format
              const frontendIdea = {
                ...updatedIdea,
                id: updatedIdea.id,
                title: updatedIdea.title,
                description: updatedIdea.description,
                tags: updatedIdea.tags || [],
                type: "ai",
                boardId: boardId,
                flowId: updatedIdea.flow_id,
                parentId: updatedIdea.parent_id,
                is_liked: updatedIdea.is_liked || false,
                is_disliked: updatedIdea.is_disliked || false,
                kanbanStatus: null,
                assignedTo: null,
                labels: [],
                idea_comments: updatedIdea.idea_comments || [],
              };

              // Update currentBoard with the updated idea
              onBoardUpdate((prev) => ({
                ...prev,
                flowIdeas: (prev.flowIdeas || []).map((idea) =>
                  idea.id === frontendIdea.id ? frontendIdea : idea
                ),
              }));
            } else if (payload.eventType === "DELETE") {
              // Remove the deleted idea
              onBoardUpdate((prev) => ({
                ...prev,
                flowIdeas: (prev.flowIdeas || []).filter(
                  (idea) => idea.id !== payload.old.id
                ),
              }));
            }
          } catch (error) {
            console.error("Error handling realtime idea update:", error);
          }
        }
      )
      .subscribe();

    subscriptionsRef.current.push(ideasChannel);

    // Cleanup function
    return () => {
      subscriptionsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      subscriptionsRef.current = [];
    };
  }, [currentBoard?.id, onBoardUpdate]);
}

