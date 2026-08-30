import { memo } from "react";
import { Supplement } from "@/hooks/useSupplements";

interface Props {
  product: Supplement;
  onOpen: (p: Supplement) => void;
  eager?: boolean;
}

const SupplementCard = ({ product, onOpen, eager }: Props) => (
  <button
    type="button"
    onClick={() => onOpen(product)}
    className="text-left rounded-xl border border-border bg-card hover:border-primary/60 active:scale-[0.98] transition-[transform,border-color] overflow-hidden flex flex-col min-w-0"
  >
    <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          width={300}
          height={300}
          className="h-full w-full object-contain p-2"
        />
      ) : (
        <span className="text-xs text-muted-foreground">bez obrázka</span>
      )}
    </div>
    <div className="p-2 sm:p-3 flex-1 flex flex-col gap-1 min-w-0">
      <div className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 break-words">{product.name}</div>
      {product.subtitle && (
        <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 break-words">{product.subtitle}</div>
      )}
      <div className="mt-auto pt-1 font-display text-base sm:text-lg text-primary">
        {product.price !== null ? `${product.price.toFixed(2)} €` : "—"}
      </div>
    </div>
  </button>
);

export default memo(SupplementCard);
