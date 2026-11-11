import { ManualMark } from "./manual-mark";

export function ProfileText({ label, text, manual }: { label: string; text: string | null; manual: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {label}
        {manual && <ManualMark />}
      </h3>
      <p className="text-sm leading-relaxed">{text ?? "Pendiente"}</p>
    </div>
  );
}
