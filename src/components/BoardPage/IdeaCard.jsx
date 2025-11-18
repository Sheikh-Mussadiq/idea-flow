import { MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export const IdeaCard = ({ idea, onOpenComments, index }) => {
  return (
    <Card
      className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in border-neutral-200/60"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onOpenComments}
    >
      <div className="flex justify-between items-start mb-4 pr-20">
        <h3 className="text-xl font-semibold text-neutral-900">{idea.title}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments();
          }}
          className="text-neutral-600 hover:text-primary-500 hover:bg-neutral-100 transition-colors shrink-0"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-neutral-600 leading-relaxed">{idea.description}</p>
    </Card>
  );
};
