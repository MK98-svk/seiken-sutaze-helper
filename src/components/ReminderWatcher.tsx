import { useEffect } from "react";
import { toast } from "sonner";
import { checkReminder } from "@/lib/notifications";

/** Kontroluje pripomienky tréningu, kým je aplikácia otvorená. */
export default function ReminderWatcher() {
  useEffect(() => {
    const run = () => {
      if (checkReminder()) toast("Čas na tréning 🥋", { description: "Podľa tvojho plánu je teraz čas cvičiť." });
    };
    run();
    const t = setInterval(run, 60 * 1000);
    const onVisible = () => document.visibilityState === "visible" && run();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
