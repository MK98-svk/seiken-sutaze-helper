import { Navigate, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useTrainableMembers } from "@/hooks/useWorkouts";
import MemberProgress from "@/components/MemberProgress";

const CoachMemberDetail = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const { user, loading, isAdmin, isCoach } = useAuth();
  const { members } = useTrainableMembers();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin && !isCoach) return <Navigate to="/posilnovanie" replace />;

  const member = members.find((m) => m.id === memberId);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-8">
      <PageHeader
        title={member ? `${member.meno} ${member.priezvisko}` : "Cvičenec"}
        subtitle="Tréningy a progres"
        backTo="/posilnovanie/cvicenci"
      />
      <main className="max-w-3xl mx-auto px-3 py-4">
        {memberId && <MemberProgress memberId={memberId} />}
      </main>
    </div>
  );
};

export default CoachMemberDetail;
