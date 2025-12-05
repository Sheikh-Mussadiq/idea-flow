// File: supabase/functions/profile-update/index.ts
// Deno Edge Function

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// -----------------------------
// CORS HEADERS
// -----------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

// -----------------------------
// ZOD SCHEMA FOR SAFETY
// -----------------------------
const InputSchema = z.object({
  user_id: z.string(),
  idea: z.string(),
  reaction: z.enum(["like", "dislike"]),
});

// -----------------------------
// SUPABASE CLIENT
// -----------------------------
// We'll create the client per request with the user's auth token to respect RLS
const getSupabaseClient = (authToken?: string) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  // Create client with custom headers to include the auth token for RLS
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`
      } : {}
    },
    auth: {
      persistSession: false, // Don't persist session in edge function
      autoRefreshToken: false, // Don't auto refresh in edge function
    }
  });
  
  return client;
};

// -----------------------------
// OPENAI ASSISTANT CONFIG
// -----------------------------
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const ASSISTANT_ID = Deno.env.get("PROFILE_ASSISTANT_ID")!; // Store assistant ID in env

const openaiHeaders = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${OPENAI_API_KEY}`,
  "OpenAI-Beta": "assistants=v2"
};

// -----------------------------
// MAIN EDGE FUNCTION HANDLER
// -----------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // -----------------------------
    // Extract authorization header for RLS
    // -----------------------------
    const authHeader = req.headers.get("Authorization");
    const authToken = authHeader?.replace("Bearer ", "") || undefined;
    
    // Create Supabase client with user's auth token to respect RLS
    const supabase = getSupabaseClient(authToken);

    // -----------------------------
    // Parse and validate input
    // -----------------------------
    const body = await req.json();
    console.log("[profile-update] Incoming request body:", body);

    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      console.error("[profile-update] Input validation failed:", parsed.error);
      return new Response(JSON.stringify({
        error: "Invalid request format.",
        details: parsed.error.errors
      }), { status: 400, headers: corsHeaders });
    }

    const { user_id, idea, reaction } = parsed.data;

    // -----------------------------
    // Verify authenticated user matches requested user_id
    // -----------------------------
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      console.error("[profile-update] Authentication error:", authError);
      return new Response(JSON.stringify({
        error: "Authentication required."
      }), { status: 401, headers: corsHeaders });
    }

    // Verify that the user_id in the request matches the authenticated user
    if (authUser.id !== user_id) {
      console.error("[profile-update] User ID mismatch. Auth user:", authUser.id, "Request user:", user_id);
      return new Response(JSON.stringify({
        error: "You can only update your own profile."
      }), { status: 403, headers: corsHeaders });
    }

    // -----------------------------
    // Fetch or create profile using REST API with auth header for proper RLS
    // -----------------------------
    console.log("[profile-update] Fetching profile for user:", user_id);
    console.log("[profile-update] Authenticated user ID:", authUser.id);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Use REST API directly with Authorization header for proper RLS
    const restHeaders = {
      "Content-Type": "application/json",
      "apikey": supabaseAnonKey,
      "Authorization": authToken ? `Bearer ${authToken}` : `Bearer ${supabaseAnonKey}`
    };

    // Try to fetch existing profile
    const fetchUrl = `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${user_id}&select=profile`;
    const fetchRes = await fetch(fetchUrl, {
      method: "GET",
      headers: restHeaders
    });

    let profileRow: any = null;
    let profileError: any = null;

    if (fetchRes.ok) {
      const data = await fetchRes.json();
      if (data && data.length > 0) {
        profileRow = { profile: data[0].profile };
        console.log("[profile-update] Profile found, using existing profile");
      } else {
        // Profile doesn't exist
        profileError = { code: 'PGRST116', message: 'No rows returned' };
        console.log("[profile-update] Profile not found");
      }
    } else {
      const errorData = await fetchRes.json().catch(() => ({}));
      profileError = errorData;
      console.error("[profile-update] Error fetching profile:", errorData);
      
      // If it's not a "not found" error, return it
      if (fetchRes.status !== 404 && fetchRes.status !== 406) {
        return new Response(JSON.stringify({
          error: "Failed to fetch profile.",
          details: profileError
        }), { status: fetchRes.status, headers: corsHeaders });
      }
    }

    // If profile doesn't exist, create one with default
    if (!profileRow) {
      console.log("[profile-update] Profile not found, creating default profile for user:", user_id);
      const createUrl = `${supabaseUrl}/rest/v1/user_profiles`;
      const createRes = await fetch(createUrl, {
        method: "POST",
        headers: restHeaders,
        body: JSON.stringify({ user_id })
      });

      if (!createRes.ok) {
        const createError = await createRes.json().catch(() => ({}));
        console.error("[profile-update] Failed to create profile:", createError);
        console.error("[profile-update] Create error details:", {
          status: createRes.status,
          statusText: createRes.statusText,
          error: createError
        });
        return new Response(JSON.stringify({
          error: "Failed to create profile.",
          details: createError
        }), { status: createRes.status, headers: corsHeaders });
      }

      const newProfileData = await createRes.json();
      profileRow = Array.isArray(newProfileData) ? { profile: newProfileData[0]?.profile } : { profile: newProfileData?.profile };
      console.log("[profile-update] Profile created successfully");
    }

    const currentProfile = profileRow.profile;
    console.log("[profile-update] Current profile:", currentProfile);

    // -----------------------------
    // Create Thread for Assistant
    // -----------------------------
    console.log("[profile-update] Creating assistant thread...");

    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: openaiHeaders,
      body: JSON.stringify({})
    });

    if (!threadRes.ok) {
      const errorData = await threadRes.json().catch(() => ({}));
      console.error("[profile-update] Failed to create thread:", errorData);
      return new Response(JSON.stringify({
        error: "Failed to create OpenAI thread.",
        details: errorData
      }), { status: 500, headers: corsHeaders });
    }

    const threadData = await threadRes.json();
    const threadId = threadData.id;
    
    if (!threadId) {
      console.error("[profile-update] Thread ID missing in response:", threadData);
      return new Response(JSON.stringify({
        error: "Invalid response from OpenAI API."
      }), { status: 500, headers: corsHeaders });
    }

    console.log("[profile-update] Thread created:", threadId);

    // -----------------------------
    // Send message to assistant
    // -----------------------------
    const messagePayload = {
      role: "user",
      content: `
User ${JSON.stringify(currentProfile)}
Incoming idea: “${idea}”
Reaction: ${reaction}
      `
    };

    console.log("[profile-update] Sending message to assistant...");

    const messageRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: openaiHeaders,
      body: JSON.stringify(messagePayload)
    });

    if (!messageRes.ok) {
      const errorData = await messageRes.json().catch(() => ({}));
      console.error("[profile-update] Failed to send message:", errorData);
      return new Response(JSON.stringify({
        error: "Failed to send message to assistant.",
        details: errorData
      }), { status: 500, headers: corsHeaders });
    }

    // -----------------------------
    // Run the assistant
    // -----------------------------
    console.log("[profile-update] Running assistant...");

    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: openaiHeaders,
      body: JSON.stringify({ assistant_id: ASSISTANT_ID })
    });

    if (!runRes.ok) {
      const errorData = await runRes.json().catch(() => ({}));
      console.error("[profile-update] Failed to start run:", errorData);
      return new Response(JSON.stringify({
        error: "Failed to start assistant run.",
        details: errorData
      }), { status: 500, headers: corsHeaders });
    }

    const runData = await runRes.json();
    
    // Log initial run response for debugging
    console.log("[profile-update] Initial run response:", JSON.stringify(runData, null, 2));
    
    const runId = runData.id;

    if (!runId) {
      console.error("[profile-update] Run ID missing in response:", runData);
      return new Response(JSON.stringify({
        error: "Invalid response from OpenAI API.",
        details: runData
      }), { status: 500, headers: corsHeaders });
    }

    // Validate initial status exists
    if (!runData.status) {
      console.error("[profile-update] Status missing in initial run response:", runData);
      return new Response(JSON.stringify({
        error: "Invalid run response from OpenAI API - status missing.",
        details: runData
      }), { status: 500, headers: corsHeaders });
    }

    let runStatus: any = runData;
    console.log("[profile-update] Initial run status:", runStatus.status);
    const maxPollAttempts = 120; // 60 seconds max (120 * 500ms)
    let pollAttempts = 0;

    // Poll until completed
    while (runStatus?.status !== "completed" && pollAttempts < maxPollAttempts) {
      await new Promise((r) => setTimeout(r, 500));
      pollAttempts++;

      const statusRes = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        { headers: openaiHeaders }
      );

      if (!statusRes.ok) {
        const errorData = await statusRes.json().catch(() => ({}));
        console.error("[profile-update] Failed to check run status:", errorData);
        return new Response(JSON.stringify({
          error: "Failed to check assistant run status.",
          details: errorData
        }), { status: 500, headers: corsHeaders });
      }

      const statusData = await statusRes.json();
      
      // Log full response for debugging
      if (pollAttempts === 1 || pollAttempts % 10 === 0) {
        console.log("[profile-update] Full status response:", JSON.stringify(statusData, null, 2));
      }

      // Validate response structure
      if (!statusData || typeof statusData !== 'object') {
        console.error("[profile-update] Invalid status response:", statusData);
        return new Response(JSON.stringify({
          error: "Invalid response format from OpenAI API.",
          details: statusData
        }), { status: 500, headers: corsHeaders });
      }

      runStatus = statusData;
      const currentStatus = runStatus.status;
      
      console.log("[profile-update] Run status:", currentStatus);

      // Check if status is undefined or invalid
      if (!currentStatus) {
        console.error("[profile-update] Status is undefined in response:", runStatus);
        return new Response(JSON.stringify({
          error: "Invalid run status response from OpenAI API.",
          details: runStatus
        }), { status: 500, headers: corsHeaders });
      }

      // Check for failed or cancelled status
      if (currentStatus === "failed" || currentStatus === "cancelled" || currentStatus === "expired") {
        console.error("[profile-update] Run failed:", runStatus);
        return new Response(JSON.stringify({
          error: `Assistant run ${currentStatus}.`,
          details: runStatus.last_error
        }), { status: 500, headers: corsHeaders });
      }
    }

    if (runStatus?.status !== "completed") {
      console.error("[profile-update] Run timed out after", pollAttempts, "attempts. Final status:", runStatus?.status);
      return new Response(JSON.stringify({
        error: "Assistant run timed out.",
        details: {
          finalStatus: runStatus?.status,
          finalResponse: runStatus
        }
      }), { status: 500, headers: corsHeaders });
    }

    // -----------------------------
    // Retrieve messages from assistant
    // -----------------------------
    console.log("[profile-update] Fetching assistant output...");

    const messagesRes = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { headers: openaiHeaders }
    );

    if (!messagesRes.ok) {
      const errorData = await messagesRes.json().catch(() => ({}));
      console.error("[profile-update] Failed to fetch messages:", errorData);
      return new Response(JSON.stringify({
        error: "Failed to fetch assistant messages.",
        details: errorData
      }), { status: 500, headers: corsHeaders });
    }

    const messagesData = await messagesRes.json();

    if (!messagesData.data || !Array.isArray(messagesData.data)) {
      console.error("[profile-update] Invalid messages response:", messagesData);
      return new Response(JSON.stringify({
        error: "Invalid response from OpenAI API."
      }), { status: 500, headers: corsHeaders });
    }

    const assistantMessage = messagesData.data.find((m: any) => m.role === "assistant");

    if (!assistantMessage || !assistantMessage.content || !assistantMessage.content[0]) {
      console.error("[profile-update] No assistant output found");
      return new Response(JSON.stringify({
        error: "Assistant did not return a result."
      }), { status: 500, headers: corsHeaders });
    }

    let updatedProfile;
    try {
      const contentText = assistantMessage.content[0].text?.value || assistantMessage.content[0].text;
      if (!contentText) {
        throw new Error("No text content found in assistant message");
      }
      updatedProfile = JSON.parse(contentText);
    } catch (parseError) {
      console.error("[profile-update] Failed to parse assistant response:", parseError);
      return new Response(JSON.stringify({
        error: "Failed to parse assistant response as JSON.",
        details: parseError.message
      }), { status: 500, headers: corsHeaders });
    }

    console.log("[profile-update] Updated profile:", updatedProfile);

    // -----------------------------
    // Save updated profile
    // -----------------------------
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ profile: updatedProfile })
      .eq("user_id", user_id);

    if (updateError) {
      console.error("[profile-update] Supabase update failed:", updateError);
      return new Response(JSON.stringify({
        error: "Database update failed."
      }), { status: 500, headers: corsHeaders });
    }

    // -----------------------------
    // Return final result
    // -----------------------------
    console.log("[profile-update] Profile update successful.");

    return new Response(JSON.stringify({
      message: "Profile updated successfully.",
      profile: updatedProfile
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error("[profile-update] Fatal error:", err);
    return new Response(JSON.stringify({
      error: "Server error.",
      details: err.message
    }), { status: 500, headers: corsHeaders });
  }
});
