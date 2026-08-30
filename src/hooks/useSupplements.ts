import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Supplement = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  url: string;
  price: number | null;
  manufacturer: string;
  ean: string;
  category: string;
};

export type SupplementCategory = { id: string; label: string };

type FeedResponse = { products: Supplement[]; categories: SupplementCategory[] };

export function useSupplements() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["supplements-feed"],
    queryFn: async (): Promise<FeedResponse> => {
      const { data, error } = await supabase.functions.invoke("nutrition-feed", { body: {} });
      if (error) throw new Error(error.message);
      if (!data || (data as { error?: string }).error) {
        throw new Error((data as { error?: string })?.error ?? "Nepodarilo sa načítať produkty");
      }
      return data as FeedResponse;
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    products: data?.products ?? [],
    categories: data?.categories ?? [],
    isLoading,
    isFetching,
    error: error as Error | null,
    refetch,
  };
}
