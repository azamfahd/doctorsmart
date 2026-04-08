import React, { useState } from 'react';
import { 
  Search, MessageSquare, Trash2, X, 
  Thermometer, Activity, User, Eye, Printer, ChevronLeft,
  AlertCircle, ShieldAlert, CheckCircle2, Clock, HeartPulse, 
  Zap, Pill, Droplets,
  Apple, Dumbbell, LifeBuoy, Plus
} from 'lucide-react';
import { PatientCase } from '../types';

interface RecordsProps {
  records: PatientCase[];
  onStartSession?: (patient: PatientCase) => void;
  onDeleteRecord?: (id: string) => void;
  onNewCase?: () => void;
}

const Records: React.FC<RecordsProps> = ({ records, onStartSession, onDeleteRecord, onNewCase }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('الكل');
  const [selectedRecord, setSelectedRecord] = useState<PatientCase | null>(null);

  const filteredRecords = records.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = r.name.toLowerCase().includes(searchLower);
    const diagnosisMatch = r.diagnosis?.conditionName?.toLowerCase().includes(searchLower) || 
                          r.diagnosis?.summary?.toLowerCase().includes(searchLower);
    const statusMatch = filter === 'الكل' || r.status === filter;
    return (nameMatch || diagnosisMatch) && statusMatch;
  });

  const getStatusConfig = (record: PatientCase) => {
    const status = record.status;
    if (status === 'حرجة') {
      return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', accent: 'bg-rose-600', icon: ShieldAlert, label: 'حالة حرجة' };
    }
    if (status === 'تدخل طبي') {
      return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', accent: 'bg-orange-600', icon: AlertCircle, label: 'تدخل طبي' };
    }
    if (status === 'متابعة') {
      return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', accent: 'bg-blue-600', icon: Clock, label: 'متابعة مستمرة' };
    }
    return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', accent: 'bg-emerald-600', icon: CheckCircle2, label: 'حالة مستقرة' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-['Tajawal'] max-w-7xl mx-auto w-full">
      {/* Detail Modal Overlay */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedRecord(null)}></div>
           <div className="relative bg-[#F8FAFC] w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm">
                <div className="flex items-center gap-4">
                   <button onClick={() => setSelectedRecord(null)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500 hover:bg-rose-50 border border-slate-100 transition-all">
                      <X className="w-5 h-5" />
                   </button>
                   <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">{selectedRecord.name}</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">سجل طبي رقم: {selectedRecord.id.slice(-8)}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2.5">
                   <div className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${getStatusConfig(selectedRecord).bg} ${getStatusConfig(selectedRecord).text} border ${getStatusConfig(selectedRecord).border}`}>
                      {getStatusConfig(selectedRecord).label}
                   </div>
                   <button onClick={() => window.print()} className="p-2.5 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all">
                      <Printer className="w-5 h-5" />
                   </button>
                   <button 
                      onClick={() => {
                        onDeleteRecord?.(selectedRecord.id);
                        setSelectedRecord(null);
                      }} 
                      className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"
                      title="حذف السجل"
                   >
                      <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 no-scrollbar">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                       <section className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-2.5 mb-4">
                             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Zap className="w-5 h-5" /></div>
                             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">التشخيص والملخص</h4>
                          </div>
                          <h5 className="text-2xl font-black text-slate-900 mb-3">{selectedRecord.diagnosis?.conditionName}</h5>
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedRecord.diagnosis?.summary}</p>
                       </section>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                          <div className="bg-blue-50/50 p-6 rounded-2xl lg:rounded-3xl border border-blue-100/50">
                             <h4 className="flex items-center gap-2.5 text-blue-900 font-black text-[10px] uppercase mb-4"><Pill className="w-4 h-4" /> المسار العلاجي</h4>
                             <ul className="space-y-2">
                                {selectedRecord.diagnosis?.treatmentPlan?.map((item, i) => (
                                  <li key={i} className="flex gap-2 text-[11px] font-bold text-slate-700 leading-relaxed">• {item}</li>
                                ))}
                             </ul>
                          </div>
                          <div className="bg-emerald-50/50 p-6 rounded-2xl lg:rounded-3xl border border-emerald-100/50">
                             <h4 className="flex items-center gap-2.5 text-emerald-900 font-black text-[10px] uppercase mb-4"><Apple className="w-4 h-4" /> التغذية العلاجية</h4>
                             <ul className="space-y-2">
                                {selectedRecord.diagnosis?.dietaryAdvice?.map((item, i) => (
                                  <li key={i} className="flex gap-2 text-[11px] font-bold text-slate-700 leading-relaxed">• {item}</li>
                                ))}
                             </ul>
                          </div>
                          <div className="bg-orange-50/50 p-6 rounded-2xl lg:rounded-3xl border border-orange-100/50">
                             <h4 className="flex items-center gap-2.5 text-orange-900 font-black text-[10px] uppercase mb-4"><Dumbbell className="w-4 h-4" /> التأهيل البدني</h4>
                             <ul className="space-y-2">
                                {selectedRecord.diagnosis?.physicalTherapy?.map((item, i) => (
                                  <li key={i} className="flex gap-2 text-[11px] font-bold text-slate-700 leading-relaxed">• {item}</li>
                                ))}
                             </ul>
                          </div>
                          <div className="bg-indigo-50/50 p-6 rounded-2xl lg:rounded-3xl border border-indigo-100/50">
                             <h4 className="flex items-center gap-2.5 text-indigo-900 font-black text-[10px] uppercase mb-4"><LifeBuoy className="w-4 h-4" /> جودة الحياة</h4>
                             <ul className="space-y-2">
                                {selectedRecord.diagnosis?.lifestyleChanges?.map((item, i) => (
                                  <li key={i} className="flex gap-2 text-[11px] font-bold text-slate-700 leading-relaxed">• {item}</li>
                                ))}
                             </ul>
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                       <section className="bg-white border border-slate-100 p-6 rounded-2xl lg:rounded-3xl shadow-sm space-y-6">
                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">المؤشرات الحيوية للجلسة</h4>
                          <div className="grid grid-cols-2 gap-3">
                             {[
                                { label: 'الحرارة', val: `${selectedRecord.vitals.temperature}°C`, icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50' },
                                { label: 'الضغط', val: selectedRecord.vitals.bloodPressure, icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50' },
                                { label: 'النبض', val: selectedRecord.vitals.pulse, icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-50' },
                                { label: 'الأكسجين', val: `${selectedRecord.vitals.spo2}%`, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' }
                             ].map((v, i) => {
                                const Icon = v.icon;
                                return (
                                <div key={i} className={`${v.bg} p-3 rounded-xl flex flex-col items-center text-center border border-white`}>
                                   <Icon className={`w-4 h-4 ${v.color} mb-1.5`} />
                                   <span className="text-sm font-black text-slate-800">{v.val}</span>
                                   <span className="text-[7px] text-slate-400 font-black uppercase mt-0.5">{v.label}</span>
                                </div>
                              )})}
                          </div>
                       </section>

                       <section className="bg-[#0F172A] p-6 rounded-2xl lg:rounded-3xl text-white shadow-xl">
                          <div className="flex items-center gap-2 mb-4">
                             <User className="w-4 h-4 text-blue-400" />
                             <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">تفاصيل المريض</h4>
                          </div>
                          <div className="space-y-3">
                             <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                                <span className="text-[11px] font-bold text-slate-400">العمر</span>
                                <span className="text-[11px] font-black">{selectedRecord.age} سنة</span>
                             </div>
                             <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                                <span className="text-[11px] font-bold text-slate-400">الجنس</span>
                                <span className="text-[11px] font-black">{selectedRecord.gender}</span>
                             </div>
                             <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                                <span className="text-[11px] font-bold text-slate-400">تاريخ الفحص</span>
                                <span className="text-[11px] font-black">{selectedRecord.date}</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => { onStartSession?.(selectedRecord); setSelectedRecord(null); }}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/20"
                          >
                             <MessageSquare className="w-3.5 h-3.5" /> فتح الاستشارة الذكية
                          </button>
                       </section>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">سجلات المرضى</h2>
          <p className="text-slate-400 text-xs font-medium">إدارة ومراجعة كافة التقارير الطبية المسجلة في النظام.</p>
        </div>
        <button 
          onClick={onNewCase}
          className="flex items-center justify-center gap-2.5 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 group"
        >
          <Plus className="w-4.5 h-4.5 transition-transform group-hover:rotate-90" />
          إضافة سجل جديد
        </button>
      </div>

      {/* Main List UI - Simplified for space */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في الأرشيف الطبي..."
            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-50 rounded-xl py-3 pr-12 pl-5 outline-none transition-all font-bold text-slate-700 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {['الكل', 'حرجة', 'تدخل طبي', 'متابعة', 'مستقرة'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black whitespace-nowrap transition-all border-2 ${
                filter === f ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRecords.map((record) => {
          const cfg = getStatusConfig(record);
          return (
            <div 
              key={record.id} 
              onClick={() => setSelectedRecord(record)}
              className="bg-white p-5 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 ${cfg.bg} rounded-xl flex items-center justify-center border ${cfg.border} transition-transform group-hover:scale-105`}>
                   {React.createElement(cfg.icon, { className: `w-6 h-6 ${cfg.text}` })}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">{record.name}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                       {cfg.label}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-3">
                    <span>{record.diagnosis?.conditionName}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span>{record.date}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="flex gap-1.5">
                    <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Eye className="w-4.5 h-4.5" /></button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteRecord?.(record.id); }}
                      className="p-2.5 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                    ><Trash2 className="w-4.5 h-4.5" /></button>
                 </div>
                 <ChevronLeft className={`w-5 h-5 ${cfg.text} group-hover:-translate-x-1.5 transition-transform`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Records;
