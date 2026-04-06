
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Activity, Thermometer, Droplets, HeartPulse, Trash, 
  ImagePlus, FileSearch
} from 'lucide-react';
import { PatientCase, VitalSigns } from '../types';

interface DiagnosisProps {
  onAnalyze: (data: Partial<PatientCase>) => void;
  isAnalyzing: boolean;
}

const Diagnosis: React.FC<DiagnosisProps> = ({ onAnalyze, isAnalyzing }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [symptoms, setSymptoms] = useState('');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [vitals, setVitals] = useState<VitalSigns>({
    bloodPressure: '',
    pulse: '',
    temperature: '',
    spo2: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "بدء المسح السريري...", 
    "تحليل المؤشرات الحيوية...", 
    "معالجة البيانات البصرية...", 
    "توليد التقرير التشخيصي...",
    "مراجعة البروتوكولات الطبية..."
  ];

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => setAnalysisStep(prev => (prev + 1) % steps.length), 2500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleSubmit = () => {
    if (!name || !symptoms) {
      alert("يرجى إكمال البيانات الأساسية (الاسم والأعراض).");
      return;
    }
    onAnalyze({ name, age, gender, symptoms, vitals, images: images.length > 0 ? images : undefined });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      const newImages = await Promise.all(
        files.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                  }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
              };
              img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
          });
        })
      );
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      {isAnalyzing && (
        <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-8 h-8 text-blue-400 animate-pulse-soft" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-3 tracking-tight">جاري التحليل السريري الذكي</h2>
          <div className="max-w-[200px] w-full bg-white/5 h-1 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}></div>
          </div>
          <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">{steps[analysisStep]}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-6">
        <div className="p-5 lg:p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                 <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight">وحدة التشخيص المتطورة</h2>
                 <p className="text-[7px] text-slate-400 font-black uppercase tracking-[0.3em] mt-0.5">Diagnostic Intelligence Engine v4.0</p>
              </div>
           </div>
           <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-md border border-emerald-100">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">النظام نشط</span>
           </div>
        </div>

        <div className="p-5 lg:p-6 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 pr-2 uppercase tracking-widest">اسم المريض الكامل</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-xl px-3.5 py-2.5 outline-none font-black text-xs transition-all text-slate-800 placeholder:text-slate-300" 
                placeholder="أدخل الاسم هنا..." 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 pr-2 uppercase tracking-widest">العمر (سنوات)</label>
              <input 
                type="number" 
                value={age} 
                onChange={e => setAge(e.target.value)} 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-xl px-3.5 py-2.5 outline-none font-black text-xs transition-all text-slate-800 placeholder:text-slate-300" 
                placeholder="00" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 pr-2 uppercase tracking-widest">الجنس السريري</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setGender('ذكر')} 
                  className={`flex-1 py-2.5 rounded-xl font-black text-[10px] transition-all border-2 ${gender === 'ذكر' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}
                >
                  ذكر
                </button>
                <button 
                  onClick={() => setGender('أنثى')} 
                  className={`flex-1 py-2.5 rounded-xl font-black text-[10px] transition-all border-2 ${gender === 'أنثى' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}
                >
                  أنثى
                </button>
              </div>
            </div>
          </div>

          {/* Symptoms Area */}
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-400 pr-2 uppercase tracking-widest">وصف الأعراض والتاريخ المرضي</label>
            <textarea 
              value={symptoms} 
              onChange={e => setSymptoms(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-xl p-4 h-28 outline-none font-bold text-xs text-slate-700 resize-none leading-relaxed transition-all placeholder:text-slate-300" 
              placeholder="يرجى كتابة الأعراض، مدتها، وأي ملاحظات سريرية أخرى بالتفصيل..."
            />
          </div>

          {/* Vitals Grid */}
          <div className="space-y-3">
            <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">المؤشرات الحيوية الحالية</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { label: 'الحرارة', icon: Thermometer, key: 'temperature', unit: '°C', color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'الضغط', icon: HeartPulse, key: 'bloodPressure', unit: 'mmHg', color: 'text-rose-500', bg: 'bg-rose-50' },
                { label: 'النبض', icon: Activity, key: 'pulse', unit: 'BPM', color: 'text-cyan-500', bg: 'bg-cyan-50' },
                { label: 'الأكسجين', icon: Droplets, key: 'spo2', unit: '%', color: 'text-blue-500', bg: 'bg-blue-50' }
              ].map((v) => {
                const Icon = v.icon;
                return (
                <div key={v.key} className={`${v.bg} p-3 rounded-xl border border-white shadow-sm group hover:scale-105 transition-transform`}>
                   <div className={`flex items-center gap-1 ${v.color} mb-1.5`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[7px] font-black uppercase tracking-widest">{v.label}</span>
                   </div>
                   <div className="flex items-end gap-1">
                     <input 
                       value={(vitals as any)[v.key]} 
                       onChange={e => setVitals({...vitals, [v.key]: e.target.value})}
                       className="bg-transparent border-none outline-none font-black text-slate-900 text-lg w-full placeholder:text-slate-300" 
                       placeholder="--" 
                     />
                     <span className="text-[7px] font-black text-slate-400 mb-1">{v.unit}</span>
                   </div>
                </div>
              )})}
            </div>
          </div>

          {/* Image Uploader */}
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-400 pr-2 uppercase tracking-widest">الصور الطبية والتقارير المرفقة</label>
            <div 
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer group" 
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <ImagePlus className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-[10px] font-black text-slate-600 mb-0.5">أرفق صور الأشعة أو التقارير</p>
              <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">JPG, PNG حتى 10 ميجابايت</p>
              <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleImageChange} />
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group/img aspect-square rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm">
                    <img src={img} className="w-full h-full object-cover" alt={`doc-${idx}`} />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }} 
                      className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button 
              disabled={isAnalyzing || !name}
              onClick={handleSubmit}
              className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] group"
            >
              <Sparkles className="w-4.5 h-4.5 text-blue-400 group-hover:rotate-12 transition-transform" />
              بدء التحليل السريري الفوري
            </button>
            <p className="text-center text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-3">يتم معالجة البيانات وفقاً لمعايير الخصوصية الطبية العالمية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;
