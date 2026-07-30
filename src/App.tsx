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
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sutaze" element={<Index />} />
          <Route path="/posilnovanie" element={<Strength />} />
          <Route path="/posilnovanie/ai" element={<WorkoutAI />} />
          <Route path="/posilnovanie/vysledky" element={<WorkoutResults />} />
          <Route path="/posilnovanie/trening/:id" element={<WorkoutSession />} />
          <Route path="/posilnovanie/:mode" element={<StrengthMode />} />
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
