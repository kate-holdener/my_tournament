
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Info } from 'lucide-react';
import { Game } from '../types';

interface GameViewerModalProps {
  game: Game;
  primaryColor: string;
  secondaryColor?: string;
  onClose: () => void;
}

const GameViewerModal: React.FC<GameViewerModalProps> = ({ game, primaryColor, secondaryColor, onClose }) => {
  const chess = useMemo(() => new Chess(), []);
  const [moveIndex, setMoveIndex] = useState(0);
  
  // Parse full history
  const history = useMemo(() => {
    try {
      chess.loadPgn(game.pgn);
      return chess.history();
    } catch (e) {
      console.error("PGN load failed", e);
      return [];
    }
  }, [game.pgn, chess]);

  // Calculate current board position
  const currentFen = useMemo(() => {
    const tempChess = new Chess();
    for (let i = 0; i < moveIndex; i++) {
      tempChess.move(history[i]);
    }
    return tempChess.fen();
  }, [moveIndex, history]);

  const goToMove = useCallback((index: number) => {
    setMoveIndex(Math.max(0, Math.min(index, history.length)));
  }, [history.length]);

  // Scroll active move into view
  const moveListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (moveListRef.current && moveIndex > 0) {
      const activeElement = moveListRef.current.querySelector(`[data-move-index="${moveIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [moveIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToMove(moveIndex + 1);
      if (e.key === 'ArrowLeft') goToMove(moveIndex - 1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveIndex, goToMove, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {game.white} vs {game.black}
            </h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono">{game.result}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 lg:flex overflow-hidden flex flex-col lg:flex-row">
          {/* Board Section */}
          <div className="p-4 lg:p-6 flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 border-b lg:border-b-0 lg:flex-1 lg:overflow-y-auto">
             <div className="w-full max-w-[500px] shadow-xl rounded-lg overflow-visible border-8 border-white">
                <Chessboard 
                  position={currentFen} 
                  boardOrientation="white"
                  showBoardNotation={true}
                />
             </div>
             
             {/* Simple Player Tags for Board */}
             <div className="mt-2 w-full max-w-[500px] flex justify-between text-sm font-medium text-gray-500 px-2">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div>
                    <span>{game.white}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-black rounded-sm"></div>
                    <span>{game.black}</span>
                </div>
             </div>
          </div>

          {/* Controls & Moves Section */}
          <div className="w-full lg:w-96 border-l flex flex-col bg-white overflow-hidden flex-1 lg:flex-none">
            <div className="p-4 border-b">
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => goToMove(0)}
                  disabled={moveIndex === 0}
                  className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => goToMove(moveIndex - 1)}
                  disabled={moveIndex === 0}
                  className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => goToMove(moveIndex + 1)}
                  disabled={moveIndex === history.length}
                  className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => goToMove(history.length)}
                  disabled={moveIndex === history.length}
                  className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Move List */}
            <div ref={moveListRef} className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                  <React.Fragment key={i}>
                    {/* White's move */}
                    <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-gray-400 font-mono w-4">{i + 1}.</span>
                        <button 
                            data-move-index={i * 2 + 1}
                            onClick={() => goToMove(i * 2 + 1)}
                            className={`flex-1 text-left px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                                moveIndex === (i * 2 + 1) 
                                ? 'text-white shadow-sm' 
                                : 'text-gray-700 hover:bg-white hover:shadow-sm'
                            }`}
                            style={moveIndex === (i * 2 + 1) ? { backgroundColor: secondaryColor || primaryColor } : {}}
                        >
                            {history[i * 2]}
                        </button>
                    </div>
                    {/* Black's move (if exists) */}
                    {history[i * 2 + 1] && (
                        <div className="flex items-center">
                            <button 
                                data-move-index={i * 2 + 2}
                                onClick={() => goToMove(i * 2 + 2)}
                                className={`flex-1 text-left px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                                    moveIndex === (i * 2 + 2) 
                                    ? 'text-white shadow-sm' 
                                    : 'text-gray-700 hover:bg-white hover:shadow-sm'
                                }`}
                                style={moveIndex === (i * 2 + 2) ? { backgroundColor: secondaryColor || primaryColor } : {}}
                            >
                                {history[i * 2 + 1]}
                            </button>
                        </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="p-4 bg-gray-50 border-t">
               <div className="flex items-center text-xs text-gray-500 space-x-2">
                  <Info className="w-4 h-4" />
                  <span>Use arrow keys to navigate.</span>
               </div>
               <div className="mt-2 text-xs font-mono text-gray-400 break-all leading-tight">
                  {game.pgn.substring(0, 100)}...
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameViewerModal;
