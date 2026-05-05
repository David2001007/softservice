import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DefaultCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  accentColor?: string;
  iconColor?: string;
  children: ReactNode;
  className?: string;
}

export function DefaultCard({
  title,
  description,
  icon: Icon,
  accentColor = "bg-vision-residuos",
  iconColor = "text-vision-residuos",
  children,
  className,
}: DefaultCardProps) {
  return (
    <Card className={`border-border bg-card shadow-sm rounded-xl overflow-hidden pt-0 ${className ?? ""}`}>
      <div className={`h-1.5 w-full ${accentColor}`} />
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
}
