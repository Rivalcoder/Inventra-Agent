import { NextResponse } from 'next/server';

export async function GET() {
  const envInfo = {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'SET' : 'NOT SET',
    GOOGLE_GENERATIVE_AI_API_KEY_LENGTH: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length || 0,
    GOOGLE_GENERATIVE_AI_API_KEY_PREFIX: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 10) || 'N/A',
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    NODE_ENV: process.env.NODE_ENV,
    totalEnvVars: Object.keys(process.env).length,
    googleEnvVars: Object.keys(process.env).filter(key => key.includes('GOOGLE')),
    allEnvVars: Object.keys(process.env).slice(0, 20), // First 20 env vars
    cwd: process.cwd(),
    platform: process.platform,
    nodeVersion: process.version
  };

  return NextResponse.json(envInfo);
} 