"use client";

import type { ActivityVirtueDto } from "../../http/profile-schemas";
import { VirtueButtons } from "../gallery/virtue-buttons";
import { VirtueImageActions } from "./virtue-image-actions";

export function EditableVirtueButtons({ activityId, virtues }: { activityId: string; virtues: ActivityVirtueDto[] }) {
  return <VirtueButtons virtues={virtues} actions={(virtue) => <VirtueImageActions activityId={activityId} virtue={virtue} />} />;
}
