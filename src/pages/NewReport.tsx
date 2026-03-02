import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { db } from '../db/database';
import { CasualtyReport, VitalSignRecord } from '../types';
import { 
  ChevronLeft, ChevronRight, Save, 
  MapPin, Clock, ShieldAlert, Activity, 
  Truck, CheckCircle2, UserCircle, 
  Info, Phone, Navigation2, Stethoscope, 
  HeartPulse, Thermometer, UserCheck, 
  Wind, Droplets, AlertCircle, FileText, 
  UserPlus, FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const NewReport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { route, capturePoint } = useGeolocation(true);
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const [formData, setFormData] = useState<Partial<CasualtyReport>>({
    id: `CAS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'Draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    emtId: user?.id || '',
    emtName: user?.name || '',
    ambulanceId: user?.ambulanceId || 'AMB-001',
    serviceDate: format(new Date(), 'yyyy-MM-dd'),
    callTime: format(new Date(), 'HH:mm'),
    route: [],
    vitals: [],
    departureKM: 0,
    sceneArrivalKM: 0,
    destinationArrivalKM: 0,
    returnKM: 0,
    severity: 1,
    vehicleType: 'Toyota',
    ambulanceLevel: 'BLS',
    airwayAdjuncts: [],
    cCollarApplied: false,
    cprPerformed: false,
    severeBleeding: false,
    ivAccess: false,
    sirenUsed: false,
    deathOnArrival: false
  });

  const [currentVitals, setCurrentVitals] = useState<VitalSignRecord>({
    time: format(new Date(), 'HH:mm'),
    avpu: '',
    rr: '',
    pr: '',
    bp: '',
    spo2: '',
    skin: '',
    status: 'Stable'
  });

  const updateField = (field: keyof CasualtyReport, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value, updatedAt: Date.now() }));
  };

  const handleSave = async () => {
    try {
      const currentRoute = [...(formData.route || []), ...route];
      const completeData = { 
        ...formData, 
        route: currentRoute
      } as CasualtyReport;
      await db.reports.put(completeData);
      toast.success('Progress saved locally');
    } catch (e) {
      toast.error('Error saving data');
    }
  };

  const handleSubmit = async () => {
    try {
      const finalData = { 
        ...formData, 
        status: 'Submitted',
        updatedAt: Date.now(),
        route: [...(formData.route || []), ...route]
      } as CasualtyReport;
      await db.reports.put(finalData);
      toast.success('Report submitted successfully!');
      navigate('/');
    } catch (e) {
      toast.error('Submission failed');
    }
  };

  const nextStep = () => {
    handleSave();
    if (step < totalSteps) setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const setGPSNow = (field: 'sceneLocation' | 'destinationLocation') => {
    const p = capturePoint(field);
    if (p) {
      updateField(field, p);
      if (field === 'sceneLocation') {
        updateField('sceneArrivalTime', format(new Date(), 'HH:mm'));
      } else {
        updateField('destinationArrivalTime', format(new Date(), 'HH:mm'));
      }
      toast.success(`${field} GPS captured`);
    } else {
      toast.error('GPS not available');
    }
  };

  const toggleAdjunct = (adj: string) => {
    const current = (formData.airwayAdjuncts || []) as string[];
    if (current.includes(adj)) {
      updateField('airwayAdjuncts', current.filter(i => i !== adj));
    } else {
      updateField('airwayAdjuncts', [...current, adj]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-32">
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Section {step} of {totalSteps}</p>
            <h1 className="text-sm font-bold truncate">
              {step === 1 && 'Demography'}
              {step === 2 && 'Ambulance & Time'}
              {step === 3 && 'Primary Survey'}
              {step === 4 && 'Secondary Survey'}
              {step === 5 && 'Care in Transit'}
              {step === 6 && 'Transfer & Definitive Care'}
              {step === 7 && 'Other Details'}
            </h1>
          </div>
          <button onClick={handleSave} className="p-2 -mr-2 text-slate-400">
            <Save className="w-6 h-6" />
          </button>
        </div>
        <div className="w-full bg-slate-900 h-1.5 mt-4 rounded-full overflow-hidden">
          <div 
            className="bg-red-600 h-full transition-all duration-300" 
            style={{ width: `${(step / totalSteps) * 100}%` }} 
          />
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* STEP 1: DEMOGRAPHY */}
            {step === 1 && (
              <div className="space-y-6">
                <FormGroup label="Patient Name" icon={<UserCircle className="w-4 h-4 text-blue-400" />}>
                  <InputField 
                    placeholder="Full Name" 
                    value={formData.patientName || ''} 
                    onChange={v => updateField('patientName', v)} 
                  />
                </FormGroup>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Age">
                    <InputField 
                      placeholder="Years/Months"
                      value={formData.age || ''} 
                      onChange={v => updateField('age', v)} 
                    />
                  </FormGroup>
                  <FormGroup label="Sex">
                    <SelectField 
                      value={formData.sex || ''} 
                      onChange={v => updateField('sex', v)}
                      options={['Male', 'Female', 'Other']}
                    />
                  </FormGroup>
                </div>

                <FormGroup label="Phone Number" icon={<Phone className="w-4 h-4 text-green-400" />}>
                  <InputField 
                    type="tel"
                    placeholder="+251..." 
                    value={formData.phoneNumber || ''} 
                    onChange={v => updateField('phoneNumber', v)} 
                  />
                </FormGroup>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Region">
                    <InputField 
                      value={formData.region || ''} 
                      onChange={v => updateField('region', v)} 
                    />
                  </FormGroup>
                  <FormGroup label="Sub-City / Town">
                    <InputField 
                      value={formData.subCity || ''} 
                      onChange={v => updateField('subCity', v)} 
                    />
                  </FormGroup>
                </div>

                <FormGroup label="Caller Point">
                  <SelectionGrid 
                    options={['Home', 'Health facility', 'Street', 'Other']} 
                    value={formData.callerPoint} 
                    onChange={v => updateField('callerPoint', v)} 
                  />
                </FormGroup>
              </div>
            )}

            {/* STEP 2: AMBULANCE & TIME */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Ambulance Level">
                    <SelectionGrid 
                      options={['BLS', 'ALS']} 
                      value={formData.ambulanceLevel} 
                      onChange={v => updateField('ambulanceLevel', v)} 
                    />
                  </FormGroup>
                  <FormGroup label="Emergency Type">
                    <SelectionGrid 
                      options={['EMPD', 'NEMPD']} 
                      value={formData.emergencyType} 
                      onChange={v => updateField('emergencyType', v)} 
                    />
                  </FormGroup>
                </div>

                <FormGroup label="Vehicle Info">
                  <SelectField 
                    value={formData.vehicleType || ''} 
                    onChange={v => updateField('vehicleType', v)}
                    options={['Toyota', 'Hyundai', 'Mercedes']}
                  />
                </FormGroup>

                <div className="space-y-4 pt-4">
                  <GPSButton 
                    label="AT SCENE" 
                    icon={<MapPin />} 
                    color="bg-blue-600" 
                    onClick={() => setGPSNow('sceneLocation')}
                    time={formData.sceneArrivalTime}
                    km={formData.sceneArrivalKM}
                    onKMChange={v => updateField('sceneArrivalKM', Number(v))}
                  />
                  
                  <GPSButton 
                    label="AT HOSPITAL" 
                    icon={<Truck />} 
                    color="bg-green-600" 
                    onClick={() => setGPSNow('destinationLocation')}
                    time={formData.destinationArrivalTime}
                    km={formData.destinationArrivalKM}
                    onKMChange={v => updateField('destinationArrivalKM', Number(v))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <FormGroup label="Departure KM">
                    <InputField type="number" value={formData.departureKM} onChange={v => updateField('departureKM', Number(v))} />
                  </FormGroup>
                  <FormGroup label="Return KM">
                    <InputField type="number" value={formData.returnKM} onChange={v => updateField('returnKM', Number(v))} />
                  </FormGroup>
                </div>
              </div>
            )}

            {/* STEP 3: PRIMARY SURVEY & VITALS */}
            {step === 3 && (
              <div className="space-y-6 pb-12">
                <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-2xl">
                  <FormGroup label="Severity of Illness" icon={<ShieldAlert className="w-4 h-4 text-red-500" />}>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => updateField('severity', cat)} 
                          className={`flex-1 h-12 rounded-xl border font-bold text-lg ${formData.severity === cat ? 'bg-red-600 border-red-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Responsiveness">
                    <InputField value={formData.responsiveness || ''} onChange={v => updateField('responsiveness', v)} />
                  </FormGroup>
                  <FormGroup label="Airway Status">
                    <InputField value={formData.airwayStatus || ''} onChange={v => updateField('airwayStatus', v)} />
                  </FormGroup>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl">
                  <label className="font-bold text-sm">C-Collar Applied?</label>
                  <ToggleButton active={!!formData.cCollarApplied} onClick={() => updateField('cCollarApplied', !formData.cCollarApplied)} />
                </div>

                <FormGroup label="Airway Adjuncts">
                  <div className="grid grid-cols-3 gap-2">
                    {['OPA', 'NPA', 'LMA'].map(adj => (
                      <button 
                        key={adj} 
                        onClick={() => toggleAdjunct(adj)} 
                        className={`p-3 rounded-xl border text-sm font-bold ${formData.airwayAdjuncts?.includes(adj) ? 'bg-blue-600 border-blue-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                      >
                        {adj}
                      </button>
                    ))}
                  </div>
                </FormGroup>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Breathing Status">
                    <InputField value={formData.breathingStatus || ''} onChange={v => updateField('breathingStatus', v)} />
                  </FormGroup>
                  <FormGroup label="Oxygen & Flow Rate">
                    <InputField placeholder="e.g., 5L/min" value={formData.oxygenFlow || ''} onChange={v => updateField('oxygenFlow', v)} />
                  </FormGroup>
                </div>

                <FormGroup label="Assisted Ventilation">
                  <SelectionGrid 
                    options={['None', 'BVM', 'MV']} 
                    value={formData.assistedVentilation || 'None'} 
                    onChange={v => updateField('assistedVentilation', v)} 
                  />
                </FormGroup>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Circulation">
                    <InputField value={formData.circulation || ''} onChange={v => updateField('circulation', v)} />
                  </FormGroup>
                  <FormGroup label="GCS Score">
                    <InputField placeholder="E_V_M_ (15/15)" value={formData.gcs || ''} onChange={v => updateField('gcs', v)} />
                  </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Peripheral Pulse">
                    <InputField value={formData.peripheralPulse || ''} onChange={v => updateField('peripheralPulse', v)} />
                  </FormGroup>
                  <FormGroup label="Carotid Pulse">
                    <InputField value={formData.carotidPulse || ''} onChange={v => updateField('carotidPulse', v)} />
                  </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl">
                    <label className="font-bold text-xs uppercase">CPR Done</label>
                    <ToggleButton active={!!formData.cprPerformed} onClick={() => updateField('cprPerformed', !formData.cprPerformed)} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl">
                    <label className="font-bold text-xs uppercase">Severe Bleed</label>
                    <ToggleButton active={!!formData.severeBleeding} onClick={() => updateField('severeBleeding', !formData.severeBleeding)} />
                  </div>
                </div>

                <FormGroup label="Bleeding Control Method">
                  <InputField value={formData.bleedingControlMethod || ''} onChange={v => updateField('bleedingControlMethod', v)} />
                </FormGroup>

                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl">
                  <label className="font-bold text-sm">IV Access Obtained?</label>
                  <ToggleButton active={!!formData.ivAccess} onClick={() => updateField('ivAccess', !formData.ivAccess)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Fluids Type & Rate">
                    <InputField value={formData.fluidsTypeRate || ''} onChange={v => updateField('fluidsTypeRate', v)} />
                  </FormGroup>
                  <FormGroup label="Blood Glucose">
                    <InputField placeholder="mg/dL" value={formData.bloodGlucose || ''} onChange={v => updateField('bloodGlucose', v)} />
                  </FormGroup>
                </div>

                {/* VITAL SIGNS SECTION */}
                <div className="mt-10 pt-8 border-t border-slate-800 space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2"><HeartPulse className="w-5 h-5 text-red-500" /> Vital Signs</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Time">
                      <InputField type="time" value={currentVitals.time} onChange={v => setCurrentVitals({...currentVitals, time: v})} />
                    </FormGroup>
                    <FormGroup label="AVPU">
                      <SelectField options={['Alert', 'Verbal', 'Pain', 'Unresponsive']} value={currentVitals.avpu} onChange={v => setCurrentVitals({...currentVitals, avpu: v})} />
                    </FormGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Resp Rate (RR)">
                      <InputField type="number" placeholder="bpm" value={currentVitals.rr} onChange={v => setCurrentVitals({...currentVitals, rr: v})} />
                    </FormGroup>
                    <FormGroup label="Pulse Rate (PR)">
                      <InputField type="number" placeholder="bpm" value={currentVitals.pr} onChange={v => setCurrentVitals({...currentVitals, pr: v})} />
                    </FormGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Blood Pressure">
                      <InputField placeholder="120/80" value={currentVitals.bp} onChange={v => setCurrentVitals({...currentVitals, bp: v})} />
                    </FormGroup>
                    <FormGroup label="SpO2 (%)">
                      <InputField type="number" placeholder="98" value={currentVitals.spo2} onChange={v => setCurrentVitals({...currentVitals, spo2: v})} />
                    </FormGroup>
                  </div>

                  <FormGroup label="Skin Color / Temp">
                    <InputField placeholder="Normal, Pale, Hot, etc." value={currentVitals.skin} onChange={v => setCurrentVitals({...currentVitals, skin: v})} />
                  </FormGroup>

                  <FormGroup label="Patient Status">
                    <SelectionGrid options={['Stable', 'Critical']} value={currentVitals.status} onChange={v => setCurrentVitals({...currentVitals, status: v as any})} />
                  </FormGroup>

                  <button 
                    onClick={() => {
                      updateField('vitals', [...(formData.vitals || []), currentVitals]);
                      toast.success('Vital record added');
                    }}
                    className="w-full py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" /> ADD RECORD
                  </button>

                  {formData.vitals && formData.vitals.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {formData.vitals.map((v, i) => (
                        <div key={i} className="p-3 bg-slate-900/50 rounded-xl text-xs flex justify-between items-center">
                          <span>{v.time} - {v.bp} ({v.pr} bpm)</span>
                          <span className={v.status === 'Critical' ? 'text-red-500 font-bold' : 'text-green-500'}>{v.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: SECONDARY SURVEY */}
            {step === 4 && (
              <div className="space-y-6">
                <FormGroup label="Symptoms">
                  <TextareaField placeholder="What is the patient feeling?" value={formData.symptoms || ''} onChange={v => updateField('symptoms', v)} />
                </FormGroup>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Allergies">
                    <TextareaField placeholder="Known allergies" value={formData.allergies || ''} onChange={v => updateField('allergies', v)} />
                  </FormGroup>
                  <FormGroup label="Medications">
                    <TextareaField placeholder="Current meds" value={formData.medications || ''} onChange={v => updateField('medications', v)} />
                  </FormGroup>
                </div>

                <FormGroup label="Past Medical History">
                  <TextareaField placeholder="PMH details..." value={formData.medicalHistory || ''} onChange={v => updateField('medicalHistory', v)} />
                </FormGroup>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Last Meal">
                    <InputField placeholder="Time/Content" value={formData.lastMeal || ''} onChange={v => updateField('lastMeal', v)} />
                  </FormGroup>
                  <FormGroup label="Cause of Injury">
                    <SelectField options={['RTI', 'Fall', 'Violence', 'Others']} value={formData.causeOfInjury || ''} onChange={v => updateField('causeOfInjury', v)} />
                  </FormGroup>
                </div>

                <FormGroup label="Events Leading to Incident">
                  <TextareaField placeholder="Narrative..." value={formData.incidentEvents || ''} onChange={v => updateField('incidentEvents', v)} />
                </FormGroup>

                <FormGroup label="Head-to-Toe Examination">
                  <TextareaField placeholder="Findings..." value={formData.examinationHeadToToe || ''} onChange={v => updateField('examinationHeadToToe', v)} />
                </FormGroup>

                <FormGroup label="Injury Findings">
                  <TextareaField placeholder="Specific injuries..." value={formData.injuryFindings || ''} onChange={v => updateField('injuryFindings', v)} />
                </FormGroup>

                <FormGroup label="Provisional Diagnosis">
                  <TextareaField placeholder="EMT Impression..." value={formData.provisionalDiagnosis || ''} onChange={v => updateField('provisionalDiagnosis', v)} />
                </FormGroup>
              </div>
            )}

            {/* STEP 5: CARE IN TRANSIT */}
            {step === 5 && (
              <div className="space-y-6">
                <FormGroup label="Treatment Given">
                  <TextareaField 
                    rows={8}
                    placeholder="Detailed treatment during transport..." 
                    value={formData.treatmentGiven || ''} 
                    onChange={v => updateField('treatmentGiven', v)} 
                  />
                </FormGroup>

                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl">
                  <label className="font-bold text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-orange-400" /> Ambulance Siren Used?</label>
                  <ToggleButton active={!!formData.sirenUsed} onClick={() => updateField('sirenUsed', !formData.sirenUsed)} />
                </div>

                <FormGroup label="Caller Place (Scene Detail)">
                  <InputField placeholder="e.g. Specific building, floor" value={formData.callerPlace || ''} onChange={v => updateField('callerPlace', v)} />
                </FormGroup>

                <FormGroup label="Accessibility">
                  <SelectionGrid 
                    options={['Easy', 'Difficult']} 
                    value={formData.accessibility || ''} 
                    onChange={v => updateField('accessibility', v)} 
                  />
                </FormGroup>
              </div>
            )}

            {/* STEP 6: TRANSFER & DEFINITIVE CARE */}
            {step === 6 && (
              <div className="space-y-6">
                <FormGroup label="Patient Condition on Handover">
                  <TextareaField 
                    placeholder="Condition upon arrival at facility..." 
                    value={formData.conditionOnHandover || ''} 
                    onChange={v => updateField('conditionOnHandover', v)} 
                  />
                </FormGroup>

                <div className="grid grid-cols-3 gap-3">
                  <FormGroup label="Final BP">
                    <InputField placeholder="120/80" value={formData.handoverBloodPressure || ''} onChange={v => updateField('handoverBloodPressure', v)} />
                  </FormGroup>
                  <FormGroup label="Pulse">
                    <InputField type="number" value={formData.handoverPulse || ''} onChange={v => updateField('handoverPulse', v)} />
                  </FormGroup>
                  <FormGroup label="SpO2">
                    <InputField type="number" value={formData.handoverOxygenSaturation || ''} onChange={v => updateField('handoverOxygenSaturation', v)} />
                  </FormGroup>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-950/20 border border-red-900/30 rounded-2xl">
                  <label className="font-bold text-sm text-red-500">DEATH ON ARRIVAL?</label>
                  <ToggleButton active={!!formData.deathOnArrival} onClick={() => updateField('deathOnArrival', !formData.deathOnArrival)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Handover Time">
                    <InputField type="time" value={formData.handoverTime || format(new Date(), 'HH:mm')} onChange={v => updateField('handoverTime', v)} />
                  </FormGroup>
                  <FormGroup label="Destination Facility">
                    <InputField value={formData.destinationFacility || ''} onChange={v => updateField('destinationFacility', v)} />
                  </FormGroup>
                </div>

                <FormGroup label="Receiving Personnel (Name & Rank)">
                  <InputField placeholder="Dr. / Nurse Name" value={formData.receivingPersonnel || ''} onChange={v => updateField('receivingPersonnel', v)} />
                </FormGroup>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <FormGroup label="EMT Name & Sign">
                    <InputField value={formData.emtName || ''} onChange={v => updateField('emtName', v)} />
                  </FormGroup>
                  <FormGroup label="Driver Name & Sign">
                    <InputField value={formData.driverName || ''} onChange={v => updateField('driverName', v)} />
                  </FormGroup>
                </div>
              </div>
            )}

            {/* STEP 7: OTHERS */}
            {step === 7 && (
              <div className="space-y-6">
                <FormGroup label="Ambulance Plate Number">
                  <InputField value={formData.ambulanceNumber || ''} onChange={v => updateField('ambulanceNumber', v)} />
                </FormGroup>

                <FormGroup label="Customer Call Type">
                  <SelectionGrid 
                    options={['New', 'Repeat']} 
                    value={formData.callType || 'New'} 
                    onChange={v => updateField('callType', v)} 
                  />
                </FormGroup>

                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Service Fee (ETB)">
                    <InputField type="number" value={formData.serviceFee || ''} onChange={v => updateField('serviceFee', v)} />
                  </FormGroup>
                  <FormGroup label="Invoice Number">
                    <InputField value={formData.invoiceNumber || ''} onChange={v => updateField('invoiceNumber', v)} />
                  </FormGroup>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-3xl mt-12">
                  <h4 className="font-bold text-blue-400 mb-2">Final Review</h4>
                  <p className="text-sm text-slate-400">Ensure all medical data is accurate. Once submitted, this report will be locked for editing.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800 z-50">
        <div className="flex gap-4 max-w-2xl mx-auto">
          {step > 1 && (
            <button 
              onClick={prevStep} 
              className="w-20 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {step < totalSteps ? (
            <button 
              onClick={nextStep} 
              className="flex-1 h-16 bg-red-600 rounded-2xl flex items-center justify-center gap-2 font-bold text-xl active:scale-95 transition-transform"
            >
              NEXT <ChevronRight className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="flex-1 h-16 bg-green-600 rounded-2xl flex items-center justify-center gap-2 font-bold text-xl shadow-lg shadow-green-900/20 active:scale-95 transition-transform"
            >
              SUBMIT REPORT <CheckCircle2 className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* --- UI COMPONENTS --- */

const FormGroup: React.FC<{ label: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
      {icon} {label}
    </label>
    {children}
  </div>
);

const InputField: React.FC<{ value: any; onChange: (v: string) => void; placeholder?: string; type?: string }> = ({ value, onChange, placeholder, type = 'text' }) => (
  <input 
    type={type} 
    placeholder={placeholder} 
    value={value} 
    onChange={e => onChange(e.target.value)} 
    className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl outline-none focus:border-red-500/50 transition-colors" 
  />
);

const TextareaField: React.FC<{ value: any; onChange: (v: string) => void; placeholder?: string; rows?: number }> = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea 
    rows={rows}
    placeholder={placeholder} 
    value={value} 
    onChange={e => onChange(e.target.value)} 
    className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl outline-none focus:border-red-500/50 transition-colors resize-none" 
  />
);

const SelectField: React.FC<{ value: string; onChange: (v: string) => void; options: string[] }> = ({ value, onChange, options }) => (
  <select 
    value={value} 
    onChange={e => onChange(e.target.value)} 
    className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl outline-none focus:border-red-500/50 appearance-none"
  >
    <option value="">Select...</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const SelectionGrid: React.FC<{ options: string[]; value?: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <div className="grid grid-cols-2 gap-2">
    {options.map(o => (
      <button 
        key={o} 
        onClick={() => onChange(o)} 
        className={`p-4 rounded-2xl border text-sm font-bold transition-all ${value === o ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
      >
        {o}
      </button>
    ))}
  </div>
);

const ToggleButton: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-14 h-8 rounded-full transition-colors relative ${active ? 'bg-red-600' : 'bg-slate-800'}`}
  >
    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

const GPSButton: React.FC<{ 
  label: string; 
  icon: React.ReactNode; 
  color: string; 
  onClick: () => void; 
  time?: string;
  km?: number;
  onKMChange: (v: string) => void;
}> = ({ label, icon, color, onClick, time, km, onKMChange }) => (
  <div className="space-y-2">
    <button 
      onClick={onClick} 
      className={`w-full h-16 ${color} rounded-2xl flex items-center justify-between px-6 font-bold active:scale-[0.98] transition-all`}
    >
      <div className="flex items-center gap-3">{icon} {label}</div>
      {time && <span className="bg-black/20 px-3 py-1 rounded-lg text-sm">{time}</span>}
    </button>
    {time && (
      <div className="flex items-center gap-2 p-1">
        <div className="flex-1 h-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">KM:</span>
          <input 
            type="number" 
            value={km || ''} 
            onChange={e => onKMChange(e.target.value)} 
            className="w-24 bg-transparent border-b border-slate-800 text-sm outline-none text-center"
            placeholder="0.0"
          />
        </div>
      </div>
    )}
  </div>
);