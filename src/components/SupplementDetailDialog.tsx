import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Supplement } from "@/hooks/useSupplements";
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

          <div className="flex items-center justify-between gap-2">
            <div className="font-display text-2xl text-primary">
              {product.price !== null ? `${product.price.toFixed(2)} €` : "—"}
            </div>
            {product.manufacturer && (
              <div className="text-xs text-muted-foreground text-right">{product.manufacturer}</div>
            )}
          </div>

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
