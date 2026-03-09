import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import seikenLogo from "@/assets/seiken-logo.jpg";

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (forgotMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) toast.error(error.message);
      else toast.success("Odkaz na reset hesla bol odoslaný na váš email.");
      setSubmitting(false);
      return;
    }
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
    } else {
      const { error } = await signUp(email, password);
      if (error) toast.error(error.message);
      else toast.success("Registrácia úspešná! Skontrolujte email pre overenie.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <img src={seikenLogo} alt="KK SEIKEN logo" className="mx-auto mb-3 h-16 w-16 rounded-xl object-cover ring-1 ring-primary/30" />
            <CardTitle className="font-display text-xl">{forgotMode ? "Reset hesla" : isLogin ? "Prihlásenie" : "Registrácia"}</CardTitle>
            <p className="text-xs text-muted-foreground">KK SEIKEN • Checklist súťaží</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {!forgotMode && (
                <div className="space-y-1.5">
                  <Label>Heslo</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Čakajte…" : forgotMode ? "Odoslať odkaz" : isLogin ? "Prihlásiť sa" : "Zaregistrovať sa"}
              </Button>
            </form>
            {isLogin && !forgotMode && (
              <button
                onClick={() => setForgotMode(true)}
                className="mt-2 text-xs text-muted-foreground hover:text-primary transition-colors w-full text-center"
              >
                Zabudnuté heslo?
              </button>
            )}
            <button
              onClick={() => { setForgotMode(false); setIsLogin(!isLogin); }}
              className="mt-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-center"
            >
              {forgotMode ? "Späť na prihlásenie" : isLogin ? "Nemáte účet? Zaregistrujte sa" : "Už máte účet? Prihláste sa"}
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
