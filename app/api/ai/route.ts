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
            Description: z.string(),
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
                    Format your response as a single string with the following structure (keep it concise and relevant to the query):
                    
                    ### 📊 Summary
                    Use a table to display key metrics (ensure proper markdown table formatting):
                    | Metric | Value |
                    |:-------|:------|
                    | Total Revenue | $X,XXX.XX |
                    | Total Sales | XX |
                    | Total Units | XX |
                    
                    ### 📈 Details
                    For product-specific data, use a table (ensure proper markdown table formatting):
                    | Product | Revenue | Sales | Units |
                    |:--------|:--------|:------|:------|
                    | Product 1 | $X,XXX.XX | XX | XX |
                    | Product 2 | $X,XXX.XX | XX | XX |
                    
                    ### 💡 Insights
                    Format insights as a bulleted list with icons (keep each point concise):
                    * 📌 Key finding 1
                    * 📌 Key finding 2
                    * 📌 Key finding 3
                    
                    ### ⚠️ Important Notes
                    Use blockquotes for important notes (keep it brief and relevant):
                    > Note: Add any important caveats or limitations here
                    
                    ### 📋 Recommendations
                    Format recommendations as a numbered list with icons (keep each point actionable):
                    1. 🔄 Action item 1
                    2. 🔄 Action item 2
                    3. 🔄 Action item 3
                    
                    Important Formatting Rules:
                    1. Tables:
                       - Always use proper markdown table syntax
                       - Align columns with colons (e.g., |:---|:---|)
                       - Ensure consistent spacing
                       - Keep tables compact and readable
                    
                    2. Content:
                       - Answer ONLY what the user asked
                       - Keep each section concise and focused
                       - Avoid repeating information
                       - Use bullet points for better readability
                       - Format numbers with proper separators
                       - Use emojis consistently
                       - Do not add extra information not requested
                       - Return as a single string, not an array
                    
                    3. Styling:
                       - Use **bold** for important metrics
                       - Use *italic* for emphasis
                       - Use \`code\` for technical terms
                       - Use > for important notes
                       - Add emojis for visual hierarchy:
                         - 📊 for statistics
                         - 📈 for trends
                         - ⚠️ for warnings
                         - 💡 for insights
                         - 🔍 for analysis
                         - 📌 for key points
                         - 💰 for financial data
                         - 📦 for inventory data
                         - 🔄 for actions
                         - 📋 for lists

                3). SqlQuery (Optional) :
                    - Only provide if all necessary information is available
                    - For data modifications (add/update/delete), include the complete SQL query
                    - For data queries, include the SELECT query to get the requested information
                    - Format SQL queries in code blocks with \`\`\`sql
                    - Add comments to explain complex queries
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