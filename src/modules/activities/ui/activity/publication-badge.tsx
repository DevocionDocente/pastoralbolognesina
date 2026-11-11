import { Badge } from "@/shared/ui/badge";

export function PublicationBadge({ published }: { published: boolean }) {
  return <Badge variant={published ? "default" : "outline"}>{published ? "Publicada" : "Oculta"}</Badge>;
}
