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

const LS_KEY = "supplements-feed-v2";
const LS_TTL = 24 * 60 * 60 * 1000;

function readCache(): FeedResponse | undefined {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { at: number; data: FeedResponse };
    if (!parsed?.data?.products?.length) return undefined;
    if (Date.now() - parsed.at > LS_TTL) return undefined;
    return parsed.data;
  } catch {
    return undefined;
  }
}

function writeCache(data: FeedResponse) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* quota – ignoruj */
  }
}

export function useSupplements() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["supplements-feed"],
    queryFn: async (): Promise<FeedResponse> => {
      const { data, error } = await supabase.functions.invoke("nutrition-feed", { body: {} });
      if (error) throw new Error(error.message);
      if (!data || (data as { error?: string }).error) {
        throw new Error((data as { error?: string })?.error ?? "Nepodarilo sa načítať produkty");
      }
      writeCache(data as FeedResponse);
      return data as FeedResponse;
    },
    initialData: readCache,
    staleTime: 60 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
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
