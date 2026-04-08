
import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, CheckCircle2, ChevronDown,
  Pill, ShieldCheck, 
  Activity, Zap, BarChart3, Microscope, Target, Volume2, Printer, Square, UserCog,
  Apple, Dumbbell, LifeBuoy, HeartPulse, AlertOctagon, Image as ImageIcon, Stethoscope, FileText
} from 'lucide-react';
import { StructuredDiagnosis } from '../types';
import { generateSpeech } from '../services/geminiService';

interface AIResultProps {
  diagnosis: StructuredDiagnosis;
  sources?: any[];
  patientName: string;
  patientGender: string;
  onClose: () => void;
}

const AIResult: React.FC<AIResultProps> = ({ diagnosis, patientName, onClose }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const severityColors: any = {
    'حرجة': 'bg-rose-600',
    'مرتفعة': 'bg-orange-600',
    'متوسطة': 'bg-blue-600',
    'منخفضة': 'bg-emerald-600'
  };

  const handleListen = async () => {
    if (isSpeaking) {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      setIsSpeaking(false);
      return;
    }
    try {
      setIsSpeaking(true);
      const speechText = `تقرير المريض ${patientName}. التشخيص المقترح هو ${diagnosis.conditionName}. ملخص السريري: ${diagnosis.summary}. يرجى مراجعة الخطة العلاجية والتوصيات الغذائية المذكورة في التقرير.`;
      const base64Audio = await generateSpeech(speechText);
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = ctx;
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      audioSourceRef.current = source;
      source.start();
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const CollapsibleSection = ({ title, icon: Icon, items, colorClass, bgColor, defaultOpen = false }: any) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className={`rounded-xl lg:rounded-2xl border shadow-sm transition-all duration-300 ${bgColor} ${colorClass} overflow-hidden`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 lg:p-5 flex items-center justify-between hover:bg-black/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg lg:rounded-xl bg-white/60 backdrop-blur-md border border-white/30 shadow-sm`}>
              <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </div>
            <h4 className="font-black text-[10px] lg:text-[11px] uppercase tracking-[0.15em]">{title}</h4>
          </div>
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>
        
        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="p-4 lg:p-5 pt-0 border-t border-black/5">
              <ul className="space-y-2 lg:space-y-2.5 mt-3">
                {items && items.length > 0 ? items.map((item: string, i: number) => (
                  <li key={i} className="flex gap-2 text-[10px] lg:text-[12px] font-bold leading-relaxed opacity-90">
                     <div className="w-1 h-1 rounded-full bg-current shrink-0 mt-1.5 opacity-40"></div>
                     <span>{item}</span>
                  </li>
                )) : <li className="text-[9px] opacity-50 italic">لا توجد توصيات محددة</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F8FAFC] w-full min-h-full relative lg:rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500 font-['Tajawal'] shrink-0">
      {/* Dynamic Header */}
      <div className={`${severityColors[diagnosis.severity] || 'bg-blue-600'} p-5 lg:p-10 text-white relative overflow-hidden`}>
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100" stroke="white" fill="transparent" strokeWidth="0.5" />
            <path d="M0 50 C 50 100 80 0 100 50" stroke="white" fill="transparent" strokeWidth="0.5" />
            <path d="M0 0 C 30 100 70 100 100 0" stroke="white" fill="transparent" strokeWidth="0.5" />
          </svg>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-[100px] lg:blur-[120px] -mr-32 -mt-32 lg:-mr-48 lg:-mt-48"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8 lg:mb-12">
             <button onClick={onClose} className="p-2 lg:p-3 bg-white/10 hover:bg-white/20 rounded-xl lg:rounded-2xl transition-all backdrop-blur-md border border-white/10"><ChevronLeft className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 rotate-180" /></button>
             <div className="flex gap-2 lg:gap-2.5">
                <button onClick={handleListen} className="px-3.5 lg:px-5 py-2 lg:py-3 bg-white/10 hover:bg-white/20 rounded-xl lg:rounded-2xl flex items-center gap-2 lg:gap-2.5 text-[9px] lg:text-[10px] font-black transition-all backdrop-blur-md border border-white/10 uppercase tracking-widest">
                   {isSpeaking ? <Square className="w-3 h-3 lg:w-3.5 lg:h-3.5 fill-current" /> : <Volume2 className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
                   {isSpeaking ? 'إيقاف' : 'استماع'}
                </button>
                <button onClick={() => window.print()} className="p-2 lg:p-3 bg-white/10 hover:bg-white/20 rounded-xl lg:rounded-2xl transition-all backdrop-blur-md border border-white/10"><Printer className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5" /></button>
             </div>
          </div>
          <div className="max-w-4xl mx-auto text-center">
             <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/10 rounded-full text-[7px] lg:text-[9px] font-black uppercase tracking-[0.2em] mb-5 lg:mb-6 backdrop-blur-md border border-white/10">
                <ShieldCheck className="w-3 h-3 text-blue-200" /> تحليل طبي متقدم
             </div>
             <h2 className="text-2xl lg:text-4xl font-black mb-3 lg:mb-5 tracking-tight leading-tight drop-shadow-2xl">{diagnosis.conditionName}</h2>
             <div className="flex flex-wrap justify-center items-center gap-2.5 lg:gap-6 text-[9px] lg:text-xs font-bold opacity-90">
               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg lg:rounded-xl border border-white/5">
                 <Target className="w-3 h-3" /> دقة التحليل: {diagnosis.confidenceScore}%
               </span>
               <span className="w-1 h-1 bg-white/30 rounded-full hidden sm:block"></span>
               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg lg:rounded-xl border border-white/5">
                 <UserCog className="w-3 h-3" /> المريض: {patientName}
               </span>
               <span className="w-1 h-1 bg-white/30 rounded-full hidden sm:block"></span>
               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg lg:rounded-xl border border-white/5 uppercase tracking-widest">
                 <Activity className="w-3 h-3" /> الخطورة: {diagnosis.severity}
               </span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 -mt-6 lg:-mt-8 pb-12 lg:pb-20 space-y-5 lg:space-y-6 relative z-20">
        
        {/* Clinical Summary & Differential */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
           <div className="lg:col-span-2 bg-white rounded-xl lg:rounded-3xl p-5 lg:p-8 shadow-xl border border-slate-100 flex flex-col justify-between group hover:border-blue-100 transition-all duration-500">
              <div>
                <div className="flex items-center gap-2.5 lg:gap-3 mb-5 lg:mb-6">
                  <div className="p-2 lg:p-2.5 bg-blue-50 rounded-xl lg:rounded-2xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                    <FileText className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5" />
                  </div>
                  <h3 className="font-black text-sm lg:text-base text-slate-800 uppercase tracking-widest">التحليل الطبي المفصل</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-[11px] lg:text-sm text-slate-700 leading-[1.8] font-medium">
                    <strong className="text-blue-700 block mb-1">الملخص السريع:</strong>
                    {diagnosis.summary}
                  </p>
                  {diagnosis.detailedAnalysis && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="text-slate-800 block mb-2 text-xs">الفسيولوجيا المرضية (Clinical Pathophysiology):</strong>
                      <p className="text-[11px] lg:text-sm text-slate-600 leading-[1.8] font-medium">
                        {diagnosis.detailedAnalysis}
                      </p>
                    </div>
                  )}
                  {diagnosis.labResultsAnalysis && (
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mt-4">
                      <strong className="text-blue-800 block mb-2 text-xs">تحليل المؤشرات الحيوية والمخبرية:</strong>
                      <p className="text-[11px] lg:text-sm text-blue-700 leading-[1.8] font-medium">
                        {diagnosis.labResultsAnalysis}
                      </p>
                    </div>
                  )}
                  {diagnosis.severityReasoning && (
                    <div className={`p-4 rounded-xl border ${severityColors[diagnosis.severity]?.replace('bg-', 'bg-opacity-10 border-') || 'bg-slate-50 border-slate-100'}`}>
                      <strong className={`block mb-1 text-xs ${severityColors[diagnosis.severity]?.replace('bg-', 'text-') || 'text-slate-800'}`}>
                        مبررات مستوى الخطورة ({diagnosis.severity}):
                      </strong>
                      <p className="text-[11px] lg:text-sm text-slate-700 leading-[1.6] font-medium">
                        {diagnosis.severityReasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {diagnosis.urgentWarnings && diagnosis.urgentWarnings.length > 0 && (
                <div className="mt-6 lg:mt-8 p-4 lg:p-5 bg-rose-50 border border-rose-100 rounded-xl lg:rounded-2xl flex items-start gap-2.5 lg:gap-3 shadow-sm">
                  <div className="p-1.5 bg-white rounded-lg lg:rounded-xl shadow-sm">
                    <AlertOctagon className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 text-rose-500 shrink-0" />
                  </div>
                  <div>
                    <h5 className="text-[8px] lg:text-[10px] font-black text-rose-700 uppercase tracking-widest mb-1 lg:mb-1">تحذيرات عاجلة</h5>
                    <ul className="text-[9px] lg:text-[11px] text-rose-600 font-bold space-y-1 lg:space-y-1">
                      {diagnosis.urgentWarnings.map((w, i) => <li key={i} className="flex items-center gap-1.5"><div className="w-1 h-1 bg-rose-400 rounded-full"></div> {w}</li>)}
                    </ul>
                  </div>
                </div>
              )}
           </div>

           <div className="space-y-5 lg:space-y-6">
             {diagnosis.specialistReferral && (
               <div className="bg-indigo-50 rounded-xl lg:rounded-3xl p-5 lg:p-6 shadow-sm border border-indigo-100">
                 <div className="flex items-center gap-2.5 mb-3">
                   <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm">
                     <Stethoscope className="w-4.5 h-4.5" />
                   </div>
                   <h3 className="font-black text-xs lg:text-sm text-indigo-900 uppercase tracking-widest">التوجيه الطبي</h3>
                 </div>
                 <p className="text-[11px] lg:text-sm text-indigo-800 font-bold leading-relaxed">
                   {diagnosis.specialistReferral}
                 </p>
               </div>
             )}

             <div className="bg-white rounded-xl lg:rounded-3xl p-5 lg:p-6 shadow-xl border border-slate-100 group hover:border-amber-100 transition-all duration-500">
                <div className="flex items-center gap-2.5 lg:gap-3 mb-5 lg:mb-6">
                  <div className="p-2 lg:p-2.5 bg-amber-50 rounded-xl lg:rounded-2xl text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5" />
                  </div>
                  <h3 className="font-black text-xs lg:text-sm text-slate-800 uppercase tracking-widest">الاحتمالات البديلة</h3>
                </div>
                <div className="space-y-2.5 lg:space-y-3">
                  {diagnosis.differentialDiagnosis.map((item, i) => (
                    <div key={i} className="p-3.5 lg:p-4 bg-slate-50 rounded-xl lg:rounded-2xl border border-slate-100 group/item hover:bg-white hover:border-amber-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="font-black text-slate-800 text-[10px] lg:text-[13px]">{item.condition}</p>
                        <span className="text-[8px] lg:text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 lg:px-2 lg:py-0.5 rounded-lg border border-amber-100">{item.probability}%</span>
                      </div>
                      <p className="text-[9px] lg:text-[10px] text-slate-500 font-bold leading-relaxed">{item.reasoning}</p>
                    </div>
                  ))}
                </div>
             </div>
           </div>
        </div>

        {/* Image Findings (If any) */}
        {diagnosis.imageFindings && (
          <div className="bg-white rounded-xl lg:rounded-3xl p-5 lg:p-8 shadow-xl border border-purple-100">
            <div className="flex items-center gap-2.5 lg:gap-3 mb-4">
              <div className="p-2 lg:p-2.5 bg-purple-50 rounded-xl lg:rounded-2xl text-purple-600 shadow-sm">
                <ImageIcon className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5" />
              </div>
              <h3 className="font-black text-sm lg:text-base text-slate-800 uppercase tracking-widest">تحليل الصور والتقارير المرفقة</h3>
            </div>
            <p className="text-[11px] lg:text-sm text-slate-700 leading-[1.8] font-medium bg-purple-50/30 p-4 rounded-xl border border-purple-50">
              {diagnosis.imageFindings}
            </p>
          </div>
        )}

        {/* Integrated Medical Plan Grid */}
        <h3 className="text-center text-lg font-black text-slate-800 pt-6 flex items-center justify-center gap-3">
          <div className="h-[1.5px] w-10 bg-slate-200"></div>
          خطة الرعاية الطبية المتكاملة
          <div className="h-[1.5px] w-10 bg-slate-200"></div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CollapsibleSection 
            title="المسار العلاجي" 
            icon={Pill} 
            items={diagnosis.treatmentPlan} 
            colorClass="text-blue-800 border-blue-100" 
            bgColor="bg-blue-50/50" 
            defaultOpen={true}
          />
          <CollapsibleSection 
            title="التغذية العلاجية" 
            icon={Apple} 
            items={diagnosis.dietaryAdvice} 
            colorClass="text-emerald-800 border-emerald-100" 
            bgColor="bg-emerald-50/50" 
            defaultOpen={true}
          />
          <CollapsibleSection 
            title="التأهيل البدني" 
            icon={Dumbbell} 
            items={diagnosis.physicalTherapy} 
            colorClass="text-orange-800 border-orange-100" 
            bgColor="bg-orange-50/50" 
          />
          <CollapsibleSection 
            title="نمط الحياة" 
            icon={LifeBuoy} 
            items={diagnosis.lifestyleChanges} 
            colorClass="text-indigo-800 border-indigo-100" 
            bgColor="bg-indigo-50/50" 
          />
        </div>

        {/* Diagnostics & Prevention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3">
           <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2.5 mb-5 text-slate-700">
                <Microscope className="w-4.5 h-4.5" />
                <h4 className="font-black text-[10px] lg:text-[11px] uppercase tracking-widest">فحوصات وتحاليل مقترحة</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                 {diagnosis.suggestedTests?.map((test, i) => (
                   <div key={i} className="flex items-center gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {test}
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2.5 mb-5 text-slate-700">
                <HeartPulse className="w-4.5 h-4.5" />
                <h4 className="font-black text-[10px] lg:text-[11px] uppercase tracking-widest">نصائح الوقاية العامة</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                 {diagnosis.preventionTips?.map((tip, i) => (
                   <div key={i} className="flex items-center gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-600">
                      <Target className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      {tip}
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Final Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 lg:gap-3.5 pt-6 lg:pt-10">
           <button 
             onClick={onClose} 
             className="flex-1 bg-slate-900 hover:bg-black text-white py-3.5 lg:py-5 rounded-xl lg:rounded-2xl font-black text-sm lg:text-base shadow-2xl transition-all active:scale-[0.98]"
           >
             حفظ وإغلاق التقرير
           </button>
           <button 
             onClick={() => window.print()} 
             className="px-6 lg:px-10 bg-white border-2 border-slate-100 py-3.5 lg:py-5 rounded-xl lg:rounded-2xl font-black text-slate-600 text-sm lg:text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2 lg:gap-2.5"
           >
             <Printer className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5" /> طباعة التقرير
           </button>
        </div>
        
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] py-8">
          إخلاء مسؤولية: هذا التحليل استرشادي مدعوم بالذكاء الاصطناعي ويجب مراجعة طبيب متخصص.
        </p>
      </div>
    </div>
  );
};

export default AIResult;
