import type { ComponentProps } from "react";
import { Input } from "./input";
import { Label } from "./label";

interface FormFieldProps extends ComponentProps<typeof Input> {
  name: string;
  label: string;
}

export function FormField({ name, label, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...inputProps} />
    </div>
  );
}
