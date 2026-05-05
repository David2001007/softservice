import { DefaultModal } from "./default-modal";
import { DefaultButton } from "./default-button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Deletar?",
  description,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  return (
    <DefaultModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant="destructive"
      size="sm"
      footer={
        <>
          <DefaultButton
            variant="outline"
            className="rounded-xl flex-1 border-border/60 hover:bg-muted font-bold uppercase tracking-wider text-[11px]"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            label="Cancelar"
          />
          <DefaultButton
            variant="destructive"
            className="rounded-xl flex-1 font-bold uppercase tracking-wider text-[11px]"
            onClick={onConfirm}
            isLoading={isLoading}
            label="Deletar"
          />
        </>
      }
    >
      <div className="flex flex-col items-center py-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 w-full justify-center">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-[11px] font-bold uppercase tracking-widest">
            Ação Irreversível
          </p>
        </div>
      </div>
    </DefaultModal>
  );
}
