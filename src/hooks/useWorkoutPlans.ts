import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlannedItem } from "./useWorkouts";

const db = supabase as any;

export interface WorkoutPlan {
  id: string;
  memberId: string;
  name: string;
  mode: string;
  goal: string | null;
  items: PlannedItem[];
  createdAt: string;
}

const mapPlan = (r: any): WorkoutPlan => ({
  id: r.id,
  memberId: r.member_id,
  name: r.name,
  mode: r.mode,
  goal: r.goal,
  items: (r.plan?.items ?? []) as PlannedItem[],
  createdAt: r.created_at,
});

export function useWorkoutPlans(memberId?: string | null) {
  const qc = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["workout_plans", memberId ?? "all"],
    queryFn: async (): Promise<WorkoutPlan[]> => {
      let q = db.from("workout_plans").select("*").order("created_at", { ascending: false });
      if (memberId) q = q.eq("member_id", memberId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(mapPlan);
    },
  });

  const savePlan = async (input: { memberId: string; name: string; mode: string; goal: string | null; items: PlannedItem[] }) => {
    const { error } = await db.from("workout_plans").insert({
      member_id: input.memberId,
      name: input.name,
      mode: input.mode,
      goal: input.goal,
      config: { goal: input.goal, mode: input.mode },
      plan: { items: input.items },
    });
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["workout_plans"] });
  };

  const deletePlan = async (id: string) => {
    const { error } = await db.from("workout_plans").delete().eq("id", id);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["workout_plans"] });
  };

  return { plans, isLoading, savePlan, deletePlan };
}
