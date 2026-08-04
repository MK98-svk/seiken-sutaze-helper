import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useTrainableMembers } from "@/hooks/useWorkouts";
import MemberProgress from "@/components/MemberProgress";

const WorkoutProgress = () => {
  const { user, loading } = useAuth();
  const { selectable, isLoading } = useTrainableMembers();
  const [memberId, setMemberId] = useState("");

  useEffect(() => {
    if (!memberId && selectable.length > 0) setMemberId(selectable[0].id);
  }, [selectable, memberId]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-8">
      <PageHeader title="Progres" subtitle="Grafy váh, objemu a rekordov" backTo="/posilnovanie" />

      <main className="max-w-3xl mx-auto px-3 py-4 space-y-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Načítavam…</div>
        ) : selectable.length === 0 ? (
          <div className="text-sm text-muted-foreground">K tvojmu účtu nie je priradený žiadny pretekár.</div>
        ) : (
          <>
            {selectable.length > 1 && (
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger><SelectValue placeholder="Vyber pretekára" /></SelectTrigger>
                <SelectContent>
                  {selectable.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.meno} {m.priezvisko}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {memberId && <MemberProgress memberId={memberId} />}
          </>
        )}
      </main>
    </div>
  );
};

export default WorkoutProgress;
