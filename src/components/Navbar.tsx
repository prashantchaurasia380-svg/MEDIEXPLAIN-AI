import React from 'react';
import {
  Activity,
  BrainCircuit,
  Stethoscope,
  UserCheck,
  ShieldCheck,
  BarChart3,
  BotMessageSquare,
  FileText,
  Building2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onSelectRole: (role: UserRole) => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSelectRole,
  onOpenAuthModal,
}) => {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Activity },
    { id: 'diagnosis', label: 'Start Diagnosis', icon: Stethoscope },
    { id: 'xai', label: 'Explainable AI', icon: BrainCircuit },
    { id: 'analytics', label: 'Visual Analytics', icon: BarChart3 },
    { id: 'doctor', label: 'Doctor Dashboard', icon: UserCheck, roleReq: 'doctor' },
    { id: 'patient', label: 'Patient Portal', icon: FileText, roleReq: 'patient' },
    { id: 'chat', label: 'AI Health Chat', icon: BotMessageSquare },
    { id: 'admin', label: 'Admin & Compliance', icon: Building2 },
  ];

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'doctor':
        return <Stethoscope className="w-4 h-4 text-cyan-400" />;
      case 'patient':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'admin':
        return <Building2 className="w-4 h-4 text-purple-400" />;
      case 'student':
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 shadow-xl print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-bold">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  MediExplain<span className="text-cyan-400">.AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80 rounded-full">
                  XAI Clinical
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Transparent Artificial Intelligence in Healthcare
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher */}
            <div className="hidden sm:flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1 text-xs">
              <span className="px-2 text-[10px] text-slate-500 font-semibold uppercase">Role:</span>
              {(['doctor', 'patient', 'admin', 'student'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onSelectRole(r)}
                  className={`px-2 py-1 rounded-lg capitalize text-xs font-medium transition-all ${
                    currentUser.role === r
                      ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Switch active view to ${r}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Account Profile button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 transition-all shadow-sm"
            >
              <div className="p-1 bg-slate-900 rounded-lg border border-slate-700">
                {getRoleIcon(currentUser.role)}
              </div>
              <div className="text-left hidden md:block">
                <div className="font-semibold text-slate-100 flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  {currentUser.isVerified && (
                    <span title="Verified Medical License">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">{currentUser.role} Account</div>
              </div>
            </button>

            {/* Mobile Diagnosis CTA */}
            <button
              onClick={() => setActiveTab('diagnosis')}
              className="lg:hidden p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30"
              title="Start Diagnosis"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Subnav Bar */}
        <div className="lg:hidden py-2 border-t border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
