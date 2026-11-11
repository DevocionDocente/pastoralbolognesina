import type { ComponentProps } from "react";
import { Label } from "./label";
import { Textarea } from "./textarea";

interface TextareaFieldProps extends ComponentProps<typeof Textarea> {
  name: string;
  label: string;
}

export function TextareaField({ name, label, ...textareaProps }: TextareaFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} {...textareaProps} />
    </div>
  );
}
