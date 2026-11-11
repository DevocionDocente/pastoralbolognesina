import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

interface BrandMarkProps {
  href?: string;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
}

export function BrandMark({ href, className, iconClassName, labelClassName }: BrandMarkProps) {
  const content = (
    <>
      <Image src="/brand/logo.webp" alt="" width={320} height={442} className={cn("h-10 w-auto shrink-0", iconClassName)} priority />
      <span className={cn("font-heading text-lg leading-tight font-semibold", labelClassName)}>Pastoral Bolognesina</span>
    </>
  );
  const classes = cn("flex items-center gap-2.5", className);
  return href ? <Link href={href} className={classes}>{content}</Link> : <span className={classes}>{content}</span>;
}
