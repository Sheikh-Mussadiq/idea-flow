// File: supabase/functions/idea-generator/index.ts
// Deno Edge Function for generating ideas using OpenAI Assistant API v2

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
  idea_input: z.string().min(1, "idea_input is required"),
  user_profile: z.object({
    preferred_tone: z.string().optional(),
    preferred_length: z.string().optional(),
    topics_liked: z.array(z.string()).optional(),
    topics_disliked: z.array(z.string()).optional(),
    idea_style: z.string().optional(),
    examples_of_liked_ideas: z.array(z.string()).optional(),
    examples_of_disliked_ideas: z.array(z.string()).optional(),
  }),
});

// -----------------------------
// OPENAI ASSISTANT CONFIG
// -----------------------------
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const ASSISTANT_ID = Deno.env.get("IDEA_GENERATOR_ASSISTANT_ID")!;

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
    // Parse and validate input
    // -----------------------------
    const body = await req.json();
    console.log("[idea-generator] Incoming request body:", body);

    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) {
      console.error("[idea-generator] Input validation failed:", parsed.error);
      return new Response(JSON.stringify({
        error: "Invalid request format.",
        details: parsed.error.errors
      }), { status: 400, headers: corsHeaders });
    }

    const { idea_input, user_profile } = parsed.data;

    // Validate environment variables
    if (!OPENAI_API_KEY) {
      console.error("[idea-generator] OPENAI_API_KEY not configured");
      return new Response(JSON.stringify({
        error: "OpenAI API key not configured."
      }), { status: 500, headers: corsHeaders });
    }

    if (!ASSISTANT_ID) {
      console.error("[idea-generator] IDEA_GENERATOR_ASSISTANT_ID not configured");
      return new Response(JSON.stringify({
        error: "Assistant ID not configured."
      }), { status: 500, headers: corsHeaders });
    }

    // -----------------------------
    // Create Thread for Assistant
    // -----------------------------
    console.log("[idea-generator] Creating assistant thread...");

    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: openaiHeaders,
      body: JSON.stringify({})
    });

    if (!threadRes.ok) {
      const errorData = await threadRes.json().catch(() => ({}));
      console.error("[idea-generator] Failed to create thread:", errorData);
      return new Response(JSON.stringify({
        error: "Failed to create OpenAI thread.",
        details: errorData
      }), { status: 500, headers: corsHeaders });
    }

    const threadData = await threadRes.json();
    const threadId = threadData.id;
    
    if (!threadId) {
      console.error("[idea-generator] Thread ID missing in response:", threadData);
      return new Response(JSON.stringify({
        error: "Invalid response from OpenAI API."
      }), { status: 500, headers: corsHeaders });
    }

    console.log("[idea-generator] Thread created:", threadId);

    // -----------------------------
    // Send message to assistant
    // -----------------------------
    const messagePayload = {
      role: "user",
      content: `
Request: "${idea_input}"

User profile: ${JSON.stringify(user_profile)}
      `.trim()
    };

    console.log("[idea-generator] Sending message to assistant...");

    const messageRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: openaiHeaders,
      body: JSON.stringify(messagePayload)
    });

    if (!messageRes.ok) {
      const errorData = await messageRes.json().catch(() => ({}));
      console.error("[idea-generator] Failed to send message:", errorData);
      return new Response(JSON.stringify({
        error: "Failed to send message to assistant.",
        details: errorData
      }), { status: 500, headers: corsHeaders });
    }

    // -----------------------------
    // Run the assistant
    // -----------------------------
    console.log("[idea-generator] Running assistant...");

    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: openaiHeaders,
      body: JSON.stringify({ assistant_id: ASSISTANT_ID })
    });

    if (!runRes.ok) {
      const errorData = await runRes.json().catch(() => ({}));
      console.error("[idea-generator] Failed to start run:", errorData);
      return new Response(JSON.stringify({
        error: "Failed to start assistant run.",
        details: errorData
      }), { status: 500, headers: corsHeaders });
    }

    const runData = await runRes.json();
    
    console.log("[idea-generator] Initial run response:", JSON.stringify(runData, null, 2));
    
    const runId = runData.id;

    if (!runId) {
      console.error("[idea-generator] Run ID missing in response:", runData);
      return new Response(JSON.stringify({
        error: "Invalid response from OpenAI API.",
        details: runData
      }), { status: 500, headers: corsHeaders });
    }

    // Validate initial status exists
    if (!runData.status) {
      console.error("[idea-generator] Status missing in initial run response:", runData);
      return new Response(JSON.stringify({
        error: "Invalid run response from OpenAI API - status missing.",
        details: runData
      }), { status: 500, headers: corsHeaders });
    }

    let runStatus: any = runData;
    console.log("[idea-generator] Initial run status:", runStatus.status);
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
        console.error("[idea-generator] Failed to check run status:", errorData);
        return new Response(JSON.stringify({
          error: "Failed to check assistant run status.",
          details: errorData
        }), { status: 500, headers: corsHeaders });
      }

      const statusData = await statusRes.json();
      
      // Log full response periodically for debugging
      if (pollAttempts === 1 || pollAttempts % 10 === 0) {
        console.log("[idea-generator] Status response:", JSON.stringify(statusData, null, 2));
      }

      // Validate response structure
      if (!statusData || typeof statusData !== 'object') {
        console.error("[idea-generator] Invalid status response:", statusData);
        return new Response(JSON.stringify({
          error: "Invalid response format from OpenAI API.",
          details: statusData
        }), { status: 500, headers: corsHeaders });
      }

      runStatus = statusData;
      const currentStatus = runStatus.status;
      
      console.log("[idea-generator] Run status:", currentStatus);

      // Check if status is undefined or invalid
      if (!currentStatus) {
        console.error("[idea-generator] Status is undefined in response:", runStatus);
        return new Response(JSON.stringify({
          error: "Invalid run status response from OpenAI API.",
          details: runStatus
        }), { status: 500, headers: corsHeaders });
      }

      // Check for failed or cancelled status
      if (currentStatus === "failed" || currentStatus === "cancelled" || currentStatus === "expired") {
        console.error("[idea-generator] Run failed:", runStatus);
        return new Response(JSON.stringify({
          error: `Assistant run ${currentStatus}.`,
          details: runStatus.last_error
        }), { status: 500, headers: corsHeaders });
      }
    }

    if (runStatus?.status !== "completed") {
      console.error("[idea-generator] Run timed out after", pollAttempts, "attempts. Final status:", runStatus?.status);
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
    console.log("[idea-generator] Fetching assistant output...");

    const messagesRes = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { headers: openaiHeaders }
    );

    if (!messagesRes.ok) {
      const errorData = await messagesRes.json().catch(() => ({}));
      console.error("[idea-generator] Failed to fetch messages:", errorData);
      return new Response(JSON.stringify({
        error: "Failed to fetch assistant messages.",
        details: errorData
      }), { status: 500, headers: corsHeaders });
    }

    const messagesData = await messagesRes.json();

    if (!messagesData.data || !Array.isArray(messagesData.data)) {
      console.error("[idea-generator] Invalid messages response:", messagesData);
      return new Response(JSON.stringify({
        error: "Invalid response from OpenAI API."
      }), { status: 500, headers: corsHeaders });
    }

    const assistantMessage = messagesData.data.find((m: any) => m.role === "assistant");

    if (!assistantMessage || !assistantMessage.content || !assistantMessage.content[0]) {
      console.error("[idea-generator] No assistant output found");
      return new Response(JSON.stringify({
        error: "Assistant did not return a result."
      }), { status: 500, headers: corsHeaders });
    }

    // Parse assistant response
    let ideasResponse;
    try {
      const contentText = assistantMessage.content[0].text?.value || assistantMessage.content[0].text;
      if (!contentText) {
        throw new Error("No text content found in assistant message");
      }
      ideasResponse = JSON.parse(contentText);
    } catch (parseError) {
      console.error("[idea-generator] Failed to parse assistant response:", parseError);
      console.error("[idea-generator] Raw content:", assistantMessage.content[0]);
      return new Response(JSON.stringify({
        error: "Failed to parse assistant response as JSON.",
        details: parseError.message
      }), { status: 500, headers: corsHeaders });
    }

    // Validate response structure
    if (!ideasResponse || typeof ideasResponse !== 'object' || !Array.isArray(ideasResponse.ideas)) {
      console.error("[idea-generator] Invalid ideas response structure:", ideasResponse);
      return new Response(JSON.stringify({
        error: "Assistant returned invalid response structure.",
        details: ideasResponse
      }), { status: 500, headers: corsHeaders });
    }

    console.log("[idea-generator] Ideas generated successfully:", ideasResponse);

    // -----------------------------
    // Return final result
    // -----------------------------
    return new Response(JSON.stringify(ideasResponse), { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (err) {
    console.error("[idea-generator] Fatal error:", err);
    return new Response(JSON.stringify({
      error: "Server error.",
      details: err.message
    }), { status: 500, headers: corsHeaders });
  }
});

