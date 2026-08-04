import { useQuery } from "@tanstack/react-query";
import { Catalog, CatalogExercise } from "@/lib/catalog";

async function loadCatalog(): Promise<Catalog> {
  const [exRes, skRes] = await Promise.all([fetch("/data/exercises.json"), fetch("/data/instructions_sk.json")]);
  if (!exRes.ok || !skRes.ok) throw new Error("Nepodarilo sa načítať katalóg cvikov");
  const exercises = (await exRes.json()) as CatalogExercise[];
  const sk = (await skRes.json()) as Record<string, string[]>;
  return new Catalog(exercises, sk);
}

export function useCatalog() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["exercise-catalog"],
    queryFn: loadCatalog,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return { catalog: data ?? null, isLoading, error };
}
