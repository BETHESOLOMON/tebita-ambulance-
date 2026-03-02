import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import { CasualtyReport } from '../types';
import { 
  ChevronLeft, FileText, Download, 
  Filter, Search, Map as MapIcon, 
  TrendingUp, Users, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { generatePDF } from '../utils/pdfGenerator';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<CasualtyReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    db.reports.toArray().then(data => {
      setReports(data.sort((a, b) => b.createdAt - a.createdAt));
    });
  }, []);

  const filtered = reports.filter(r => 
    r.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-widest text-red-600">Admin Panel</h1>
        <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
          <Activity className="w-6 h-6 text-red-500" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FileText className="text-blue-500" />} label="Total" value={reports.length} />
        <StatCard icon={<TrendingUp className="text-green-500" />} label="Today" value={reports.filter(r => format(r.createdAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length} />
        <StatCard icon={<Users className="text-purple-500" />} label="EMTs" value={2} />
        <StatCard icon={<MapIcon className="text-orange-500" />} label="Active" value={reports.filter(r => r.status === 'Draft').length} />
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl h-14 pl-12 pr-4 outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <button className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
          <Filter className="w-6 h-6" />
        </button>
      </div>

      {/* Reports Table/List */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Case Registry</h3>
        {filtered.map(report => (
          <div key={report.id} className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 shrink-0">
                <FileText className="w-8 h-8 text-slate-700" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">{report.patientName || 'Untitled Case'}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{report.id}</span>
                  <span className="w-1 h-1 bg-slate-800 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{report.emtName}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-auto md:ml-0">
               <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                report.status === 'Submitted' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
               }`}>
                 {report.status}
               </span>
               <button 
                onClick={() => generatePDF(report)}
                className="p-3 bg-red-600 hover:bg-red-500 rounded-xl text-white transition-all shadow-lg shadow-red-600/20 active:scale-95"
               >
                 <Download className="w-5 h-5" />
               </button>
               <button 
                onClick={() => navigate(`/report/${report.id}`)}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all"
               >
                 <ChevronLeft className="w-5 h-5 rotate-180" />
               </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-600 font-medium">No results matching your query.</div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number }> = ({ icon, label, value }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-5 shadow-sm">
    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-3">
      {icon}
    </div>
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">{label}</p>
  </div>
);