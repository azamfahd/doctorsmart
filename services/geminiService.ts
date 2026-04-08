
import { GoogleGenAI, GenerateContentResponse, Type, Chat, Modality } from "@google/genai";
import { SystemSettings, PatientCase, StructuredDiagnosis, ModelType } from '../types.ts';

const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const getAI = (settings?: SystemSettings) => {
  let apiKey = settings?.apiKey || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

const getModelSpecificInstructions = (model: ModelType, personality: string): string => {
  const baseInstruction = `أنت لست مجرد ذكاء اصطناعي، بل أنت "كبير الأطباء الاستشاريين" (Chief Medical Consultant). أسلوبك: ${personality}. 
يجب أن تفكر كطبيب بشري خبير يطبق منهجية "الطب القائم على الدليل" (Evidence-Based Medicine). 
قم بتحليل الحالة السريرية بعمق، واربط الأعراض بالمؤشرات الحيوية لاستنتاج الفسيولوجيا المرضية. لا تقدم إجابات عامة، بل تشخيصاً دقيقاً ومخصصاً لهذه الحالة بالذات. يجب أن يكون الرد بتنسيق JSON حصرياً.`;

  switch (model) {
    case ModelType.PRO:
      return `${baseInstruction}
      تخصصك: استشاري أول في الطب الباطني والحالات المعقدة (Internal Medicine & Complex Cases).
      مطلوب منك: الغوص بعمق في الفسيولوجيا المرضية (Pathophysiology)، استبعاد الأمراض النادرة عبر التشخيص التفريقي (Differential Diagnosis)، تقديم تحليل استدلالي معقد يربط كل عرض بسبب جذري محتمل، وتبرير مستوى الخطورة بناءً على أحدث البروتوكولات الطبية العالمية.`;
    
    case ModelType.IMAGE_PRO:
      return `${baseInstruction}
      تخصصك: استشاري أشعة تشخيصية وطب سريري (Diagnostic Radiology & Clinical Medicine).
      مطلوب منك: التركيز بشكل مكثف على أي صور مرفقة. قم بوصف التغيرات المورفولوجية بدقة، تحديد التشوهات، وربط المكتشفات الشعاعية/البصرية بالأعراض السريرية والمؤشرات الحيوية لتقديم تشخيص متكامل.`;
    
    case ModelType.LITE:
      return `${baseInstruction}
      تخصصك: استشاري طب الطوارئ والفرز الطبي (Emergency Medicine & Triage).
      مطلوب منك: التقييم السريع والحاسم للحالة، تحديد العلامات الحمراء (Red Flags) فوراً، تقديم خطوات إنقاذ حياة أو توجيهات عاجلة بأقصر وأوضح العبارات، والتركيز على استقرار المريض.`;
    
    case ModelType.AUDIO_NATIVE:
      return `${baseInstruction}
      تخصصك: استشاري طب الأسرة والتواصل السريري (Family Medicine & Clinical Communication).
      مطلوب منك: تحليل الأعراض المذكورة بعناية فائقة، التركيز على الحالة العامة للمريض من منظور شمولي (Holistic approach)، وتقديم خطة رعاية تركز على جودة الحياة والدعم الشامل.`;
    
    case ModelType.FLASH:
    default:
      return `${baseInstruction}
      تخصصك: أخصائي طب عام (General Practitioner).
      مطلوب منك: تقديم تقييم سريري شامل ومتوازن، وضع خطة علاجية قياسية مبنية على الأدلة، وتوجيه المريض للخطوات العملية التالية بوضوح.`;
  }
};

const getModelSpecificPrompt = (model: ModelType, patientData: Partial<PatientCase>, thinkingBudget: number, isThinkingEnabled: boolean): string => {
  let basePrompt = `
    [ملف طبي إلكتروني - EMR]
    البيانات الديموغرافية:
    - الاسم: ${patientData.name} | العمر: ${patientData.age} | الجنس: ${patientData.gender}
    
    الشكوى الرئيسية وتاريخ المرض (Chief Complaint & HPI):
    - ${patientData.symptoms}
    
    الفحص السريري والمؤشرات الحيوية (Objective Vitals):
    - ضغط الدم: ${patientData.vitals?.bloodPressure}
    - معدل النبض: ${patientData.vitals?.pulse}
    - درجة الحرارة: ${patientData.vitals?.temperature}
    - نسبة تشبع الأكسجين: ${patientData.vitals?.spo2}
  `;

  let detailLevelInstruction = "";
  if (isThinkingEnabled) {
    if (thinkingBudget <= 8000) {
      detailLevelInstruction = "\n[توجيه سريري: قدم خلاصة طبية مركزة وموجزة. ركز على التشخيص النهائي وأهم خطوتين في العلاج فقط].";
    } else if (thinkingBudget <= 16000) {
      detailLevelInstruction = "\n[توجيه سريري: قدم تقريراً طبياً متوازناً يشمل التشخيص، الأسباب المحتملة، وخطة علاجية واضحة].";
    } else if (thinkingBudget <= 24000) {
      detailLevelInstruction = "\n[توجيه سريري: قدم استشارة طبية مفصلة. اشرح الآلية المرضية (Pathophysiology) التي تربط الأعراض بالمؤشرات الحيوية، وتوسع في الخطة العلاجية والبدائل].";
    } else {
      detailLevelInstruction = "\n[توجيه سريري: قدم تقريراً طبياً استشارياً شاملاً وموسوعياً بأقصى درجات التفصيل. قم بتحليل كل عرض، ناقش كل تشخيص تفريقي مع احتماليته، وبرر كل خطوة علاجية أو فحص مقترح بناءً على الأدلة الطبية].";
    }
  }

  switch (model) {
    case ModelType.PRO:
      return basePrompt + detailLevelInstruction + `\nالرجاء إجراء تحليل طبي استدلالي عميق. قم بربط العمر والجنس بالأعراض لتضييق الاحتمالات، استكشف الاحتمالات النادرة، وقدم مبررات علمية دقيقة لكل تشخيص تفريقي.`;
    case ModelType.IMAGE_PRO:
      return basePrompt + detailLevelInstruction + `\nالرجاء فحص الصور المرفقة بدقة سريرية. استخرج أي علامات مرضية مرئية، وادمجها مع الفحص السريري والأعراض للوصول لتشخيص دقيق في قسم (imageFindings).`;
    case ModelType.LITE:
      return basePrompt + detailLevelInstruction + `\nالرجاء إجراء فرز سريع (Triage). حدد مستوى الخطورة فوراً، وأبرز أي تحذيرات عاجلة (urgentWarnings) تتطلب تدخلاً طبياً طارئاً.`;
    default:
      return basePrompt + detailLevelInstruction + `\nالرجاء إجراء تحليل طبي شامل، تقييم الخطورة السريرية، ووضع خطة رعاية متكاملة.`;
  }
};

export const analyzeMedicalCase = async (
  patientData: Partial<PatientCase>,
  settings: SystemSettings
): Promise<{ diagnosis: StructuredDiagnosis, sources: any[] }> => {
  try {
    const ai = getAI(settings);
    
    const systemInstruction = getModelSpecificInstructions(settings.model, settings.personality);
    const prompt = getModelSpecificPrompt(settings.model, patientData, settings.thinkingBudget, settings.deepThinking);

    const parts: any[] = [{ text: prompt }];
    if (patientData.images && patientData.images.length > 0) {
      patientData.images.forEach(img => {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: img.split(',')[1]
          }
        });
      });
    }

    const config: any = {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          conditionName: { type: Type.STRING },
          summary: { type: Type.STRING },
          detailedAnalysis: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["منخفضة", "متوسطة", "مرتفعة", "حرجة"] },
          severityReasoning: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
          imageFindings: { type: Type.STRING },
          specialistReferral: { type: Type.STRING },
          differentialDiagnosis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                condition: { type: Type.STRING },
                probability: { type: Type.NUMBER },
                reasoning: { type: Type.STRING }
              }
            }
          },
          treatmentPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          dietaryAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
          physicalTherapy: { type: Type.ARRAY, items: { type: Type.STRING } },
          lifestyleChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedTests: { type: Type.ARRAY, items: { type: Type.STRING } },
          urgentWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          preventionTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          generalInfo: { type: Type.STRING },
          labResultsAnalysis: { type: Type.STRING }
        },
        required: ["conditionName", "summary", "detailedAnalysis", "severity", "severityReasoning", "confidenceScore", "treatmentPlan", "dietaryAdvice", "physicalTherapy", "lifestyleChanges", "labResultsAnalysis"]
      }
    };

    if (settings.googleSearch && (settings.model.includes('pro') || settings.model.includes('image-preview'))) {
      config.tools = [{ googleSearch: {} }];
    }

    if (settings.deepThinking && settings.model.includes('gemini-3')) {
      if (!settings.model.includes('pro') && !settings.model.includes('lite')) {
        config.thinkingConfig = { 
          thinkingBudgetTokens: settings.thinkingBudget 
        };
      }
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: settings.model,
        contents: { parts },
        config
      });
    } catch (primaryError: any) {
      console.warn("Primary model failed, falling back to gemini-3-flash-preview...", primaryError);
      response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: { ...config, thinkingConfig: undefined, tools: undefined }
      });
    }

    const cleanedText = cleanJsonResponse(response.text || '{}');
    return { 
      diagnosis: JSON.parse(cleanedText), 
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
    };
  } catch (e: any) {
    console.error("Gemini Error:", e);
    throw e;
  }
};

export const startFollowUpChat = (patient: PatientCase, settings: SystemSettings): Chat => {
  const ai = getAI(settings);
  
  const clinicalContext = `
    [ملف المريض السريري]
    الاسم: ${patient.name} | العمر: ${patient.age} | الجنس: ${patient.gender}
    الأعراض الأولية (HPI): ${patient.symptoms}
    المؤشرات الحيوية: ضغط الدم ${patient.vitals.bloodPressure} | النبض ${patient.vitals.pulse} | الحرارة ${patient.vitals.temperature} | الأكسجين ${patient.vitals.spo2}
    
    [التشخيص المعتمد]
    التشخيص: ${patient.diagnosis?.conditionName}
    مستوى الخطورة: ${patient.diagnosis?.severity}
    الخطة العلاجية الحالية: ${patient.diagnosis?.treatmentPlan?.join('، ')}
  `;

  return ai.chats.create({
    model: settings.model,
    config: {
      systemInstruction: `أنت الآن الطبيب الاستشاري المباشر المشرف على حالة هذا المريض.
      السياق السريري للمريض:
      ${clinicalContext}
      
      تعليمات الرد (صارمة):
      1. أجب على أسئلة المريض أو الفريق الطبي بمهنية طبية عالية جداً.
      2. لا تتصرف أبداً كـ "ذكاء اصطناعي" أو "مساعد افتراضي"، بل كطبيب بشري خبير يتابع حالة مريضه في العيادة.
      3. اربط إجاباتك دائماً بحالة المريض الحالية، عمره، وتشخيصه المعتمد المذكور أعلاه.
      4. إذا سأل المريض عن دواء أو عرض جديد، قم بتحليله سريرياً بناءً على تاريخه المرضي.
      الأسلوب المعتمد: ${settings.personality}.`,
    }
  });
};

export const generateSpeech = async (text: string, settings?: SystemSettings): Promise<string> => {
  try {
    const ai = getAI(settings);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  } catch (e) {
    return "";
  }
};
