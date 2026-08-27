import { Youtube } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CatalogExercise, IMG, equipmentLabel, muscleLabel } from "@/lib/catalog";
import { useCatalog } from "@/hooks/useCatalog";
import { openExternal, youtubeSearch } from "@/lib/openExternal";

interface Props {
  exercise: CatalogExercise | null;
  onOpenChange: (open: boolean) => void;
  footer?: React.ReactNode;
}

const ExerciseDetailDialog = ({ exercise, onOpenChange, footer }: Props) => {
  const { catalog } = useCatalog();

  return (
    <Dialog open={!!exercise} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        {exercise && (
          <>
            <DialogHeader>
              <DialogTitle className="text-left">{exercise.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <img src={IMG(exercise.gif)} alt={exercise.name} className="w-full rounded-lg bg-white object-contain" />
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">{equipmentLabel(exercise.equipment)}</Badge>
                <Badge variant="outline">{muscleLabel(exercise.target)}</Badge>
                {catalog?.groupOf(exercise) && <Badge variant="outline">{catalog.groupOf(exercise)!.name}</Badge>}
              </div>
              {exercise.secondary.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Zapojené svaly</div>
                  <p>{exercise.secondary.map(muscleLabel).join(", ")}</p>
                </div>
              )}
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Ako to cvičiť</div>
                <ol className="list-decimal pl-5 space-y-1">
                  {(catalog?.steps(exercise) ?? exercise.steps).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 gap-1"
                  onClick={() => openExternal(youtubeSearch(exercise.name + " exercise technique"))}
                >
                  <Youtube className="h-4 w-4" /> Video
                </Button>
                {footer}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailDialog;
