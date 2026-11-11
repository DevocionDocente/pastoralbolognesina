"use client";

import { useState } from "react";
import { FormField } from "@/shared/ui/form-field";
import { SelectField } from "@/shared/ui/select-field";
import { FIRST_ACTIVITY_YEAR, selectableYears } from "../../domain/activity-year";

interface ActivityDateFieldsProps {
  defaultDate: string | null;
  defaultYear: number | null;
}

export function ActivityDateFields({ defaultDate, defaultYear }: ActivityDateFieldsProps) {
  const [date, setDate] = useState(defaultDate ?? "");
  const years = selectableYears();
  const derivedYear = date ? date.slice(0, 4) : undefined;
  const options = years.map((year) => ({ value: String(year), label: String(year) }));

  return (
    <div className="grid grid-cols-[1fr_8rem] gap-3">
      <FormField
        name="date"
        type="date"
        label="Fecha (opcional)"
        min={`${FIRST_ACTIVITY_YEAR}-01-01`}
        max={`${years[0]}-12-31`}
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />
      <SelectField
        key={derivedYear ?? "manual"}
        name="year"
        label="Año"
        placeholder="Elige"
        options={options}
        defaultValue={derivedYear ?? defaultYear?.toString()}
        disabled={Boolean(derivedYear)}
        required={!derivedYear}
      />
    </div>
  );
}
