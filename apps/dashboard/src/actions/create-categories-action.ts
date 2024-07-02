"use server";

import { LogEvents } from "@midday/events/events";
import { setupAnalytics } from "@midday/events/server";
import { getUser } from "@midday/supabase/cached-queries";
import { createClient } from "@midday/supabase/server";
import { revalidateTag } from "next/cache";
import { action } from "./safe-action";
import { createCategoriesSchema } from "./schema";

export const createCategoriesAction = action(
  createCategoriesSchema,
  async ({ categories }) => {
    const supabase = createClient();
    const user = await getUser();
    const teamId = user?.data?.team_id;

    const { data, error } = await supabase
      .from("transaction_categories")
      .insert(
        categories.map((category) => ({
          ...category,
          team_id: teamId,
        }))
      )
      .select("id, name, color, vat, slug");

    if (error) {
      throw Error(error.message);
    }

    revalidateTag(`transaction_categories_${teamId}`);

    const analytics = await setupAnalytics({
      userId: user.data.id,
      fullName: user.data.full_name,
    });

    analytics.track({
      event: LogEvents.CategoryCreate.name,
      channel: LogEvents.CategoryCreate.channel,
    });

    return data;
  }
);
