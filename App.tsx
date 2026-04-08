
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Diagnosis from './components/Diagnosis.tsx';
import Records from './components/Records.tsx';
import Settings from './components/Settings.tsx';
import AIResult from './components/AIResult.tsx';
import ConsultSession from './components/ConsultSession.tsx';
import { PatientCase, SystemSettings, StructuredDiagnosis } from './types.ts';
import { INITIAL_SETTINGS, STORAGE_KEYS } from './constants.ts';
import { analyzeMedicalCase } from './services/geminiService.ts';
import { MessageSquare, Activity } from 'lucide-react';
import { supabase } from './src/lib/supabase.ts';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [records, setRecords] = useState<PatientCase[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<{ diagnosis: StructuredDiagnosis, sources: any[] } | null>(null);
  const [lastDiagnosedPatient, setLastDiagnosedPatient] = useState<PatientCase | null>(null);
  const [activeSessionPatient, setActiveSessionPatient] = useState<PatientCase | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchRecords(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchRecords(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRecords = async (currentSession: Session | null) => {
    if (currentSession) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          const formattedRecords: PatientCase[] = data.map(item => ({
            ...item.data,
            id: item.id.toString(),
            date: new Date(item.created_at).toLocaleDateString('ar-EG')
          }));
          setRecords(formattedRecords);
          saveRecordsToLocalStorage(formattedRecords);
        }
      } catch (err) {
        console.error('Error fetching records:', err);
        loadLocalRecords();
      }
    } else {
      loadLocalRecords();
    }
  };

  const loadLocalRecords = () => {
    const savedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    else setRecords([]);
  };

  const saveRecordsToLocalStorage = (recordsToSave: PatientCase[]) => {
    try {
      const strippedRecords = recordsToSave.map(r => {
        const { images, image, ...rest } = r as any;
        return rest;
      });
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(strippedRecords));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  };

  const saveToLocalStorage = async (newRecord: PatientCase) => {
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    saveRecordsToLocalStorage(updatedRecords);

    if (session) {
      try {
        const { error } = await supabase
          .from('patients')
          .insert([{ 
            id: newRecord.id,
            data: newRecord,
            status: newRecord.status,
            user_id: session.user.id
          }]);
        if (error) throw error;
      } catch (err) {
        console.error('Error saving to Supabase:', err);
      }
    }
  };

  const bulkSaveToSupabase = async (newRecords: PatientCase[]) => {
    setRecords(newRecords);
    saveRecordsToLocalStorage(newRecords);

    if (session) {
      try {
        await supabase.from('patients').delete().eq('user_id', session.user.id);
        
        if (newRecords.length > 0) {
          const payload = newRecords.map(r => ({
            id: r.id,
            data: r,
            status: r.status,
            user_id: session.user.id
          }));

          const { error } = await supabase.from('patients').insert(payload);
          if (error) throw error;
        }
      } catch (err) {
        console.error('Error bulk saving to Supabase:', err);
      }
    }
  };

  const updateRecordInSupabase = async (patientId: string, updatedData: Partial<PatientCase>) => {
    try {
      const targetRecord = records.find(r => r.id === patientId);
      if (!targetRecord) return;

      const newData = { ...targetRecord, ...updatedData };
      const updatedRecords = records.map(r => r.id === patientId ? newData : r);
      
      setRecords(updatedRecords);
      saveRecordsToLocalStorage(updatedRecords);

      if (session) {
        const { error } = await supabase
          .from('patients')
          .update({ data: newData, status: newData.status })
          .eq('id', patientId)
          .eq('user_id', session.user.id);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error updating Supabase:', err);
    }
  };

  const deleteRecord = async (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveRecordsToLocalStorage(updated);

    if (session) {
      try {
        const { error } = await supabase
          .from('patients')
          .delete()
          .eq('id', id)
          .eq('user_id', session.user.id);
        
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting from Supabase:', err);
      }
    }
  };

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  };

  const handleAnalysis = async (patientData: Partial<PatientCase>) => {
    setIsAnalyzing(true);
    try {
      // الخدمة تتعامل الآن مع المفتاح الافتراضي داخلياً
      const result = await analyzeMedicalCase(patientData, settings);
      
      let status: 'مستقرة' | 'متابعة' | 'تدخل طبي' | 'حرجة' = 'مستقرة';
      if (result.diagnosis.severity === 'حرجة') {
        status = 'حرجة';
      } else if (result.diagnosis.severity === 'مرتفعة') {
        status = 'تدخل طبي';
      } else if (result.diagnosis.severity === 'متوسطة') {
        status = 'متابعة';
      }

      const newRecord: PatientCase = {
        id: Date.now().toString(),
        name: patientData.name || 'مجهول',
        age: patientData.age || '--',
        gender: patientData.gender || 'ذكر',
        symptoms: patientData.symptoms || '',
        vitals: patientData.vitals || { bloodPressure: '', pulse: '', temperature: '', spo2: '' },
        images: patientData.images || [],
        diagnosis: result.diagnosis,
        chatHistory: [],
        date: new Date().toLocaleDateString('ar-EG'),
        status: status
      };
      
      saveToLocalStorage(newRecord);
      setCurrentDiagnosis(result);
      setLastDiagnosedPatient(newRecord);
    } catch (error: any) {
      console.error("Analysis Error:", error);
      alert("⚠️ حدث خطأ أثناء التحليل. يرجى التأكد من استقرار الإنترنت أو التحقق من صحة مفتاح الـ API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderContent = () => {
    if (activeSessionPatient) {
      return (
        <ConsultSession 
          patient={activeSessionPatient} 
          settings={settings}
          onClose={() => setActiveSessionPatient(null)}
          onUpdateHistory={(history) => {
             updateRecordInSupabase(activeSessionPatient.id, { chatHistory: history });
          }}
        />
      );
    }

    if (activeTab === 'records') {
      return (
        <Records 
          records={records} 
          onDeleteRecord={deleteRecord}
          onStartSession={(p) => setActiveSessionPatient(p)}
          onNewCase={() => setActiveTab('diagnosis')}
        />
      );
    }

    if (currentDiagnosis && lastDiagnosedPatient) {
      return (
        <AIResult 
          diagnosis={currentDiagnosis.diagnosis} 
          patientName={lastDiagnosedPatient.name}
          onClose={() => {
            setCurrentDiagnosis(null);
            setActiveTab('home');
          }} 
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <Dashboard doctorName={settings.doctorName} records={records} onNewCase={() => setActiveTab('diagnosis')} onViewAll={() => setActiveTab('records')} activeModel={settings.model} isThinking={settings.deepThinking} />;
      case 'diagnosis':
        return <Diagnosis onAnalyze={handleAnalysis} isAnalyzing={isAnalyzing} />;
      case 'consult':
        return (
          <div className="space-y-4 lg:space-y-6">
            <div className="bg-slate-900 p-6 lg:p-8 rounded-2xl lg:rounded-3xl text-white flex items-center justify-between overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="text-xl lg:text-2xl font-black mb-1 lg:mb-2">العيادة الصوتية والمتابعة</h2>
                <p className="text-slate-400 text-[10px] lg:text-xs font-medium">اختر مريضاً لبدء جلسة استشارة ذكية.</p>
              </div>
              <MessageSquare className="w-24 h-24 lg:w-32 lg:h-32 absolute -bottom-8 -left-8 text-white/5" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
               {records.map(r => (
                 <div key={r.id} onClick={() => setActiveSessionPatient(r)} className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-100 hover:border-blue-500 cursor-pointer transition-all flex items-center justify-between group shadow-sm">
                    <div className="flex items-center gap-3 lg:gap-4">
                       <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Activity className="w-5 h-5 lg:w-6 lg:h-6" />
                       </div>
                       <div>
                          <p className="font-black text-sm lg:text-base text-slate-800">{r.name}</p>
                          <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold">{r.diagnosis?.conditionName || 'بانتظار التحليل'}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <Settings 
            settings={settings} 
            setSettings={updateSettings} 
            records={records}
            onImport={(imported) => bulkSaveToSupabase(imported)}
            onSave={() => {
              updateSettings(settings);
              alert('✅ تم حفظ الإعدادات بنجاح.');
            }} 
            onClear={() => {
              if(confirm('سيتم مسح كافة السجلات. هل أنت متأكد؟')) {
                bulkSaveToSupabase([]);
              }
            }} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      settings={settings} 
      onUpdateSettings={updateSettings}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
