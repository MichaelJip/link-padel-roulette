import { createClient } from "./client";

export interface LotteryItem {
  id: number;
  name: string;
  code: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchLotteryItems(): Promise<LotteryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lottery")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching lottery items:", error);
    return [];
  }

  return data || [];
}

export async function insertLotteryItems(
  items: { name: string; code?: string }[]
): Promise<LotteryItem[]> {
  const supabase = createClient();

  // Clear existing items first
  await supabase.from("lottery").delete().neq("id", 0);

  // Insert new items
  const { data, error } = await supabase
    .from("lottery")
    .insert(items.map((item) => ({ name: item.name, code: item.code || null })))
    .select();

  if (error) {
    console.error("Error inserting lottery items:", error);
    return [];
  }

  return data || [];
}

export async function deleteLotteryItem(id: number): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("lottery").delete().eq("id", id);

  if (error) {
    console.error("Error deleting lottery item:", error);
    return false;
  }

  return true;
}

export async function deleteAllLotteryItems(): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("lottery").delete().neq("id", 0);

  if (error) {
    console.error("Error deleting all lottery items:", error);
    return false;
  }

  return true;
}
