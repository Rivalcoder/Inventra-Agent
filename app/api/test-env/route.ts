import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'SET' : 'NOT SET',
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    NODE_ENV: process.env.NODE_ENV,
    totalEnvVars: Object.keys(process.env).length,
    googleEnvVars: Object.keys(process.env).filter(key => key.includes('GOOGLE'))
  };

  return NextResponse.json(envVars);
} 