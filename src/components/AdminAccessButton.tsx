import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPasswordDialog } from "./AdminPasswordDialog";

export const AdminAccessButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 opacity-30 hover:opacity-100 transition-opacity"
        onClick={() => setDialogOpen(true)}
        title="Acesso Admin"
      >
        <Settings className="h-5 w-5" />
      </Button>

      <AdminPasswordDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};
