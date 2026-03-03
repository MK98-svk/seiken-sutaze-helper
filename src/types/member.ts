export interface Member {
  id: string;
  meno: string;
  priezvisko: string;
  stupen: string;
  datumNarodenia: string;
  vyska: number | null;
  vaha: number | null;
  kata: boolean;
  kobudo: boolean;
  kumite: boolean;
}

export interface Competition {
  id: string;
  nazov: string;
  datum: string;
}

export interface CompetitionEntry {
  memberId: string;
  competitionId: string;
  registered: boolean;
}
