import { Table2 } from "lucide-react";

export const TableView = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50">
      <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Table2 className="h-8 w-8 text-neutral-300" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">Table View</h3>
      <p className="text-sm max-w-xs text-center">
        This view is coming soon. You'll be able to view your ideas in a structured table format.
      </p>
    </div>
  );
};
