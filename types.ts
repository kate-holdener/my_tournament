
export interface Game {
  id: string;
  white: string;
  black: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*' | '1-0 (Bye)' | '0-1 (Bye)';
  pgn: string;
  round: number;
  moves: string;
  date?: string;
}

export interface Round {
  number: number;
  games: Game[];
}

export interface PlayerStanding {
  name: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface TournamentConfig {
  name: string;
  primaryColor: string;
  secondaryColor?: string;
  logoUrl?: string;
  sponsorName?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  type?: string;
  prizes?: string[];
  tournamentRepo?: string;
  rounds: string[];
}

export type ViewType = 'rounds' | 'standings' | 'setup';
