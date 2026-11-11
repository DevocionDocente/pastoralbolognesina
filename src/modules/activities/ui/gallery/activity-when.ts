import { formatCalendarDay } from "@/shared/lib/format";

export function activityWhen(activity: { date: string | null; year: number }): string {
  return activity.date ? formatCalendarDay(activity.date) : String(activity.year);
}
