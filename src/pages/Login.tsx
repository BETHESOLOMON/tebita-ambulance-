import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (id: string) => {
    setLoading(true);
    const success = await login(id);
    setLoading(false);
    if (success) {
      toast.success('Access Granted');
      navigate('/');
    } else {
      toast.error('Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-[48px] p-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-28 h-28 rounded-3xl overflow-hidden mb-6 shadow-2xl border-4 border-slate-800">
            <img 
              src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/a108f9a5-8b9a-406d-a0ce-49177addbb2f/tebita-ambulance-logo-33203d44-1772292935778.webp" 
              className="w-full h-full object-cover" 
              alt="Tebita Logo"
            />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">TEBITA</h1>
          <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Emergency Care System</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('emt1')}
            disabled={loading}
            className="w-full h-20 bg-slate-900 hover:bg-slate-800 text-white rounded-[28px] flex items-center px-8 transition-all border border-slate-800 active:scale-95 group"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-110">
              <User className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-black text-lg">EMT Access</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mission Command</p>
            </div>
          </button>

          <button
            onClick={() => handleLogin('admin1')}
            disabled={loading}
            className="w-full h-20 bg-slate-900 hover:bg-slate-800 text-white rounded-[28px] flex items-center px-8 transition-all border border-slate-800 active:scale-95 group"
          >
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg shadow-red-600/20 transition-transform group-hover:scale-110">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-black text-lg">Admin Login</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Management</p>
            </div>
          </button>
        </div>

        {loading && (
          <div className="mt-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Device Encrypted • Offline Sync Enabled
          </p>
        </div>
      </motion.div>
    </div>
  );
};