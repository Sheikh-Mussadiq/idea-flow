import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { IdeaBoardLayout } from "../layouts/IdeaBoardLayout";

const BoardPage = ({ initialView = "flow" }) => {
  return (
    <AppLayout>
      <ReactFlowProvider>
        <IdeaBoardLayout initialView={initialView} />
      </ReactFlowProvider>
    </AppLayout>
  );
};

export default BoardPage;
