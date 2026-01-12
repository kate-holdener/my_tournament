
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Trophy, Users, LayoutDashboard, Settings, ChevronRight, Menu, Loader2 } from 'lucide-react';
import { Round, TournamentConfig, ViewType } from './types';
import { splitPgnGames, parseSingleGame, calculateStandings } from './utils/pgnParser';
import RoundsView from './components/RoundsView';
import StandingsView from './components/StandingsView';
import SetupWizard from './components/SetupWizard';
import localConfig from './config/tournament-config.json';

const NavItem = ({ 
  icon: Icon, 
  label, 
  to, 
  setIsSidebarOpen 
}: { 
  icon: any, 
  label: string, 
  to: string,
  setIsSidebarOpen: (v: boolean) => void 
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={() => setIsSidebarOpen(false)}
      className={`flex items-center w-full p-4 transition-colors ${
        isActive 
          ? 'text-white border-l-4' 
          : 'text-white hover:bg-white hover:bg-opacity-10'
      }`}
      style={isActive ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderLeftColor: '#fff' } : {}}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{label}</span>
      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
    </Link>
  );
};

const AppLayout: React.FC<{
  config: TournamentConfig;
  rounds: Round[];
  standings: any; 
}> = ({ config, rounds, standings }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 shadow-xl transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      style={{ backgroundColor: config.primaryColor }}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center space-x-3 mb-6">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: config.primaryColor }}
              >
                <Trophy className="w-6 h-6" />
              </div>
              <h1 className="text-lg font-bold text-white leading-tight">{config.name}</h1>
            </div>
            
            {config.logoUrl && (
              <div className="flex justify-center mb-4 bg-white/5 p-3 rounded-lg">
                <img src={config.logoUrl} alt="Sponsor" className="h-10 object-contain rounded" />
              </div>
            )}
          </div>

          <nav className="flex-1 mt-4">
            <NavItem icon={Settings} label="Tournament Info" to="/setup" setIsSidebarOpen={setIsSidebarOpen} />
            <NavItem icon={LayoutDashboard} label="Tournament Rounds" to="/rounds" setIsSidebarOpen={setIsSidebarOpen} />
            <NavItem icon={Users} label="Current Standings" to="/standings" setIsSidebarOpen={setIsSidebarOpen} />
          </nav>

          <div className="p-4 m-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <p className="text-xs mb-1 uppercase tracking-wider font-semibold" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Organized by</p>
            <p className="text-sm font-medium truncate text-white">{config.sponsorName || "Anonymous"}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b lg:hidden">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6" style={{ color: config.primaryColor }} />
            <span className="font-bold text-lg truncate">{config.name}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/setup" replace />} />
              <Route path="/setup" element={
                <SetupWizard 
                  config={config} 
                  hasData={rounds.length > 0}
                />
              } />
              <Route path="/rounds" element={
                <RoundsView 
                  rounds={rounds} 
                  primaryColor={config.primaryColor}
                  secondaryColor={config.secondaryColor}
                />
              } />
              <Route path="/standings" element={
                <StandingsView 
                  standings={standings} 
                  primaryColor={config.primaryColor} 
                />
              } />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [config, setConfig] = useState<TournamentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTournamentData = async () => {
      try {
        setLoading(true);
        
        // Use the imported local config directly
        const configData = localConfig as unknown as TournamentConfig;
        setConfig(configData);

        // 2. Fetch each PGN round from GitHub API (Data Branch)
        if (configData && configData.rounds && configData.tournamentRepo) {
          const loadedRounds: Round[] = [];
          
          for (const filename of configData.rounds) {
            // Using GitHub API to fetch raw content from the 'data' branch
            // Headers: Accept: application/vnd.github.v3.raw
            // Add timestamp to prevent caching
            const apiUrl = `https://api.github.com/repos/${configData.tournamentRepo}/contents/data/${filename}?ref=data&t=${new Date().getTime()}`;
            
            try {
              const roundRes = await fetch(apiUrl, {
                headers: {
                  'Accept': 'application/vnd.github.v3.raw'
                },
                cache: 'no-store'
              });
              
              const roundMatch = filename.match(/round(\d+)/i);
              const roundNumber = roundMatch ? parseInt(roundMatch[1]) : loadedRounds.length + 1;
              
              if (roundRes.ok) {
                const content = await roundRes.text();
                
                const gameBlocks = splitPgnGames(content);
                const parsedGames = gameBlocks.map(block => parseSingleGame(block, roundNumber));
                
                loadedRounds.push({
                  number: roundNumber,
                  games: parsedGames
                });
              } else {
                console.warn(`Could not load round ${roundNumber} from GitHub API: ${roundRes.statusText}`);
                loadedRounds.push({
                  number: roundNumber,
                  games: []
                });
              }
            } catch (e) {
               console.warn(`Error fetching round ${filename}`, e);
            }
          }
          
          // Use order from config file
          setRounds(loadedRounds);
        } else if (!configData.tournamentRepo) {
             setError("Tournament repository is not configured in tournament-config.json");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTournamentData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading Tournament Dashboard...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 max-w-md">
          <h2 className="text-xl font-bold mb-2">Initialization Error</h2>
          <p className="mb-4">{error || 'Could not find configuration files.'}</p>
          <p className="text-sm opacity-75">Ensure <b>config/tournament-config.json</b> exists in your project root.</p>
        </div>
      </div>
    );
  }

  const standings = calculateStandings(rounds.flatMap(r => r.games));

  return (
    <HashRouter>
      <AppLayout config={config} rounds={rounds} standings={standings} />
    </HashRouter>
  );
};
export default App;
