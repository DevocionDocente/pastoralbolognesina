import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

export function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <Avatar className="size-8">
      <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initials}</AvatarFallback>
    </Avatar>
  );
}
