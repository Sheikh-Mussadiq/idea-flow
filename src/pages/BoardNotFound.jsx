import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

const BoardNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <FileQuestion className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
          Board Not Found
        </h1>

        {/* Description */}
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
          The board you're looking for doesn't exist or may have been deleted.
          Try going back or return to the dashboard.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BoardNotFound;
