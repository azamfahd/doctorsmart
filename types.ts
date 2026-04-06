
export enum AIPersonality {
  SIMPLE = 'مبسط للمريض',
  TECHNICAL = 'تقني للمتخصصين',
  EMPATHETIC = 'متعاطف وداعم'
}

export enum ModelType {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3.1-pro-preview',
  LITE = 'gemini-3.1-flash-lite-preview',
  IMAGE_PRO = 'gemini-3-pro-image-preview',
  AUDIO_NATIVE = 'gemini-3.1-flash-live-preview'
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export interface VitalSigns {
  bloodPressure: string;
  pulse: string;
  temperature: string;
  spo2: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface DifferentialDiagnosis {
  condition: string;
  probability: number;
  reasoning: string;
}

export interface StructuredDiagnosis {
  summary: string;
  conditionName: string;
  severity: 'منخفضة' | 'متوسطة' | 'مرتفعة' | 'حرجة';
  confidenceScore: number;
  differentialDiagnosis: DifferentialDiagnosis[];
  recommendations: string[];
  suggestedTests: string[];
  urgentWarnings: string[];
  treatmentPlan: string[];
  dietaryAdvice: string[];
  physicalTherapy: string[];
  lifestyleChanges: string[];
  preventionTips: string[];
  generalInfo: string;
  labResultsAnalysis?: string;
}

export interface PatientCase {
  id: string;
  name: string;
  age: string;
  gender: 'ذكر' | 'أنثى';
  symptoms: string;
  vitals: VitalSigns;
  images?: string[];
  diagnosis?: StructuredDiagnosis;
  chatHistory?: ChatMessage[];
  date: string;
  status: 'عادية' | 'متابعة' | 'عاجلة';
}

export interface SystemSettings {
  centerName: string;
  doctorName: string;
  personality: AIPersonality;
  model: ModelType;
  deepThinking: boolean;
  thinkingBudget: number; // قيمة رقمية لميزانية التفكير
  googleSearch: boolean; // تفعيل البحث في جوجل
  theme: ThemeMode;
  autoSave: boolean;
  voiceEnabled: boolean;
  voiceOutputEnabled: boolean;
  apiKey?: string;
}
