import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { mockDB } from '@/lib/mockDatabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});

const SYSTEM_PROMPT = `You are an AI Foot Health Practitioner for FootCare Clinic. Your role is to:

1. Collect patient information (name, email, phone)
2. Identify the foot issue category (ingrown toenail, plantar fasciitis, athlete's foot, bunions, heel pain, toe pain, nail fungus, other)
3. Ask detailed questions about symptoms, duration, severity, and impact on daily life
4. Provide a preliminary diagnosis for common foot conditions
5. Offer initial care recommendations
6. Help schedule appointments when needed
7. Arrange follow-ups for ongoing treatment
8. Collect satisfaction feedback at the end

Guidelines:
- Be professional, empathetic, and reassuring
- Ask one question at a time to avoid overwhelming the patient
- For ingrown toenails: Ask about pain level, swelling, redness, discharge, which toe, how long
- For plantar fasciitis: Ask about heel pain, morning stiffness, activity levels
- For athlete's foot: Ask about itching, peeling, location, moisture
- Always recommend seeing a professional for severe symptoms
- Be clear that this is preliminary guidance, not a replacement for professional care
- When booking appointments, offer available time slots
- After providing diagnosis and recommendations, ask if they'd like to book an appointment
- At the end, ask for satisfaction rating (1-5) and feedback

Keep responses concise and conversational. Guide the patient through the process step by step.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, patientId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array required' },
        { status: 400 }
      );
    }

    // Use demo mode if no API key
    const isDemoMode = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key';

    let responseContent: string;

    if (isDemoMode) {
      // Demo mode with rule-based responses
      responseContent = generateDemoResponse(messages);
    } else {
      // Real OpenAI API call
      const chatMessages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      responseContent = completion.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';
    }

    // Save message to mock database if sessionId exists
    if (sessionId) {
      mockDB.createMessage({
        session_id: sessionId,
        role: 'assistant',
        content: responseContent,
      });

      // Update session with conversation
      const session = mockDB.getSession(sessionId);
      if (session) {
        const updatedConversation = [
          ...session.conversation,
          { role: 'assistant', content: responseContent, timestamp: new Date().toISOString() }
        ];
        mockDB.updateSession(sessionId, { conversation: updatedConversation });
      }
    }

    return NextResponse.json({
      message: responseContent,
      isDemoMode
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

function generateDemoResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
  const messageCount = messages.length;

  // Initial greeting
  if (messageCount === 1) {
    return "Hello! I'm your AI Foot Health Assistant at FootCare Clinic. I'm here to help assess your foot concerns and guide you through our services.\n\nTo get started, may I have your full name?";
  }

  // Name collection
  if (messageCount === 2) {
    return "Thank you! Now, could you please provide your email address so we can send you appointment details and follow-up information?";
  }

  // Email collection
  if (messageCount === 3) {
    return "Great! And what's the best phone number to reach you at?";
  }

  // Phone collection - move to issue category
  if (messageCount === 4) {
    return "Perfect! Now, let's discuss your foot concern. What type of issue are you experiencing?\n\n1. Ingrown toenail\n2. Heel pain\n3. Athlete's foot or fungal infection\n4. Bunions\n5. Plantar fasciitis\n6. General toe pain\n7. Other\n\nPlease describe your main concern.";
  }

  // Issue category identified
  if (messageCount === 5) {
    if (lastMessage.includes('ingrown') || lastMessage.includes('toenail') || lastMessage.includes('nail')) {
      return "I understand you're dealing with what sounds like an ingrown toenail. Let me ask you a few questions to better understand your situation.\n\nOn a scale of 1-10, how would you rate your pain level? And which toe is affected?";
    } else if (lastMessage.includes('heel') || lastMessage.includes('bottom')) {
      return "I see you're experiencing heel pain. This is quite common. Let me gather some details.\n\nDoes the pain feel worse in the morning when you first stand up? And how long have you been experiencing this?";
    } else if (lastMessage.includes('itch') || lastMessage.includes('athlete') || lastMessage.includes('fungus')) {
      return "It sounds like you might be dealing with a fungal infection like athlete's foot. Let me learn more.\n\nAre you experiencing itching, peeling skin, or redness? Where exactly on your foot is it located?";
    } else {
      return "Thank you for sharing that. To help you better, could you describe your symptoms in more detail? For example, when did it start, what does it feel like, and what activities make it worse or better?";
    }
  }

  // Symptoms gathering
  if (messageCount === 6) {
    return "Thank you for that information. Have you noticed any swelling, redness, or warmth in the affected area? Also, has this issue been affecting your daily activities or sleep?";
  }

  // More symptom details
  if (messageCount === 7) {
    const diagnosis = lastMessage.includes('ingrown') || messages.some(m => m.content.toLowerCase().includes('ingrown'))
      ? "Based on your symptoms, this appears to be an ingrown toenail. This occurs when the nail edge grows into the surrounding skin, causing pain, swelling, and sometimes infection."
      : lastMessage.includes('heel') || messages.some(m => m.content.toLowerCase().includes('heel'))
      ? "Based on your symptoms, this sounds like it could be plantar fasciitis - inflammation of the tissue connecting your heel to your toes. The morning pain is a classic sign."
      : "Based on your symptoms, this appears to be a fungal infection (athlete's foot). This is caused by fungi that thrive in warm, moist environments.";

    return `${diagnosis}\n\n**Initial Care Recommendations:**\n• Keep the area clean and dry\n• Avoid tight footwear\n• Soak in warm water with Epsom salt (15 minutes daily)\n• Apply antibiotic ointment if there's any redness\n• Elevate your foot when resting\n\n**Important:** While these can help with mild cases, I strongly recommend seeing our foot health specialist for proper treatment, especially if symptoms worsen.\n\nWould you like to schedule an appointment with one of our podiatrists?`;
  }

  // Appointment booking
  if (messageCount === 8 && (lastMessage.includes('yes') || lastMessage.includes('book') || lastMessage.includes('appointment') || lastMessage.includes('schedule'))) {
    return "Excellent! I can help you book an appointment. We have availability:\n\n• Tomorrow at 2:00 PM\n• Wednesday at 10:00 AM\n• Thursday at 3:30 PM\n• Friday at 9:00 AM\n\nWhich time works best for you?";
  }

  // Appointment confirmation
  if (messageCount === 9 && (lastMessage.includes('tomorrow') || lastMessage.includes('wednesday') || lastMessage.includes('thursday') || lastMessage.includes('friday') || lastMessage.includes('am') || lastMessage.includes('pm'))) {
    return "Perfect! I've scheduled your appointment. You'll receive a confirmation email shortly with all the details.\n\nWould you like to schedule a follow-up appointment in 2 weeks to check on your progress? Follow-ups are important for monitoring your recovery.";
  }

  // Follow-up scheduling
  if (messageCount === 10) {
    if (lastMessage.includes('yes') || lastMessage.includes('sure') || lastMessage.includes('okay')) {
      return "Great! I've noted a follow-up appointment for 2 weeks from your initial visit. We'll send you a reminder.\n\nBefore we finish, I'd love to get your feedback. On a scale of 1-5 stars, how would you rate your experience with our AI triage system today?";
    } else {
      return "No problem! You can always schedule a follow-up later if needed.\n\nBefore we finish, I'd love to get your feedback. On a scale of 1-5 stars, how would you rate your experience with our AI triage system today?";
    }
  }

  // Satisfaction rating
  if (messageCount === 11) {
    return "Thank you for your rating! Is there anything specific you'd like to share about your experience - what went well or what we could improve?";
  }

  // Final message
  if (messageCount >= 12) {
    return "Thank you so much for your feedback! It helps us improve our service.\n\nYour session has been saved to your patient portal where you can:\n• View your diagnosis and recommendations\n• Access your appointment details\n• Message our team\n• Track your treatment progress\n\nTake care, and we look forward to seeing you at your appointment! Feel better soon! 🦶";
  }

  return "I'm here to help! Could you tell me more about your concern?";
}
