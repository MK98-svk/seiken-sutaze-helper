import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Strength from "./pages/Strength";
import StrengthMode from "./pages/StrengthMode";
import WorkoutAI from "./pages/WorkoutAI";
import WorkoutSession from "./pages/WorkoutSession";
import WorkoutResults from "./pages/WorkoutResults";
import WorkoutPlans from "./pages/WorkoutPlans";
import WorkoutProgress from "./pages/WorkoutProgress";
import CoachMembers from "./pages/CoachMembers";
import CoachMemberDetail from "./pages/CoachMemberDetail";
import Supplements from "./pages/Supplements";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import NotificationSettings from "./pages/NotificationSettings";
import ReminderWatcher from "./components/ReminderWatcher";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ReminderWatcher />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sutaze" element={<Index />} />
          <Route path="/posilnovanie" element={<Strength />} />
          <Route path="/posilnovanie/ai" element={<WorkoutAI />} />
          <Route path="/posilnovanie/plany" element={<WorkoutPlans />} />
          <Route path="/posilnovanie/progres" element={<WorkoutProgress />} />
          <Route path="/posilnovanie/cvicenci" element={<CoachMembers />} />
          <Route path="/posilnovanie/cvicenci/:memberId" element={<CoachMemberDetail />} />
          <Route path="/posilnovanie/vysledky" element={<WorkoutResults />} />
          <Route path="/posilnovanie/notifikacie" element={<NotificationSettings />} />
          <Route path="/posilnovanie/trening/:id" element={<WorkoutSession />} />
          <Route path="/posilnovanie/:mode" element={<StrengthMode />} />

          <Route path="/doplnky" element={<Supplements />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
