import {
  MoreVertical,
  Plus,
  Globe,
  Mic,
  ArrowUp,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function SynthAIChat() {
  return (
    <div className="w-[340px] bg-white border-l border-neutral-200 flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-neutral-100 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-sm text-neutral-900">SynthAI</span>
        </div>
        <button className="text-neutral-400 hover:text-neutral-600">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="bg-primary-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[85%] shadow-sm">
            How can I improve my website's conversion rate?
          </div>
        </div>

        {/* AI Message */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
             <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
             </div>
          </div>
          <div className="space-y-3 text-sm text-neutral-600">
            <p>
              Improving your website's conversion rate starts with optimizing user
              experience. Here are three key strategies:
            </p>
            <ol className="space-y-3 list-decimal list-inside">
              <li>
                <strong className="text-neutral-900">Simplify Your Landing Page</strong> – Keep it
                clean, remove distractions, and highlight a clear call-to-action.
              </li>
              <li>
                <strong className="text-neutral-900">Use AI-Powered A/B Testing</strong> – Test
                headlines, images, and CTAs to find what converts best.
              </li>
              <li>
                <strong className="text-neutral-900">Personalize User Experience</strong> – Tailor
                content and recommendations based on visitor behavior.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-neutral-100">
        <div className="bg-neutral-50 rounded-2xl p-2 border border-neutral-200 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          <textarea
            placeholder="Message SynthAI"
            className="w-full bg-transparent border-none resize-none text-sm px-2 py-1 focus:outline-none min-h-[40px] max-h-[100px]"
            rows={1}
          />
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-200/50 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-200/50 transition-colors">
                <Globe className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-200/50 transition-colors">
                <Mic className="h-4 w-4" />
              </button>
            </div>
            <button className="h-7 w-7 bg-black text-white rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-sm">
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
