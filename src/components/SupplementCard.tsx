import { motion } from "framer-motion";
import { Supplement } from "@/hooks/useSupplements";

interface Props {
  product: Supplement;
  onOpen: (p: Supplement) => void;
}

const SupplementCard = ({ product, onOpen }: Props) => (
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onOpen(product)}
    className="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors overflow-hidden flex flex-col"
  >
    <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain p-2"
        />
      ) : (
        <span className="text-xs text-muted-foreground">bez obrázka</span>
      )}
    </div>
    <div className="p-2 sm:p-3 flex-1 flex flex-col gap-1">
      <div className="text-xs sm:text-sm font-medium leading-snug line-clamp-2">{product.name}</div>
      {product.subtitle && (
        <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{product.subtitle}</div>
      )}
      <div className="mt-auto pt-1 font-display text-base sm:text-lg text-primary">
        {product.price !== null ? `${product.price.toFixed(2)} €` : "—"}
      </div>
    </div>
  </motion.button>
);

export default SupplementCard;
