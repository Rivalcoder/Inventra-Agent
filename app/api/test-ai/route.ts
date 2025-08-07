import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "AIzaSyCrUswVG1023WIqnf8a9EI4kGU7yeOiyaY";
    
    console.log('Testing AI API with key:', apiKey ? 'SET' : 'NOT SET');
    
    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      apiKey: apiKey,
      prompt: 'Say "Hello World"',
    });

    return NextResponse.json({ 
      success: true, 
      response: text,
      apiKeyStatus: apiKey ? 'SET' : 'NOT SET'
    });
  } catch (error: any) {
    console.error('AI Test Error:', error);
    return NextResponse.json({ 
      error: error.message,
      apiKeyStatus: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'SET' : 'NOT SET'
    }, { status: 500 });
  }
} 