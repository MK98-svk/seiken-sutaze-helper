import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { listenForForegroundPush, refreshPushRegistration } from "@/lib/push";

/** Udržiava token telefónu platný aj po aktualizácii aplikácie alebo service workera. */
export default function PushRegistrationManager() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const refresh = () => {
      if (document.visibilityState === "visible") void refreshPushRegistration();
    };

    void refreshPushRegistration();
    const stopListening = listenForForegroundPush((title, body) => toast(title, { description: body }));
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("online", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("online", refresh);
      stopListening();
    };
  }, [user]);

  return null;
}