
import React from 'react';
import { Plus, Clock, Database, ShieldCheck, Activity, Search, Zap } from 'lucide-react';
import { PatientCase } from '../types';

interface DashboardProps {
  doctorName: string;
  records: PatientCase[];
  onNewCase: () => void;
  onViewAll: () => void;
  activeModel: string;
  isThinking: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ doctorName, records, onNewCase, onViewAll, activeModel, isThinking }) => {
  const recentRecords = records.slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Hero - Premium Design */}
      <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl bg-[#0F172A] p-5 lg:p-8 text-white group">
        <div className="absolute inset-0 opacity-20 transition-transform duration-1000 group-hover:scale-110">
          <img src="https://picsum.photos/seed/hospital/1200/400?blur=2" alt="Medical Background" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 mb-3 lg:mb-4">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-[7px] lg:text-[9px] font-black text-blue-400 uppercase tracking-[0.15em]">نظام الحكيم المطور v4.0</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black mb-3 lg:mb-4 leading-tight tracking-tight">مرحباً دكتور {doctorName.split(' ')[0]}</h2>
            <p className="text-slate-400 text-[10px] lg:text-sm font-medium mb-5 lg:mb-8 leading-relaxed max-w-md">الذكاء الاصطناعي جاهز لتحليل الحالات المعقدة وتوفير الوقت والجهد في التشخيص السريري الدقيق.</p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button 
                onClick={onNewCase}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl lg:rounded-2xl font-black text-xs lg:text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                بدء كشف جديد
              </button>
              <button 
                onClick={onViewAll}
                className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md text-white px-5 py-2.5 rounded-xl lg:rounded-2xl font-black text-xs lg:text-sm hover:bg-white/10 transition-all border border-white/10"
              >
                سجلات المرضى
              </button>
            </div>
          </div>
          <div className="hidden lg:flex w-24 h-24 lg:w-32 lg:h-32 bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <ShieldCheck className="w-12 h-12 lg:w-16 lg:h-16 text-blue-400 relative z-10 transition-transform group-hover:scale-110" />
          </div>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <div className="bg-white p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-50 rounded-lg lg:rounded-xl flex items-center justify-center text-blue-600 mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div>
              <span className="text-xl lg:text-3xl font-black text-slate-900 block mb-0.5">{records.length}</span>
              <span className="text-[7px] lg:text-[9px] text-slate-400 font-black uppercase tracking-widest">إجمالي الحالات المسجلة</span>
            </div>
        </div>
        
        <div className="bg-white p-5 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-50 rounded-lg lg:rounded-xl flex items-center justify-center text-emerald-600 mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div>
              <span className="text-xl lg:text-3xl font-black text-slate-900 block mb-0.5">99.4%</span>
              <span className="text-[7px] lg:text-[9px] text-slate-400 font-black uppercase tracking-widest">دقة التحليل الخوارزمي</span>
            </div>
        </div>

        <div className="lg:col-span-2 bg-[#0F172A] p-5 lg:p-6 rounded-2xl lg:rounded-3xl text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent opacity-50"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[7px] lg:text-[9px] font-black text-blue-400 uppercase tracking-[0.15em] mb-1 lg:mb-1.5">محرك المعالجة النشط</p>
                <h3 className="text-lg lg:text-xl font-black mb-1 lg:mb-1.5">{activeModel.includes('pro') ? 'Gemini 1.5 Pro Elite' : 'Flash Analytics Engine'}</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[7px] lg:text-[9px] text-slate-400 font-black uppercase tracking-widest">جاهز للتحليل الفوري</span>
                </div>
              </div>
              <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400 animate-pulse-soft" />
            </div>
            <div className="relative z-10 mt-5 lg:mt-6 flex gap-1.5">
              <span className="px-2 py-0.5 bg-white/5 rounded-md text-[7px] font-black uppercase border border-white/5">Deep Thinking</span>
              <span className="px-2 py-0.5 bg-white/5 rounded-md text-[7px] font-black uppercase border border-white/5">Multi-Modal</span>
            </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl lg:rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-5 lg:p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm lg:text-base flex items-center gap-2 lg:gap-2.5">
              <Clock className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-blue-600" /> آخر السجلات السريرية
            </h3>
            <button onClick={onViewAll} className="text-[9px] lg:text-[10px] font-black text-blue-600 hover:underline">عرض كافة السجلات</button>
          </div>
          <div className="p-4 lg:p-5 space-y-2.5 lg:space-y-3">
            {recentRecords.length > 0 ? (
              recentRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 lg:p-4 bg-slate-50/50 rounded-xl lg:rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-lg lg:rounded-xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110 ${record.status === 'عاجلة' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                      <Activity className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs lg:text-sm mb-0.5">{record.name}</h4>
                      <div className="flex items-center gap-2 lg:gap-2.5">
                        <span className="text-[8px] lg:text-[9px] text-slate-400 font-bold uppercase">{record.date}</span>
                        <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                        <span className="text-[8px] lg:text-[9px] text-blue-500 font-black uppercase tracking-widest">{record.diagnosis?.conditionName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3">
                    <span className={`text-[7px] lg:text-[8px] px-2.5 lg:px-3 py-1 rounded-full font-black uppercase tracking-widest ${record.status === 'عاجلة' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 lg:py-16 text-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2.5 lg:mb-3">
                  <Database className="w-6 h-6 lg:w-8 lg:h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest">لا توجد سجلات حالية</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 lg:space-y-5">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl lg:rounded-3xl p-5 lg:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 lg:w-28 lg:h-28 bg-white/10 rounded-full -mr-10 -mt-10 lg:-mr-14 lg:-mt-14 blur-2xl lg:blur-3xl"></div>
            <h4 className="text-base lg:text-lg font-black mb-2.5 lg:mb-3 relative z-10">تحديثات النظام</h4>
            <p className="text-blue-100 text-[9px] lg:text-[10px] font-medium leading-relaxed mb-3 lg:mb-4 relative z-10">تم تحديث قاعدة البيانات الطبية لتشمل أحدث البروتوكولات العلاجية لعام 2026.</p>
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/10">
                <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                <span className="text-[8px] font-black uppercase">تحسين سرعة التحليل</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/10">
                <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                <span className="text-[8px] font-black uppercase">دعم الأشعة المقطعية</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm">
            <h4 className="text-slate-900 font-black mb-3 lg:mb-4 flex items-center gap-2 lg:gap-2.5">
              <Zap className="w-4 h-4 lg:w-4.5 lg:h-4.5 text-blue-600" /> إجراءات سريعة
            </h4>
            <div className="grid grid-cols-1 gap-2 lg:gap-2.5">
              <button onClick={onNewCase} className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] transition-all text-right flex items-center justify-between group">
                <span>إضافة حالة طارئة</span>
                <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
              <button onClick={onViewAll} className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] transition-all text-right flex items-center justify-between group">
                <span>تصدير التقارير الأسبوعية</span>
                <Database className="w-3 h-3 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
