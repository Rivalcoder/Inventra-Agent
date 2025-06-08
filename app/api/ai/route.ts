import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { getProducts, getSales, getDashboardStats, getTopProducts, getLowStockProducts } from '@/lib/data';
// Use the API key directly
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
console.log('API Key available:', !!apiKey); // This will log true if the key exists, false if it doesn't

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          details: 'Query is required'
        },
        { status: 400 }
      );
    }

    // Fetch all relevant data
    const [products, sales, stats, topProducts, lowStock] = await Promise.all([
      getProducts(),
      getSales(),
      getDashboardStats(),
      getTopProducts(),
      getLowStockProducts()
    ]);

    // Prepare the context with current data
    const context = {
      products,
      sales,
      stats,
      topProducts,
      lowStock
    };

    try {
      console.log('Attempting to generate AI response...');
      const { object } = await generateObject({
        model: google('gemini-1.5-flash'),
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        schema: z.object({
          Topic: z.object({
            Heading: z.string(),
            Description: z.array(z.string()),
            SqlQuery: z.array(z.string()).optional(),
          }),
        }),
        prompt: `Analyze the following inventory and sales data:
                ${JSON.stringify(context)}
                
                User Query: ${query}
                
                # If user Ask About The Datas Answer The Question By Viewing The datas and Db  Structure Give The Answers
                # If User Ask To Add Update Or Delete The Data:
                # 1. First check if all necessary information is provided
                # 2. If information is missing, ask for it in the Description
                # 3. Only provide SQL query when all required information is available
                
                # Give Accordingly The Below Format

                1). Heading :
                    - Name Of What is Done For Page Top Heading Display
                    - It should be Short And Concise
                    
                2). Description :
                    - If information is missing, list what information is needed
                    - If all information is available, provide the analysis or explanation
                    - For sales data, give data in points according to the question
                    - For suggestions, provide recommendations based on the data
                    - Format as a clear list of points

                3). SqlQuery (Optional) :
                    - Only provide if all necessary information is available
                    - For data modifications (add/update/delete), include the complete SQL query
                    - For data queries, include the SELECT query to get the requested information
               `
      });

      console.log('Successfully generated AI response');
      return NextResponse.json({ 
        response: object,
        data: context
      });
    } catch (aiError: any) {
      console.error('AI Generation Error:', {
        error: aiError,
        message: aiError.message,
        stack: aiError.stack
      });

      return NextResponse.json(
        { 
          error: 'Failed to generate analysis',
          details: aiError.message || 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Request Processing Error:', {
      error,
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 