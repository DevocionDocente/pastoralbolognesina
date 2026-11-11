import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface SelectFieldProps {
  name: string;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SelectField({ name, label, placeholder, options, defaultValue, required, disabled }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={defaultValue} required={required} disabled={disabled}>
        <SelectTrigger id={name} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
