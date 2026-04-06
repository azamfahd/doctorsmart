
import { createClient } from '@supabase/supabase-js';

// استخدام القيم التي قدمتها كقيم افتراضية في حال عدم وجود متغيرات البيئة
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cjnxmiiymcwhxvkdhqwp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__Qx8BMqta8ubjA24OlfzXg_ev_y6fAt';

// التأكد من أن الرابط يبدأ بـ http لتجنب أخطاء التهيئة
const validUrl = supabaseUrl?.startsWith('http') ? supabaseUrl : 'https://cjnxmiiymcwhxvkdhqwp.supabase.co';

export const supabase = createClient(validUrl, supabaseAnonKey);
