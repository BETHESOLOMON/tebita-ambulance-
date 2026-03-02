import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import { CasualtyReport } from '../types';
import { 
  ChevronLeft, FileDown, MapPin, 
  Clock, Heart, Activity, User, 
  Navigation, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { generatePDF } from '../utils/pdfGenerator';
import { MapView } from '../components/MapView';

export const MissionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<CasualtyReport | null>(null);

  useEffect(() => {
    if (id) {
      db.reports.get(id).then(setReport);
    }
  }, [id]);

  if (!report) return <div className="p-8 text-center text-slate-500">Loading mission details...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-bold truncate">Mission: {report.id}</h1>
          <button onClick={() => generatePDF(report)} className="p-2 -mr-2 text-red-500">
            <FileDown className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Status Card */}
        <div className={`p-6 rounded-3xl border flex items-center gap-4 ${
          report.status === 'Submitted' ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            report.status === 'Submitted' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
          }`}>
            {report.status === 'Submitted' ? <CheckCircle2 /> : <Clock />}
          </div>
          <div>
            <h2 className="text-lg font-bold">{report.status}</h2>
            <p className="text-sm text-slate-400">Mission recorded on {format(report.createdAt, 'MMM d, yyyy')}</p>
          </div>
        </div>

        {/* Map View */}
        <div className="space-y-2">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Mission Route</h3>
           <MapView 
            route={report.route} 
            sceneLocation={report.sceneLocation} 
            destinationLocation={report.destinationLocation} 
           />
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard icon={<User className="text-blue-500" />} label="Patient" value={report.patientName || 'N/A'} />
          <InfoCard icon={<Heart className="text-red-500" />} label="Severity" value={`Category ${report.severity || '?'}`} />
          <InfoCard icon={<Clock className="text-purple-500" />} label="Response" value={report.callTime || '--:--'} />
          <InfoCard icon={<Navigation className="text-orange-500" />} label="Distance" value={`${report.destinationArrivalKM - report.departureKM || 0} KM`} />
        </div>

        {/* Details List */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <DetailRow label="Ambulance" value={report.ambulanceId || 'AMB-001'} />
          <DetailRow label="EMT In Charge" value={report.emtName} />
          <DetailRow label="Vehicle Type" value={report.vehicleType} />
          <DetailRow label="Destination" value={report.destinationFacility || 'Not specified'} />
          <DetailRow label="Arrival Time" value={report.destinationArrivalTime || '--:--'} />
          <DetailRow label="Siren Used" value={report.sirenUsed ? 'Yes' : 'No'} isLast />
        </section>

        {report.symptoms && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Clinical Notes</h3>
            <p className="text-slate-300 leading-relaxed">{report.symptoms}</p>
          </div>
        )}

        <button 
          onClick={() => generatePDF(report)}
          className="w-full h-16 bg-red-600 hover:bg-red-500 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all active:scale-95"
        >
          <FileDown className="w-6 h-6" /> DOWNLOAD FULL PDF
        </button>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
    </div>
    <p className="text-lg font-bold truncate">{value}</p>
  </div>
);

const DetailRow: React.FC<{ label: string, value: string, isLast?: boolean }> = ({ label, value, isLast }) => (
  <div className={`flex items-center justify-between p-4 ${isLast ? '' : 'border-b border-slate-800'}`}>
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-bold text-slate-200">{value}</span>
  </div>
);