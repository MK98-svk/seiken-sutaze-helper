import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { refreshPushRegistration } from "@/lib/push";

/** Udržiava token telefónu platný aj po aktualizácii aplikácie alebo service workera. */
export default function PushRegistrationManager() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const refresh = () => {
      if (document.visibilityState === "visible") void refreshPushRegistration();
    };

    void refreshPushRegistration();
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("online", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [user]);

  return null;
}