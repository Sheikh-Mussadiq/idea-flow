import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

/**
 * Hook to track real-time presence of users on a board
 * Shows which users are currently viewing the board
 */
export function useBoardPresence(boardId) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!boardId || !currentUser) return;

    // Create a unique channel for this board's presence
    const channel = supabase.channel(`board-presence:${boardId}`, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    // Handle presence sync (initial state and updates)
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const users = [];

      // Extract user data from presence state
      Object.keys(state).forEach((key) => {
        const presences = state[key];
        if (presences && presences.length > 0) {
          // Take the most recent presence for each user
          const presence = presences[0];
          users.push({
            id: presence.user_id,
            full_name: presence.full_name,
            avatar_url: presence.avatar_url,
            email: presence.email,
            online_at: presence.online_at,
          });
        }
      });

      setOnlineUsers(users);
    });

    // Handle user joining
    channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
      console.log("User joined board:", key, newPresences);
    });

    // Handle user leaving
    channel.on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      console.log("User left board:", key, leftPresences);
    });

    // Subscribe and track current user's presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: currentUser.id,
          full_name: currentUser.full_name,
          avatar_url: currentUser.avatar_url,
          email: currentUser.email,
          online_at: new Date().toISOString(),
        });
      }
    });

    // Cleanup on unmount or board change
    return () => {
      channel.unsubscribe();
    };
  }, [boardId, currentUser]);

  return { onlineUsers };
}
