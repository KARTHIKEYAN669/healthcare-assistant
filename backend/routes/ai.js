const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Structured & concise AI response database
const symptomResponses = {
  fever: {
    keywords: ['fever', 'temperature', 'hot', 'chills', 'sweating'],
    title: 'Fever',
    specialty: 'General Physician',
    assessment: 'A body temperature above 38°C (100.4°F) usually indicates an immune response to an infection.',
    steps: [
      'Rest and hydrate (water, ORS, clear broths)',
      'Take paracetamol if temp > 38.5°C (101.3°F)',
      'Apply a cool, damp cloth on forehead & wear light clothing'
    ],
    redFlags: [
      'Fever > 39.5°C (103°F) or lasting > 3 days',
      'Stiff neck, severe headache, rash, or breathing trouble'
    ]
  },
  headache: {
    keywords: ['headache', 'head pain', 'migraine', 'head ache'],
    title: 'Headache',
    specialty: 'Neurologist',
    assessment: 'Headaches are commonly caused by stress, dehydration, eye strain, or tension.',
    steps: [
      'Drink 1–2 glasses of water immediately',
      'Rest in a quiet, dark, cool room',
      'Apply warm or cold compress to temples/neck'
    ],
    redFlags: [
      'Sudden "thunderclap" severe headache',
      'Headache with fever, confusion, or neck stiffness'
    ]
  },
  chest: {
    keywords: ['chest pain', 'chest tightness', 'chest pressure', 'heart pain', 'palpitation'],
    title: 'Chest Discomfort',
    specialty: 'Cardiologist',
    severity: 'high',
    assessment: 'Chest symptoms require immediate medical evaluation to rule out cardiac emergencies.',
    steps: [
      'Sit down and stop all physical activity',
      'Loosen tight clothing and try slow breathing',
      'Do NOT drive yourself; call for immediate assistance'
    ],
    redFlags: [
      'Pain spreading to left arm, neck, jaw, or back',
      'Shortness of breath, sweating, or dizziness'
    ]
  },
  cough: {
    keywords: ['cough', 'coughing', 'sore throat', 'throat pain', 'cold', 'runny nose', 'congestion'],
    title: 'Cough & Cold',
    specialty: 'Pulmonologist',
    assessment: 'Most coughs stem from viral respiratory infections and resolve within 1–2 weeks.',
    steps: [
      'Sip warm tea with honey or gargle warm salt water',
      'Use steam inhalation for chest/nasal congestion',
      'Get plenty of rest and avoid cold/dry air'
    ],
    redFlags: [
      'Coughing up blood or lasting > 3 weeks',
      'High fever or difficulty breathing'
    ]
  },
  stomach: {
    keywords: ['stomach', 'abdominal', 'nausea', 'vomiting', 'diarrhea', 'bloating', 'gas', 'constipation', 'indigestion'],
    title: 'Digestive Discomfort',
    specialty: 'Gastroenterologist',
    assessment: 'Gastrointestinal issues usually resolve with rest, hydration, and a light diet.',
    steps: [
      'Sip fluids slowly (ORS, coconut water, water)',
      'Eat bland foods (rice, toast, banana, applesauce)',
      'Avoid spicy, oily, or dairy items for 24 hours'
    ],
    redFlags: [
      'Severe unmanageable abdominal pain',
      'Blood in vomit or stool, or severe dehydration'
    ]
  },
  breathing: {
    keywords: ['breathing', 'shortness of breath', 'breathless', 'asthma', 'wheeze', 'wheezing'],
    title: 'Breathing Difficulty',
    specialty: 'Pulmonologist',
    severity: 'high',
    assessment: 'Shortness of breath requires prompt attention to ensure adequate oxygenation.',
    steps: [
      'Sit upright and lean slightly forward',
      'Practice slow pursed-lip breathing',
      'Use prescribed rescue inhaler if asthmatic'
    ],
    redFlags: [
      'Blue lips/nails, sudden onset, or unable to speak sentences',
      'Choking sensation or severe chest pressure'
    ]
  },
  skin: {
    keywords: ['rash', 'itching', 'skin', 'allergy', 'hives', 'acne', 'eczema', 'redness'],
    title: 'Skin Rash & Allergy',
    specialty: 'Dermatologist',
    assessment: 'Skin irritations arise from allergies, contact irritants, or mild infections.',
    steps: [
      'Avoid scratching to prevent secondary skin infection',
      'Apply cool compress or fragrance-free lotion',
      'Take OTC oral antihistamine for itching'
    ],
    redFlags: [
      'Rapidly spreading rash with fever',
      'Swelling of face/lips or trouble breathing (anaphylaxis)'
    ]
  },
  diabetes: {
    keywords: ['diabetes', 'blood sugar', 'glucose', 'insulin', 'diabetic'],
    title: 'Blood Sugar Control',
    specialty: 'Endocrinologist',
    assessment: 'Effective sugar management prevents long-term health complications.',
    steps: [
      'Check blood sugar level with your glucometer',
      'Take prescribed medication/insulin on time',
      'Stay hydrated and take a 15-min post-meal walk'
    ],
    redFlags: [
      'Sugar level < 70 mg/dL with shaking/sweating (take glucose immediately)',
      'Sugar > 250 mg/dL with confusion, thirst, or vomiting'
    ]
  },
  mental: {
    keywords: ['anxiety', 'depression', 'stress', 'mental', 'sad', 'panic', 'worried', 'sleep', 'insomnia'],
    title: 'Mental Wellness & Stress',
    specialty: 'Psychiatrist',
    assessment: 'Stress and mood fluctuations respond well to self-care techniques and professional support.',
    steps: [
      'Try 4-7-8 deep breathing exercises (5 mins)',
      'Maintain consistent sleep schedule (7-8 hours)',
      'Talk to a trusted friend or write in a journal'
    ],
    redFlags: [
      'Persistent sadness or anxiety lasting > 2 weeks',
      'Thoughts of self-harm (Call helpline 9152987821)'
    ]
  },
  pain: {
    keywords: ['pain', 'ache', 'hurt', 'sore', 'joint', 'back pain', 'muscle'],
    title: 'Body & Muscle Pain',
    specialty: 'Orthopedic',
    assessment: 'Body pain often stems from muscle strain, overuse, or mild inflammation.',
    steps: [
      'Rest the painful area & avoid strain',
      'Apply ice (first 48h) or warm heat pad',
      'Gentle stretching once acute pain subsides'
    ],
    redFlags: [
      'Severe pain following trauma or fall',
      'Pain accompanied by joint swelling, numbness, or fever'
    ]
  }
};

function formatShortAIResponse(matches, query) {
  if (matches.length === 0) {
    return `🩺 **Assessment:**
General health query regarding "${query}".

⚡ **Quick Advice:**
• Stay hydrated (2-3L water daily) & get 7-8 hrs sleep.
• Eat balanced meals rich in fiber, fruits & vegetables.
• Stay physically active with light daily exercise.

🚨 **Seek Doctor If:**
• Symptoms develop, worsen, or persist more than 3 days.

*Note: For medical emergencies, call 112 immediately.*`;
  }

  // Pick primary or top 2 matched topics to keep concise
  const primary = matches[0];
  const secondary = matches[1];

  let output = `🩺 **Assessment:**\n${primary.assessment}\n\n⚡ **Key Steps:**\n`;
  primary.steps.forEach(s => { output += `• ${s}\n`; });

  if (secondary) {
    output += `\n*Also regarding ${secondary.title}:*\n`;
    secondary.steps.slice(0, 2).forEach(s => { output += `• ${s}\n`; });
  }

  output += `\n🚨 **Seek Doctor If:**\n`;
  primary.redFlags.forEach(f => { output += `• ${f}\n`; });

  return output;
}

function analyzeQuery(message) {
  const lowerMsg = message.toLowerCase();
  const matched = [];

  for (const [key, data] of Object.entries(symptomResponses)) {
    if (data.keywords.some(kw => lowerMsg.includes(kw))) {
      matched.push(data);
    }
  }

  const responseText = formatShortAIResponse(matched, message);
  const recommendedSpecialties = [...new Set(matched.map(m => m.specialty))];
  const isHighSeverity = matched.some(m => m.severity === 'high');

  return {
    response: responseText,
    recommendedSpecialties: recommendedSpecialties.length > 0 ? recommendedSpecialties : ['General Physician'],
    severity: isHighSeverity ? 'high' : 'moderate',
  };
}

// AI Chat endpoint
router.post('/chat', auth, (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const result = analyzeQuery(message);

  res.json({
    response: result.response,
    recommendedSpecialties: result.recommendedSpecialties,
    severity: result.severity,
    timestamp: new Date().toISOString(),
    disclaimer: 'General health guidance only. Consult a doctor for medical advice.'
  });
});

// Symptom analysis endpoint
router.post('/analyze-symptoms', auth, (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || !Array.isArray(symptoms)) {
    return res.status(400).json({ error: 'Symptoms array required' });
  }

  const symptomText = symptoms.join(', ');
  const result = analyzeQuery(symptomText);

  res.json({
    analysis: result.response,
    recommendedSpecialties: result.recommendedSpecialties,
    severity: result.severity,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
