import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import MemberPicker from "@/components/MemberPicker";
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
            <MemberPicker members={selectable} value={memberId} onChange={setMemberId} label="Pre koho" />

            {memberId && <MemberProgress memberId={memberId} />}
          </>
        )}
      </main>
    </div>
  );
};

export default WorkoutProgress;
