const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Symptom-based mock AI responses
const symptomResponses = {
  fever: {
    keywords: ['fever', 'temperature', 'hot', 'chills', 'sweating'],
    response: `**Fever Guidance:**\n\nA fever (body temperature above 38°C/100.4°F) is usually a sign that your body is fighting an infection.\n\n**Immediate steps:**\n• Rest and stay hydrated — drink plenty of water, ORS, or clear fluids\n• Take paracetamol (acetaminophen) to reduce fever if above 38.5°C\n• Use a cool, damp cloth on your forehead\n• Wear light clothing and stay in a well-ventilated room\n\n**Seek medical care if:**\n• Fever exceeds 39.5°C (103°F)\n• Fever persists more than 3 days\n• You have severe headache, stiff neck, or rash\n• Difficulty breathing or chest pain\n\n⚠️ *This is general guidance only. Please consult a healthcare professional for proper diagnosis and treatment.*`
  },
  headache: {
    keywords: ['headache', 'head pain', 'migraine', 'head ache'],
    response: `**Headache Guidance:**\n\nHeadaches are extremely common and usually not serious. They can be caused by tension, dehydration, eye strain, stress, or minor infections.\n\n**Immediate steps:**\n• Drink a glass of water — dehydration is a common cause\n• Rest in a quiet, dark room\n• Apply a cold or warm compress to your forehead/neck\n• Try an OTC pain reliever like paracetamol or ibuprofen if needed\n• Avoid screens for 30–60 minutes\n\n**Seek medical care if:**\n• Sudden, severe "thunderclap" headache\n• Headache with fever, stiff neck, or rash\n• Headache after a head injury\n• Worsening headache with nausea or vision changes\n\n⚠️ *This is general guidance only. Please consult a healthcare professional for persistent or severe symptoms.*`
  },
  chest: {
    keywords: ['chest pain', 'chest tightness', 'chest pressure', 'heart pain', 'palpitation'],
    response: `🚨 **IMPORTANT — Chest Pain Guidance:**\n\nChest pain can range from minor muscle strain to a medical emergency. **Do not ignore chest pain.**\n\n**If you experience any of the following, call emergency services immediately (112):**\n• Crushing or squeezing chest pain\n• Pain spreading to your left arm, jaw, or back\n• Shortness of breath, sweating, or nausea with chest pain\n• Loss of consciousness\n\n**For mild chest discomfort:**\n• Sit down and rest immediately\n• Loosen tight clothing\n• Avoid any physical exertion\n• Do NOT drive yourself to the hospital\n\n⚠️ *Chest pain is a symptom that always requires professional medical evaluation. Please seek care immediately.*`
  },
  cough: {
    keywords: ['cough', 'coughing', 'sore throat', 'throat pain', 'cold', 'runny nose', 'congestion'],
    response: `**Cough & Cold Guidance:**\n\nMost coughs are caused by viral upper respiratory infections and resolve on their own in 1–2 weeks.\n\n**Immediate steps:**\n• Stay hydrated — warm liquids like tea with honey can soothe the throat\n• Use steam inhalation (carefully) to relieve congestion\n• Gargle with warm salt water for sore throat\n• Rest and avoid cold/dusty environments\n• OTC cough syrups may provide temporary relief\n\n**Seek medical care if:**\n• Cough lasts more than 3 weeks\n• You cough up blood\n• High fever with cough\n• Difficulty breathing or wheezing\n• Cough after foreign body aspiration\n\n⚠️ *This is general guidance only. Please consult a healthcare professional for proper diagnosis.*`
  },
  stomach: {
    keywords: ['stomach', 'abdominal', 'nausea', 'vomiting', 'diarrhea', 'bloating', 'gas', 'constipation', 'indigestion'],
    response: `**Stomach & Digestive Guidance:**\n\nDigestive issues are common and often resolve with rest and dietary changes.\n\n**Immediate steps:**\n• Stay hydrated — especially important if vomiting or diarrhea is present\n• Eat light, bland foods (rice, toast, banana, yogurt)\n• Avoid spicy, fatty, or heavy foods\n• For nausea — ginger tea or small sips of clear fluids\n• Rest and avoid strenuous activity\n\n**Seek medical care if:**\n• Severe abdominal pain\n• Blood in stool or vomit\n• Symptoms persist more than 48 hours\n• Signs of dehydration (dizziness, no urination)\n• Fever along with stomach pain\n\n⚠️ *This is general guidance only. Please consult a healthcare professional for persistent symptoms.*`
  },
  breathing: {
    keywords: ['breathing', 'shortness of breath', 'breathless', 'asthma', 'wheeze', 'wheezing'],
    response: `🚨 **Breathing Difficulty Guidance:**\n\nShortness of breath can be mild or a medical emergency depending on the cause and severity.\n\n**If severe — call emergency services immediately (112) if:**\n• Sudden, severe shortness of breath\n• Lips or fingernails turning blue\n• Confusion or loss of consciousness\n• Choking sensation\n\n**For mild breathlessness:**\n• Sit upright and lean slightly forward\n• Try slow, deep breathing (in through nose, out through mouth)\n• If you have an inhaler for asthma, use it as prescribed\n• Avoid triggers like smoke, allergens, or exercise\n\n⚠️ *Breathing difficulty always warrants medical attention. Please seek professional care promptly.*`
  },
  skin: {
    keywords: ['rash', 'itching', 'skin', 'allergy', 'hives', 'acne', 'eczema', 'redness'],
    response: `**Skin Condition Guidance:**\n\nSkin issues range from minor irritations to conditions requiring medical treatment.\n\n**Immediate steps:**\n• Avoid scratching — it worsens irritation and can cause infection\n• Apply a cool compress to reduce itching/redness\n• Use fragrance-free moisturizer for dry skin conditions\n• For allergic reactions — take an antihistamine (like cetirizine)\n• Identify and avoid triggers (soaps, foods, plants)\n\n**Seek medical care if:**\n• Rash is rapidly spreading\n• Accompanied by fever or difficulty breathing (anaphylaxis)\n• Open sores or signs of infection (pus, warmth, swelling)\n• Rash after a tick bite or travel\n\n⚠️ *This is general guidance only. Please consult a dermatologist for accurate diagnosis.*`
  },
  diabetes: {
    keywords: ['diabetes', 'blood sugar', 'glucose', 'insulin', 'diabetic'],
    response: `**Diabetes Management Guidance:**\n\n**General tips for managing blood sugar:**\n• Monitor your blood sugar regularly as recommended by your doctor\n• Follow your prescribed diet plan — limit sugary, processed foods\n• Take your medications/insulin as prescribed — never skip doses\n• Regular gentle exercise (30 min walk daily) helps control sugar levels\n• Stay hydrated and avoid alcohol\n\n**Warning signs — seek immediate care:**\n• Very high blood sugar (hyperglycemia): excessive thirst, frequent urination, fruity breath\n• Very low blood sugar (hypoglycemia): shakiness, sweating, confusion — eat something sweet immediately\n\n⚠️ *Diabetes management requires ongoing medical supervision. Please work closely with your healthcare team.*`
  },
  mental: {
    keywords: ['anxiety', 'depression', 'stress', 'mental', 'sad', 'panic', 'worried', 'sleep', 'insomnia'],
    response: `**Mental Health & Wellness Guidance:**\n\nMental health is just as important as physical health. It's okay to ask for help.\n\n**Self-care strategies:**\n• Practice deep breathing or meditation — try 5 minutes daily\n• Maintain a regular sleep schedule (7–8 hours per night)\n• Stay connected with supportive friends or family\n• Limit caffeine and alcohol\n• Gentle exercise like walking or yoga can significantly improve mood\n• Journaling your thoughts can help process emotions\n\n**Please seek professional support if:**\n• Feelings persist more than 2 weeks\n• You're having thoughts of self-harm — call a crisis helpline immediately\n• Symptoms are affecting your daily life or relationships\n\n📞 *iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345*\n\n⚠️ *This is general wellness guidance. Please consult a mental health professional for proper support.*`
  },
  pain: {
    keywords: ['pain', 'ache', 'hurt', 'sore', 'joint', 'back pain', 'muscle'],
    response: `**Pain Management Guidance:**\n\nPain can arise from many causes — muscle strain, inflammation, nerve issues, or underlying conditions.\n\n**General relief measures:**\n• Rest the affected area\n• Apply ice for acute injuries (first 48 hrs) or heat for chronic muscle aches\n• OTC pain relievers like paracetamol or ibuprofen may help — follow package instructions\n• Gentle stretching for muscle stiffness (avoid if injured)\n• Maintain good posture for back/neck pain\n\n**Seek medical care if:**\n• Severe or worsening pain\n• Pain after trauma or injury\n• Pain with fever, swelling, or redness\n• Pain limiting your daily activities\n\n⚠️ *This is general guidance only. Please consult a healthcare professional for persistent pain.*`
  }
};

function generateAIResponse(message) {
  const lowerMsg = message.toLowerCase();
  const matchedResponses = [];

  for (const [key, data] of Object.entries(symptomResponses)) {
    if (data.keywords.some(kw => lowerMsg.includes(kw))) {
      matchedResponses.push(data.response);
    }
  }

  if (matchedResponses.length > 0) {
    return matchedResponses.join('\n\n---\n\n');
  }

  // Generic health response
  return `**Health Assistant Response:**\n\nThank you for reaching out. I understand you have health concerns that need attention.\n\n**General Wellness Reminders:**\n• Stay well-hydrated (8–10 glasses of water daily)\n• Get adequate rest (7–8 hours of sleep)\n• Eat a balanced diet rich in fruits and vegetables\n• Engage in moderate physical activity regularly\n• Manage stress through relaxation techniques\n\n**When to See a Doctor:**\nIf your symptoms are severe, persistent, or getting worse, please book an appointment with one of our healthcare professionals.\n\nFor medical emergencies, call **112** immediately.\n\n⚠️ *I'm an AI health assistant. I provide general wellness information only — not medical diagnoses. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.*`;
}

// AI Chat endpoint
router.post('/chat', auth, (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // Simulate a small delay for realism
  const response = generateAIResponse(message);

  res.json({
    response,
    timestamp: new Date().toISOString(),
    disclaimer: 'This is AI-generated health information for educational purposes only. Always consult a qualified healthcare professional.'
  });
});

// Symptom analysis endpoint
router.post('/analyze-symptoms', auth, (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || !Array.isArray(symptoms)) {
    return res.status(400).json({ error: 'Symptoms array required' });
  }

  const symptomText = symptoms.join(', ');
  const response = generateAIResponse(symptomText);

  const specialtyMap = {
    fever: 'General Physician',
    headache: 'Neurologist',
    chest: 'Cardiologist',
    cough: 'Pulmonologist',
    stomach: 'General Physician',
    breathing: 'Pulmonologist',
    skin: 'Dermatologist',
    diabetes: 'Endocrinologist',
    mental: 'Psychiatrist',
    pain: 'Orthopedic'
  };

  const lowerSymptoms = symptomText.toLowerCase();
  const recommendedSpecialties = [];
  for (const [key, specialty] of Object.entries(specialtyMap)) {
    const data = symptomResponses[key];
    if (data && data.keywords.some(kw => lowerSymptoms.includes(kw))) {
      if (!recommendedSpecialties.includes(specialty)) {
        recommendedSpecialties.push(specialty);
      }
    }
  }

  res.json({
    analysis: response,
    recommendedSpecialties: recommendedSpecialties.length > 0 ? recommendedSpecialties : ['General Physician'],
    severity: lowerSymptoms.includes('chest') || lowerSymptoms.includes('breathing') ? 'high' : 'moderate',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
