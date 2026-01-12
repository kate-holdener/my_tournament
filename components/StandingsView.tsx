
import React, { useState, useMemo } from 'react';
import { PlayerStanding } from '../types';
import { Search, Trophy, TrendingUp, Medal } from 'lucide-react';

interface StandingsViewProps {
  standings: PlayerStanding[];
  primaryColor: string;
}

const StandingsView: React.FC<StandingsViewProps> = ({ standings, primaryColor }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStandings = useMemo(() => {
    return standings.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [standings, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Standings</h2>
          <p className="text-gray-500">Real-time tournament rankings based on performance</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search player name..."
            className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl shadow-sm focus:ring-2 outline-none transition-all"
            // Fixed: Changed 'ringColor' (which is not a valid CSS property) to 'borderColor'
            style={{ borderColor: primaryColor }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Top 3 Podium (Optional, show if query is empty) */}
      {!searchQuery && standings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[standings[1], standings[0], standings[2]].map((player, i) => {
            const position = i === 1 ? 1 : (i === 0 ? 2 : 3);
            return (
              <div 
                key={player.name}
                className={`bg-white p-6 rounded-2xl shadow-sm border-t-4 text-center ${
                    position === 1 ? 'md:order-2 border-yellow-400 scale-105 z-10' : 
                    position === 2 ? 'md:order-1 border-gray-300' : 'md:order-3 border-orange-400'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      position === 1 ? 'bg-yellow-100 text-yellow-600' : 
                      position === 2 ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    <Medal className="w-8 h-8" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900">{player.name}</h4>
                <div className="mt-2 text-3xl font-black" style={{ color: primaryColor }}>{player.points} pts</div>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Rank #{position}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Standings Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4 text-center">Played</th>
                <th className="px-6 py-4 text-center">W</th>
                <th className="px-6 py-4 text-center">D</th>
                <th className="px-6 py-4 text-center">L</th>
                <th className="px-6 py-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStandings.map((player, index) => (
                <tr key={player.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'text-gray-500'
                    }`}>
                        {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">{player.played}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-green-600 font-medium">{player.wins}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-blue-600 font-medium">{player.draws}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-red-600 font-medium">{player.losses}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-black text-xl" style={{ color: primaryColor }}>
                    {player.points.toFixed(1)}
                  </td>
                </tr>
              ))}
              {filteredStandings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                    No players found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StandingsView;
