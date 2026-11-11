import Link from "next/link";
import { BrandMark } from "@/shared/ui/brand-mark";
import { Button } from "@/shared/ui/button";

export function PublicHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <BrandMark href="/" />
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Acceso del personal</Link>
        </Button>
      </div>
    </header>
  );
}
