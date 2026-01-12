
import React, { useState } from 'react';
import { Round, Game } from '../types';
import { ChevronDown, ChevronUp, User, Clock, Eye } from 'lucide-react';
import GameViewerModal from './GameViewerModal';

interface RoundsViewProps {
  rounds: Round[];
  primaryColor: string;
  secondaryColor?: string;
}

const RoundsView: React.FC<RoundsViewProps> = ({ rounds, primaryColor, secondaryColor }) => {
  const [expandedRounds, setExpandedRounds] = useState<number[]>(rounds.length > 0 ? [rounds[rounds.length - 1].number] : []);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const toggleRound = (num: number) => {
    setExpandedRounds(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  if (rounds.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Waiting for Pairings</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Tournament data is loading from the server. Check back soon for the latest results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Tournament Rounds</h2>
        <p className="text-gray-500">Official pairings and verified game results</p>
      </div>

      {rounds.map(round => (
        <div key={round.number} className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <button 
            onClick={() => toggleRound(round.number)}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <span 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {round.number}
              </span>
              <div className="text-left">
                <h3 className="font-bold text-lg text-gray-800">Round {round.number}</h3>
                <p className="text-sm text-gray-500">{round.games.length} Games played</p>
              </div>
            </div>
            {expandedRounds.includes(round.number) ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expandedRounds.includes(round.number) && (
            <div className="p-5 bg-gray-50 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
              {round.games.map((game, i) => (
                <GameCard 
                  key={i} 
                  game={game} 
                  primaryColor={primaryColor} 
                  onView={() => setSelectedGame(game)}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {selectedGame && (
        <GameViewerModal 
          game={selectedGame} 
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          onClose={() => setSelectedGame(null)} 
        />
      )}
    </div>
  );
};

const GameCard: React.FC<{ game: Game; primaryColor: string; onView: () => void }> = ({ game, primaryColor, onView }) => {
  const getResultBadge = (res: string, isWhite: boolean) => {
    if (res === '*') return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Scheduled</span>;
    if (res === '1/2-1/2') return <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Draw</span>;
    
    const whiteWon = res.startsWith('1-0');
    const blackWon = res.startsWith('0-1');
    const isBye = res.includes('Bye');

    if (isWhite) {
      if (whiteWon) return <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded font-bold">{isBye ? 'Bye' : 'Winner'}</span>;
      return <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Loss</span>;
    } else {
      if (blackWon) return <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded font-bold">{isBye ? 'Bye' : 'Winner'}</span>;
      return <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Loss</span>;
    }
  };

  const hasMoves = game.moves && game.moves.length > 0;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex flex-col space-y-3">
        {/* White Player */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <span className="font-semibold text-gray-800 truncate max-w-[120px]">{game.white}</span>
          </div>
          {getResultBadge(game.result, true)}
        </div>

        <div className="flex items-center justify-center">
            <div className="h-px bg-gray-100 w-full relative">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] text-gray-400 font-bold tracking-widest">VS</span>
            </div>
        </div>

        {/* Black Player */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <span className="font-semibold text-gray-800 truncate max-w-[120px]">{game.black}</span>
          </div>
          {getResultBadge(game.result, false)}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <div className="text-[10px] text-gray-400 truncate italic max-w-[60%]">
            {hasMoves ? `PGN: ${game.moves.substring(0, 30)}...` : 'No moves recorded'}
        </div>
        {hasMoves && (
            <button 
                onClick={(e) => { e.stopPropagation(); onView(); }}
                className="flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
            >
                <Eye className="w-3 h-3 mr-1.5" />
                Analyze
            </button>
        )}
      </div>
    </div>
  );
};

export default RoundsView;
