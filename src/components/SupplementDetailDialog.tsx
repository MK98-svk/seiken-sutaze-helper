import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Supplement, discountedPrice, DISCOUNT_CODE, DISCOUNT_PERCENT } from "@/hooks/useSupplements";
import { openExternal } from "@/lib/openExternal";

interface Props {
  product: Supplement | null;
  onClose: () => void;
}

const SupplementDetailDialog = ({ product, onClose }: Props) => (
  <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      {product && (
        <>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg pr-6 text-left">{product.name}</DialogTitle>
          </DialogHeader>

          {product.imageUrl && (
            <div className="rounded-lg bg-white/5 p-3 flex items-center justify-center">
              <img src={product.imageUrl} alt={product.name} className="max-h-56 object-contain" />
            </div>
          )}

          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-display text-2xl text-primary">
                {product.price !== null ? `${discountedPrice(product.price, product.discounted)?.toFixed(2)} €` : "—"}
              </span>
              {product.discounted && product.price !== null && (
                <span className="text-sm text-muted-foreground line-through">{product.price.toFixed(2)} €</span>
              )}
            </div>
            {product.manufacturer && (
              <div className="text-xs text-muted-foreground text-right">{product.manufacturer}</div>
            )}
          </div>

          {product.discounted ? (
            <div className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs">
              S kódom <span className="font-display tracking-widest text-primary">{DISCOUNT_CODE}</span> máš{" "}
              {DISCOUNT_PERCENT}% zľavu – uplatníš ju pri objednávke na zdravysvet.sk.
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Tento produkt nie je súčasťou klubovej zľavy.</div>
          )}

          {product.subtitle && <p className="text-sm text-muted-foreground">{product.subtitle}</p>}

          {product.description && (
            <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
          )}

          <Button className="w-full h-11" onClick={() => openExternal(product.url)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Kúpiť na zdravysvet.sk
          </Button>
        </>
      )}
    </DialogContent>
  </Dialog>
);

export default SupplementDetailDialog;
