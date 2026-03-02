import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../db/database';
import { CasualtyReport } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, History, Shield, LogOut, 
  Wifi, WifiOff, FileText, 
  MapPin, Clock, Navigation, CheckCircle2, ChevronRight, Activity, LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<CasualtyReport[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const fetchReports = async () => {
      if (!user) return;
      let data: CasualtyReport[];
      if (user.role === 'Admin') {
        data = await db.reports.toArray();
      } else {
        data = await db.reports.where('emtId').equals(user.id).toArray();
      }
      setReports(data.sort((a, b) => b.createdAt - a.createdAt));
    };
    fetchReports();
    const interval = setInterval(fetchReports, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [user]);

  const activeMissions = reports.filter(r => r.status === 'Draft');
  const completedMissions = reports.filter(r => r.status !== 'Draft');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-32 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Activity className="text-white w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">TEBITA</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role} ACCESS</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 border text-[10px] font-bold uppercase ${
            isOnline ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <button onClick={logout} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Brand Hero */}
      <div className="relative h-44 rounded-[32px] overflow-hidden mb-8 border border-slate-800 shadow-2xl">
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/a108f9a5-8b9a-406d-a0ce-49177addbb2f/app-ui-preview-d30cfd34-1772292936559.webp" 
          className="w-full h-full object-cover opacity-60 grayscale-[0.5]" 
          alt="Ambulance Care"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-end">
          <p className="text-white text-2xl font-black">Prehospital Care</p>
          <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Addis Ababa, Ethiopia</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {user?.role === 'EMT' && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/new-report')}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold h-24 rounded-[32px] flex items-center justify-between px-8 shadow-xl shadow-red-600/20 transition-all border-b-4 border-red-800"
          >
            <div className="flex flex-col items-start">
              <span className="text-sm opacity-80 uppercase tracking-widest">Respond Now</span>
              <span className="text-2xl">NEW MISSION</span>
            </div>
            <Plus className="w-10 h-10" />
          </motion.button>
        )}

        {user?.role === 'Admin' && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/admin')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-24 rounded-[32px] flex items-center justify-between px-8 shadow-xl transition-all border border-slate-800"
          >
            <div className="flex flex-col items-start">
              <span className="text-sm opacity-50 uppercase tracking-widest text-slate-400">Management</span>
              <span className="text-2xl">ADMIN PANEL</span>
            </div>
            <LayoutDashboard className="w-10 h-10 text-red-500" />
          </motion.button>
        )}
      </div>

      {/* Lists */}
      <div className="space-y-8">
        {activeMissions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" /> Ongoing Missions
              </h3>
              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{activeMissions.length}</span>
            </div>
            <div className="space-y-4">
              {activeMissions.map(report => (
                <MissionCard key={report.id} report={report} onClick={() => navigate(`/report/${report.id}`)} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4" /> Mission History
            </h3>
            <span className="text-slate-600 text-[10px] font-black">{completedMissions.length} COMPLETED</span>
          </div>
          <div className="space-y-4">
            {completedMissions.length > 0 ? (
              completedMissions.map(report => (
                <MissionCard key={report.id} report={report} onClick={() => navigate(`/report/${report.id}`)} />
              ))
            ) : (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-[32px] p-12 text-center text-slate-600">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">No mission history found.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Nav Simulation */}
      <div className="fixed bottom-6 left-6 right-6 h-20 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-[40px] flex items-center justify-around px-8 shadow-2xl z-50 max-w-2xl mx-auto">
        <button onClick={() => navigate('/')} className="text-red-500 flex flex-col items-center">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center mb-1">
            <Navigation className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase">Home</span>
        </button>
        <button onClick={() => navigate('/admin')} className={`flex flex-col items-center ${user?.role === 'Admin' ? 'text-slate-200' : 'text-slate-500 opacity-50'}`}>
          <div className="w-10 h-10 flex items-center justify-center mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase">Admin</span>
        </button>
      </div>
    </div>
  );
};

const MissionCard: React.FC<{ report: CasualtyReport, onClick: () => void }> = ({ report, onClick }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-slate-900/80 border border-slate-800 rounded-[32px] p-5 flex items-center gap-4 cursor-pointer active:bg-slate-800 transition-colors shadow-sm"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
        report.status === 'Draft' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
      }`}>
        {report.status === 'Draft' ? <Clock className="w-7 h-7" /> : <CheckCircle2 className="w-7 h-7" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-white truncate text-lg">{report.patientName || 'Unknown Patient'}</h4>
          <p className="text-[10px] font-black text-slate-600 bg-slate-950 px-2 py-1 rounded-lg ml-2">{format(report.createdAt, 'HH:mm')}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
          <p className="flex items-center gap-1 uppercase tracking-wider truncate">
            <MapPin className="w-3 h-3 text-red-500" /> {report.subCity || 'Awaiting Loc.'}
          </p>
          <span className="opacity-20">•</span>
          <p className="flex items-center gap-1 uppercase tracking-wider">
            {report.ambulanceId}
          </p>
        </div>
      </div>
      <ChevronRight className="w-6 h-6 text-slate-800 shrink-0" />
    </motion.div>
  );
};