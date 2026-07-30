import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import seikenLogo from "@/assets/seiken-logo.jpg";

interface Props {
  title: string;
  subtitle?: string;
  backTo?: string;
  actions?: ReactNode;
}

const PageHeader = ({ title, subtitle, backTo = "/", actions }: Props) => {
  const navigate = useNavigate();
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(backTo)} title="Späť">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img src={seikenLogo} alt="KK SEIKEN logo" className="h-8 w-8 rounded-lg object-cover ring-1 ring-primary/30 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-display font-bold tracking-wider text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">{actions}</div>
      </div>
    </header>
  );
};

export default PageHeader;
