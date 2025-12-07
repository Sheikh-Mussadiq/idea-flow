import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Hook to subscribe to real-time updates for AI idea comments
 * Automatically updates comments when they are added, updated, or deleted
 * Subscribes to ALL AI ideas in the flowIdeas array
 * @param {Array} flowIdeas - Array of AI ideas to subscribe to
 * @param {Function} onCommentsUpdate - Callback to update comments in parent component
 */
export function useAiIdeaCommentsRealtime(flowIdeas, onCommentsUpdate) {
  const subscriptionsRef = useRef(new Map());

  useEffect(() => {
    if (!flowIdeas || flowIdeas.length === 0) {
      // Clean up all subscriptions if no ideas
      subscriptionsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      subscriptionsRef.current.clear();
      return;
    }

    // Get all AI idea IDs (filter out cards)
    const aiIdeaIds = flowIdeas
      .filter((idea) => idea.type === "ai" || idea.flowId)
      .map((idea) => idea.id);

    // Set up subscriptions for all AI ideas
    aiIdeaIds.forEach((ideaId) => {
      // Skip if subscription already exists
      if (subscriptionsRef.current.has(ideaId)) {
        return;
      }

      // Set up realtime subscription for this idea
      const channel = supabase
        .channel(`ai_ideas_comments:${ideaId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "ai_ideas_comments",
            filter: `ai_idea_id=eq.${ideaId}`,
          },
          async (payload) => {
            try {
              if (payload.eventType === "INSERT") {
                // Fetch the full comment with user data
                const { data: newComment, error } = await supabase
                  .from("ai_ideas_comments")
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

                // Call the update callback to add the new comment
                onCommentsUpdate((prevIdeas) =>
                  prevIdeas.map((idea) =>
                    idea.id === ideaId
                      ? {
                          ...idea,
                          idea_comments: [
                            ...(idea.idea_comments || []),
                            newComment,
                          ],
                        }
                      : idea
                  )
                );
              } else if (payload.eventType === "UPDATE") {
                // Fetch the updated comment with user data
                const { data: updatedComment, error } = await supabase
                  .from("ai_ideas_comments")
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

                // Call the update callback to update the comment
                onCommentsUpdate((prevIdeas) =>
                  prevIdeas.map((idea) =>
                    idea.id === ideaId
                      ? {
                          ...idea,
                          idea_comments: (idea.idea_comments || []).map(
                            (comment) =>
                              comment.id === updatedComment.id
                                ? updatedComment
                                : comment
                          ),
                        }
                      : idea
                  )
                );
              } else if (payload.eventType === "DELETE") {
                // Call the update callback to remove the deleted comment
                onCommentsUpdate((prevIdeas) =>
                  prevIdeas.map((idea) =>
                    idea.id === ideaId
                      ? {
                          ...idea,
                          idea_comments: (idea.idea_comments || []).filter(
                            (comment) => comment.id !== payload.old.id
                          ),
                        }
                      : idea
                  )
                );
              }
            } catch (error) {
              console.error("Error handling realtime comment update:", error);
            }
          }
        )
        .subscribe();

      subscriptionsRef.current.set(ideaId, channel);
    });

    // Clean up subscriptions for ideas that no longer exist
    subscriptionsRef.current.forEach((channel, ideaId) => {
      if (!aiIdeaIds.includes(ideaId)) {
        supabase.removeChannel(channel);
        subscriptionsRef.current.delete(ideaId);
      }
    });

    // Cleanup function
    return () => {
      subscriptionsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      subscriptionsRef.current.clear();
    };
  }, [flowIdeas, onCommentsUpdate]);
}

