import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { RefreshCw, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useSupplements, Supplement } from "@/hooks/useSupplements";
import SupplementCard from "@/components/SupplementCard";
import SupplementDetailDialog from "@/components/SupplementDetailDialog";

type SortKey = "default" | "price-asc" | "price-desc" | "name";

const Supplements = () => {
  const { user, loading } = useAuth();
  const { products, categories, isLoading, isFetching, error, refetch } = useSupplements();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("default");
  const [detail, setDetail] = useState<Supplement | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => (map[p.category] = (map[p.category] ?? 0) + 1));
    return map;
  }, [products]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => (counts[c.id] ?? 0) > 0),
    [categories, counts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!q) return true;
      return `${p.name} ${p.subtitle}`.toLowerCase().includes(q);
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
    if (sort === "price-desc") list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "sk"));
    return list;
  }, [products, query, cat, sort]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  const sorts: { key: SortKey; label: string }[] = [
    { key: "default", label: "Odporúčané" },
    { key: "price-asc", label: "Najlacnejšie" },
    { key: "price-desc", label: "Najdrahšie" },
    { key: "name", label: "A–Z" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PageHeader
        title="Doplnky výživy"
        subtitle="Produkty zo Zdravého sveta"
        actions={
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()} title="Obnoviť">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      <main className="max-w-5xl mx-auto px-2 sm:px-4 py-3 sm:py-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hľadať produkt…"
            className="pl-9 h-10"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-2 px-2">
          <button
            onClick={() => setCat("all")}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              cat === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground"
            }`}
          >
            Všetko ({products.length})
          </button>
          {visibleCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                cat === c.id ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {c.label} ({counts[c.id]})
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-2 px-2">
          {sorts.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`shrink-0 rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors ${
                sort === s.key ? "border-primary text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Načítavam produkty…</div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm space-y-2">
            <div>Produkty sa nepodarilo načítať.</div>
            <div className="text-xs text-muted-foreground">{error.message}</div>
            <Button size="sm" onClick={() => refetch()}>Skúsiť znova</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 text-sm">Nič sa nenašlo.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {filtered.slice(0, limit).map((p, i) => (
              <SupplementCard key={p.id} product={p} onOpen={setDetail} eager={i < 4} />
            ))}
          </div>
        )}

        {!isLoading && !error && filtered.length > limit && (
          <div className="pt-2">
            <Button variant="outline" className="w-full h-11" onClick={() => setLimit((l) => l + 24)}>
              Zobraziť ďalšie ({filtered.length - limit})
            </Button>
          </div>
        )}
      </main>

      <SupplementDetailDialog product={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default Supplements;
