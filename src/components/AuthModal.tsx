import React from 'react';
import { X, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../types';
import { SAMPLE_USERS } from '../mock/medicalData';

interface AuthModalProps {
  onClose: () => void;
  onSelectUser: (user: UserType) => void;
  currentUser: UserType;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSelectUser, currentUser }) => {
  const handleChooseUser = (u: UserType) => {
    onSelectUser(u);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Role Access & Authentication</h3>
            <p className="text-xs text-slate-400">Select user profile or switch clinical role.</p>
          </div>
        </div>

        {/* User Role Quick Picks */}
        <div className="space-y-3 mb-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Profiles:</label>
          {SAMPLE_USERS.map((u) => {
            const isSelected = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => handleChooseUser(u)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>{u.name}</span>
                    {u.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 capitalize">{u.role} • {u.hospitalName}</p>
                </div>

                {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
