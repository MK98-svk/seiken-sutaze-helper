export interface Member {
  id: string;
  meno: string;
  priezvisko: string;
  stupen: string;
  datumNarodenia: string;
  pohlavie: string | null;
  vyska: number | null;
  vaha: number | null;
  kata: boolean;
  kobudo: boolean;
  kumite: boolean;
  zlato: number;
  striebro: number;
  bronz: number;
  userId: string | null;
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
