
import React from 'react';
import { TournamentConfig } from '../types';
import { Info, ExternalLink, ShieldCheck, Globe, Calendar, MapPin, Trophy, Swords } from 'lucide-react';

interface SetupWizardProps {
  config: TournamentConfig;
  hasData: boolean;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ config, hasData }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-gray-900 mb-2">Tournament Information</h2>
        <p className="text-gray-500 text-lg">Official configuration and event details</p>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 bg-gray-50 border-b flex items-center space-x-2">
          <Info className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold text-gray-700">Event Details</h3>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Name</label>
              <p className="text-xl font-bold text-gray-800">{config.name}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Primary Sponsor</label>
              <p className="text-xl font-bold text-gray-800">{config.sponsorName || "Unspecified"}</p>
            </div>
            {config.location && (
              <div className="flex items-start space-x-3">
                 <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Location</label>
                    <p className="text-lg font-medium text-gray-800">{config.location}</p>
                 </div>
              </div>
            )}
            {(config.startDate || config.endDate) && (
              <div className="flex items-start space-x-3">
                 <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Date</label>
                    <p className="text-lg font-medium text-gray-800">
                      {config.startDate} {config.endDate && `— ${config.endDate}`}
                    </p>
                 </div>
              </div>
            )}
            {config.type && (
               <div className="flex items-start space-x-3">
                 <Swords className="w-5 h-5 text-gray-400 mt-1" />
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Format</label>
                    <p className="text-lg font-medium text-gray-800">{config.type}</p>
                 </div>
              </div>
            )}
            {config.prizes && config.prizes.length > 0 && (
               <div className="flex items-start space-x-3">
                 <Trophy className="w-5 h-5 text-gray-400 mt-1" />
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Prize Fund</label>
                    <div className="space-y-1">
                      {config.prizes.map((prize, idx) => (
                        <p key={idx} className="text-sm font-medium text-gray-800">{prize}</p>
                      ))}
                    </div>
                 </div>
              </div>
            )}
          </div>

          {config.sponsorName && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Tournament Sponsor</label>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {config.logoUrl && (
                  <img src={config.logoUrl} alt="Sponsor Logo" className="w-12 h-12 object-contain" />
                )}
                <span className="text-lg font-bold text-gray-900">{config.sponsorName}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SetupWizard;
