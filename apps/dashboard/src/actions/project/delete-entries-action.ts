"use server";

import { action } from "@/actions/safe-action";
import { deleteEntriesSchema } from "@/actions/schema";
import { LogEvents } from "@midday/events/events";
import { setupAnalytics } from "@midday/events/server";
import { getUser } from "@midday/supabase/cached-queries";
import { createClient } from "@midday/supabase/server";
import { revalidateTag } from "next/cache";

export const deleteEntriesAction = action(
  deleteEntriesSchema,
  async (params) => {
    const supabase = createClient();
    const user = await getUser();

    await supabase.from("tracker_entries").delete().eq("id", params.id);

    revalidateTag(`tracker_projects_${user?.data?.team_id}`);
    revalidateTag(`tracker_entries_${user?.data?.team_id}`);

    const analytics = await setupAnalytics({
      userId: user?.data?.id,
      fullName: user?.data?.full_name,
    });

    analytics.track({
      event: LogEvents.TrackerDeleteEntry.name,
      channel: LogEvents.TrackerDeleteEntry.channel,
    });
  }
);
