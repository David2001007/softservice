import * as React from "react"
import { XIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "#/lib/utils"

const sizeClasses = {
  sm: "w-[90vw] max-w-none md:w-[68vw] lg:w-[36vw] lg:max-w-[26rem]",
  md: "w-[90vw] max-w-none md:w-[72vw] lg:w-[42vw] lg:max-w-[32rem]",
  lg: "w-[92vw] max-w-none md:w-[76vw] lg:w-[48vw] lg:max-w-[40rem]",
  xl: "w-[94vw] max-w-none md:w-[82vw] lg:w-[54vw] lg:max-w-[48rem]",
}

interface DefaultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose?: () => void
  title: string
  description?: string
  variant?: "default" | "destructive"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function DefaultModal({
  open,
  onOpenChange,
  onClose,
  title,
  description,
  variant = "default",
  size = "md",
  className,
  children,
  footer,
}: DefaultModalProps) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && onClose) {
      onClose();
    }
    onOpenChange(isOpen);
  };

  const colorBarClass = variant === "destructive"
    ? "bg-destructive"
    : "bg-vision-residuos"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[calc(100dvh-1rem)] flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-sm sm:max-h-[calc(100dvh-2rem)]",
          sizeClasses[size],
          className
        )}
        showCloseButton={false}
      >
        {/* Color bar */}
        <div className={cn("h-1.5 w-full", colorBarClass)} />

        {/* Close button */}
        <button
          type="button"
          className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => onOpenChange(false)}
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="shrink-0 border-b border-border/60 p-6 pb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground font-medium">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-6 py-4 pb-6">
            {children}
          </div>
        </div>

        {footer && (
          <DialogFooter className="shrink-0 border-t border-border/60 p-6">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
