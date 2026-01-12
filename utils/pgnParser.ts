
import { Chess } from 'chess.js';
import { Game, PlayerStanding } from '../types';

/**
 * Splits a PGN string containing multiple games into individual game blocks.
 */
export const splitPgnGames = (pgn: string): string[] => {
  // PGN games are typically separated by double newlines followed by a tag bracket
  return pgn
    .split(/\n\s*\n(?=\[)/)
    .map(g => g.trim())
    .filter(g => g.length > 0);
};

/**
 * Parses a single PGN game block.
 */
export const parseSingleGame = (pgn: string, roundNumber: number): Game => {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch (e) {
    console.error("Error parsing PGN", e);
  }

  const header = chess.header();
  
  return {
    id: `${roundNumber}-${header.White}-${header.Black}-${Date.now()}`,
    white: header.White || 'Unknown',
    black: header.Black || 'Unknown',
    result: (header.Result as any) || '*',
    pgn: pgn,
    round: roundNumber,
    moves: chess.history().join(' '),
    date: header.Date
  };
};

/**
 * Calculates player standings from a list of games.
 */
export const calculateStandings = (games: Game[]): PlayerStanding[] => {
  const standingsMap: Record<string, PlayerStanding> = {};

  const getOrInitPlayer = (name: string): PlayerStanding => {
    if (!standingsMap[name]) {
      standingsMap[name] = { name, points: 0, played: 0, wins: 0, draws: 0, losses: 0 };
    }
    return standingsMap[name];
  };

  games.forEach(game => {
    const white = getOrInitPlayer(game.white);
    const black = getOrInitPlayer(game.black);

    const isBye = game.result.includes('Bye');

    if (!isBye) {
        white.played += 1;
        black.played += 1;
    }

    if (game.result === '1-0' || game.result === '1-0 (Bye)') {
      white.points += 1;
      white.wins += 1;
      black.losses += 1;
    } else if (game.result === '0-1' || game.result === '0-1 (Bye)') {
      black.points += 1;
      black.wins += 1;
      white.losses += 1;
    } else if (game.result === '1/2-1/2') {
      white.points += 0.5;
      black.points += 0.5;
      white.draws += 1;
      black.draws += 1;
    }
  });

  return Object.values(standingsMap).sort((a, b) => b.points - a.points || b.wins - a.wins);
};
