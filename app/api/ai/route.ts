import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { getProducts, getSales, getDashboardStats, getTopProducts, getLowStockProducts } from '@/lib/data';

// Use the API key directly - Next.js automatically loads environment variables
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "AIzaSyCrUswVG1023WIqnf8a9EI4kGU7yeOiyaY";
console.log('API Key available:', !!apiKey); // This will log true if the key exists, false if it doesn't
console.log('API Key length:', apiKey ? apiKey.length : 0);
console.log('API Key first 10 chars:', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined');
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Environment variables loaded:', Object.keys(process.env).length);

// Helper function to format date for MySQL
function formatDateForMySQL(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Helper function to fetch data with database configuration
async function fetchDataWithConfig(dbConfig: any, req: Request) {
  const userIdHeader = req.headers.get('x-user-id');
  const computedUserId = dbConfig?.userId || userIdHeader || undefined;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-db-config': JSON.stringify(dbConfig)
  };
  if (computedUserId) headers['x-user-id'] = String(computedUserId);

  const baseUrl = (() => {
    try {
      const { origin } = new URL(req.url);
      return origin;
    } catch {
      return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    }
  })();
  
  // Function to fetch with retry
  const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { headers });
        if (response.ok) {
          return await response.json();
        }
        console.warn(`Request failed (attempt ${i + 1}/${retries}): ${url}`);
      } catch (error) {
        console.warn(`Request error (attempt ${i + 1}/${retries}): ${url}`, error);
      }
      
      // Wait before retry (exponential backoff)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }
    throw new Error(`Failed to fetch data from ${url} after ${retries} attempts`);
  };

  try {
    // Fetch all data with individual error handling
    const [products, sales, stats, topProducts, lowStock] = await Promise.allSettled([
      fetchWithRetry(`${baseUrl}/api/db?action=products`),
      fetchWithRetry(`${baseUrl}/api/db?action=sales`),
      fetchWithRetry(`${baseUrl}/api/db?action=stats`),
      fetchWithRetry(`${baseUrl}/api/db?action=top-products`),
      fetchWithRetry(`${baseUrl}/api/db?action=low-stock`)
    ]);

    // Check if any requests failed
    const failedRequests = [products, sales, stats, topProducts, lowStock].filter(
      result => result.status === 'rejected'
    );

    if (failedRequests.length > 0) {
      console.error('Some requests failed:', failedRequests.map(r => r.status === 'rejected' ? r.reason : 'success'));
    }

    // Extract data, using empty arrays/objects for failed requests
    const result = {
      products: products.status === 'fulfilled' ? products.value : [],
      sales: sales.status === 'fulfilled' ? sales.value : [],
      stats: stats.status === 'fulfilled' ? stats.value : { totalSales: 0, totalQuantity: 0, totalRevenue: 0, totalProducts: 0, totalStock: 0, totalValue: 0 },
      topProducts: topProducts.status === 'fulfilled' ? topProducts.value : [],
      lowStock: lowStock.status === 'fulfilled' ? lowStock.value : []
    };

    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data from database');
  }
}

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

    // Get database configuration from request headers
    const dbConfigHeader = req.headers.get('x-user-db-config');
    if (!dbConfigHeader) {
      return NextResponse.json(
        { 
          error: 'Database configuration required',
          details: 'No database configuration provided in request headers'
        },
        { status: 400 }
      );
    }

    let dbConfig;
    try {
      dbConfig = JSON.parse(dbConfigHeader);
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid database configuration',
          details: 'Failed to parse database configuration'
        },
        { status: 400 }
      );
    }

    // Fetch all relevant data with database configuration
    const { products, sales, stats, topProducts, lowStock } = await fetchDataWithConfig(dbConfig, req);

    // Prepare the context with current data, current datetime, and DB schema hints
    const now = new Date();
    const context = {
      products,
      sales,
      stats,
      topProducts,
      lowStock,
      now: formatDateForMySQL(now), // Pass current datetime in MySQL format
      dbType: (dbConfig?.type || 'mysql')
    };
    console.log('API Key available:', process.env.GOOGLE_GENERATIVE_AI_API_KEY); 
    
    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !apiKey) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY is not available');
      return NextResponse.json(
        { 
          error: 'AI service configuration error',
          details: 'Google AI API key is not configured'
        },
        { status: 500 }
      );
    }
    
    try {
      console.log('Attempting to generate AI response...');
      const { object } = await generateObject({
        model: google('gemini-2.5-flash-lite'),
        schema: z.object({
          Topic: z.object({
            Heading: z.string(),
            Description: z.string(),
            Language: z.enum(['sql', 'mongodb']).optional(),
            // Prefer a structured array of commands when multiple ops are needed
            SqlQuery: z.array(z.string()).optional(),
            MongoQuery: z.array(z.string()).optional(),
            Steps: z.array(z.object({
              Action: z.string(),
              Sql: z.string().optional(),
              Mongo: z.string().optional(),
              Note: z.string().optional(),
            })).optional(),
          }),
        }),
        prompt: `Analyze the following inventory and sales data:
                ${JSON.stringify(context)}
                
                User Query: ${query}
                
                # IMPORTANT:
                - Database Type: ${dbConfig?.type || 'mysql'}
                - If Database Type is 'mongodb':
                  * You MUST set Topic.Language to 'mongodb'
                  * You MUST provide only MongoDB shell style commands in Topic.MongoQuery (e.g., db.sales.find({...}), db.products.updateOne({...},{...}), db.sales.aggregate([...]))
                  * You MUST NOT provide Topic.SqlQuery in this case
                - If Database Type is 'mysql' or 'postgresql':
                  * You MUST set Topic.Language to 'sql' and only provide Topic.SqlQuery
                - For any date or datetime fields in SQL that should represent the current time, always use the provided value in the 'now' variable (e.g., ${context.now}).
                - Do NOT include the SQL query in the Heading or Description fields.
                - Only provide the query in the correct field based on Language/Database Type:
                  * For SQL (mysql/postgresql): provide statements in SqlQuery
                  * For MongoDB: provide shell commands in MongoQuery
                - For any data modification (add, update, delete) that requires multiple statements:
                  * If SQL DB: return each statement as a separate string in SqlQuery
                  * If MongoDB: return each command as a separate string in MongoQuery
                  * Additionally, include an ordered Steps array with Action and the corresponding command (Sql or Mongo) for reliability
                - If the customer name is not provided in the user query, use 'Anonymous' as the customer name in the SQL statement.
                - For any date or datetime fields in SQL, always use the MySQL DATETIME format: 'YYYY-MM-DD HH:MM:SS'. Do NOT use ISO format (no 'T' or 'Z').
                - When generating multiple SQL queries, ensure that if any query fails, the subsequent queries should NOT be executed (simulate transactional behavior). If a failure is likely (e.g., not enough stock), explain the reason in the Description and do NOT generate the SQL queries.
                - Always validate that the first query (such as inserting a sale) will succeed based on the current data (e.g., check if there is enough stock). If not, explain the issue in the Description and do not provide the SQL.
                - If a failure occurs, provide a clear error message and do not partially update the database.
                - Give Query Accordingly To The Db Structure And Also Give The Query In The SqlQuery Field Area (Refer Below For The Db Structure and Given Db Datas)
                - Do NOT include the 'id' field in the INSERT statement for the 'sales' table. The database will generate it automatically. For example:
                  INSERT INTO sales (productId, productName, quantity, price, total, date, customer) VALUES ('1', 'Laptop Pro', 2, 100000, 200000, '${context.now}', 'Anonymous');
                - IMPORTANT (MySQL ONLY_FULL_GROUP_BY): When using GROUP BY, every non-aggregated selected expression must appear in the GROUP BY clause. Do not ORDER BY a non-grouped, non-aggregated column. Prefer ordering by grouped expressions or by aggregates. For time-based grouping, GROUP BY YEAR(date), MONTH(date) and ORDER BY YEAR(date), MONTH(date).
                - For monthly summaries, select YEAR(date) AS SaleYear, MONTH(date) AS SaleMonthNumber, MONTHNAME(date) AS SaleMonthName, then GROUP BY SaleYear, SaleMonthNumber and ORDER BY SaleYear, SaleMonthNumber. Do not ORDER BY MONTH(date) alone if it is not selected and grouped.
                
                # If user Ask About The Datas Answer The Question By Viewing The datas and Db  Structure Give The Answers
                # If User Ask To Add Update Or Delete The Data:
                # 1. First check if all necessary information is provided
                # 2. If information is missing, ask for it in the Description
                # 3. Only provide SQL query when all required information is available
                
                # Additional Rule:
                - If the SQL query returns no results (empty set), respond with a clear message such as "No data found for the selected period" and do not show a SQL error.
                
                # Response Guidelines:
                1). Heading:
                    - Provide a clear, concise heading that reflects the query
                    - Keep it relevant and specific to the user's question
                    
                2). Description:
                    - Analyze the data and provide insights based on the specific query
                    - Use appropriate formatting for better readability:
                      * Tables for structured data comparisons and where Table Like can Show Can Use Tables
                      * Lists for multiple points or steps
                      * Blockquotes for important notes
                      * Bold text for emphasis
                      * Emojis to enhance visual appeal
                    - Focus on answering exactly what the user asked
                    - Answer to More Long and Short and Clear and try To Give In Tables List based Instead Of Long Based Paragraphs
                    - Use Of Formatting Symbols In the response SO Show Of Data Can Be Easy In React Markdown So Give Accordingly
                    - Keep the response concise and relevant
                    - Use markdown formatting for better presentation
                    
                3). Query Fields (Optional):
                    - Only provide if all necessary information is available
                    - For SQL databases:
                      * Include complete SQL statements in SqlQuery
                      * Format SQL queries in code blocks with \`\`\`sql
                      * Add comments to explain complex queries
                      * Ensure GROUP BY queries are compatible with MySQL ONLY_FULL_GROUP_BY mode by grouping all non-aggregated columns used in SELECT and ORDER BY.
                    - For MongoDB databases:
                      * Include Mongo shell commands in MongoQuery (each string one command), and optionally in Steps[].Mongo
                      * Use db.<collection>.find, insertOne, updateOne, deleteOne, or aggregate with proper pipelines
                      * Prefer updateOne filters by id or by name for products
                      * Avoid using $lookup across top-level collections; prefer computing results from embedded arrays (users.data.products and users.data.sales) when applicable
                      * Do not include SQL

                Important Notes:
                - Be flexible in your response format based on the query type
                - ALWAYS use tables for:
                  * Product listings with multiple attributes
                  * Sales data with multiple metrics
                  * Any comparison between multiple items
                  * Any data that has more than 2 columns
                  * Use Tables Where It Possible and Looks Easy To Understand For User Use Tables
                  * Usage of Tables Is Important In Data Analysis And Reporting and View Datas Like That
                - Keep the response focused on the user's specific question
                - Avoid unnecessary sections or repetitive information
                - Use appropriate markdown formatting for better readability
                - Maintain a professional yet conversational tone
                - Always use ₹ symbol for INR amounts
                - Format large numbers with commas (e.g., ₹1,00,000)
                - Use K for thousands (e.g., ₹50K)
                - Include decimal places for precise amounts (e.g., ₹1,234.56)
                - Use consistent spacing after ₹ symbol
                - Format percentages without ₹ symbol
                - Use bold for total amounts

               Desc sales Table
                +-------------+---------------+------+-----+---------+-------------------+
                | Field       | Type          | Null | Key | Default | Extra             |
                +-------------+---------------+------+-----+---------+-------------------+
                | id          | char(36)      | NO   | PRI | uuid()  | DEFAULT_GENERATED |
                | productId   | varchar(36)   | NO   | MUL | NULL    |                   |
                | productName | varchar(255)  | NO   |     | NULL    |                   |
                | quantity    | int           | NO   |     | NULL    |                   |
                | price       | decimal(10,2) | NO   |     | NULL    |                   |
                | total       | decimal(10,2) | NO   |     | NULL    |                   |
                | date        | datetime      | NO   |     | NULL    |                   |
                | customer    | varchar(255)  | YES  |     | NULL    |                   |
                +-------------+---------------+------+-----+---------+-------------------+

                Desc Products Table :
                +-------------+---------------+------+-----+---------+-------+
                | Field       | Type          | Null | Key | Default | Extra |
                +-------------+---------------+------+-----+---------+-------+
                | id          | varchar(36)   | NO   | PRI | NULL    |       |
                | name        | varchar(255)  | NO   | UNI | NULL    |       |
                | description | text          | YES  |     | NULL    |       |
                | category    | varchar(100)  | YES  |     | NULL    |       |
                | price       | decimal(10,2) | NO   |     | NULL    |       |
                | stock       | int           | NO   |     | NULL    |       |
                | minStock    | int           | NO   |     | NULL    |       |
                | supplier    | varchar(255)  | YES  |     | NULL    |       |
                | createdAt   | datetime      | NO   |     | NULL    |       |
                | updatedAt   | datetime      | NO   |     | NULL    |       |
                +-------------+---------------+------+-----+---------+-------+

                
                Response Format Examples:

                1. For Product Listings:
                   ### 📊 Top Products by Revenue
                   | Product | Category | Revenue (₹) | Units Sold |
                   |:--------|:---------|:------------|:-----------|
                   | Laptop Pro | Electronics | 50,699.61 | 28 |
                   | 4K Monitor | Electronics | 14,499.71 | 24 |
                   | USB-C Dock | Accessories | 2,699.70 | 26 |
                   | **Total** | | **68,899.02** | **78** |

                   > Note: Electronics dominate the revenue with 94% of total sales

                2. For Category Analysis:
                   ### 📈 Category Performance
                   | Category | Revenue (₹) | % of Total | Top Product |
                   |:---------|:------------|:-----------|:------------|
                   | Electronics | 65,199.32 | 94% | Laptop Pro |
                   | Accessories | 4,699.75 | 6% | USB-C Dock |

                   * 💰 Electronics category leads with $65.2K revenue
                   * 📦 Accessories show strong unit sales but lower revenue
                   * 🔄 Laptop Pro drives 73% of Electronics revenue

                3. For Sales Trends:
                   ### 📊 Monthly Sales Overview
                   | Month | Revenue (₹) | Growth | Top Product |
                   |:------|:------------|:-------|:------------|
                   | June | 72,008.25 | +15% | Laptop Pro |
                   | May | 62,615.87 | +8% | 4K Monitor |
                   | April | 57,977.66 | - | USB-C Dock |

                   > Note: June shows strongest growth in Electronics category

                4. For Inventory Status:
                   ### 📦 Current Stock Levels
                   | Product | In Stock | Low Stock | Status |
                   |:--------|:---------|:----------|:--------|
                   | Laptop Pro | 5 | < 10 | ⚠️ Critical |
                   | 4K Monitor | 12 | < 15 | 🟡 Warning |
                   | USB-C Dock | 25 | < 20 | ✅ Good |

                   * ⚠️ Laptop Pro requires immediate restocking
                   * 🟡 Monitor stock approaching warning level
                   * ✅ Accessories well-stocked

                5. For Simple Queries:
                   ### 💡 Quick Answer
                   The Electronics category leads with $65.2K revenue (94% of total), driven by the Laptop Pro ($50.7K) and 4K Monitor ($14.5K). Accessories contribute $4.7K (6%) with strong unit sales but lower revenue per item.

                Markdown Formatting Rules:
                1. Headers:
                   - Use ### for main sections
                   - Keep headers concise and descriptive
                   - Add relevant emojis for visual hierarchy

                2. Tables:
                   - Use for structured data and comparisons
                   - Include relevant metrics
                   - Format numbers with proper separators
                   - Add totals when applicable
                   - Sort by relevant metric

                3. Lists:
                   - Use for key points and insights
                   - Keep items concise
                   - Add relevant emojis

                4. Blockquotes:
                   - Use for important notes
                   - Keep them brief and relevant

                5. Emphasis:
                   - Use **bold** for important metrics
                   - Use *italic* for emphasis
                   - Use \`code\` for technical terms

                6. Spacing:
                   - Add blank lines between sections
                   - Keep paragraphs short
                   - Use consistent spacing

                7. Emojis:
                   - Use for visual hierarchy
                   - Common emojis:
                     * 📊 for statistics
                     * 📈 for trends
                     * ⚠️ for warnings
                     * 💡 for insights
                     * 🔍 for analysis
                     * 📌 for key points
                     * 💰 for financial data
                     * 📦 for inventory data
                     * 🔄 for actions
                     * 📋 for lists
                     * ✅ for good status
                     * 🟡 for warning
                     * ❌ for critical

                8. Code Blocks:
                   - Use \`\`\`sql for SQL queries
                   - Use \`\`\` for other code
                   - Add comments for clarity

                9. Links:
                   - Use [text](url) format
                   - Keep link text descriptive

                10. UI Design Guidelines:
                    - Keep text left-aligned
                    - Use consistent font sizes
                    - Maintain proper spacing
                    - Ensure tables are responsive
                    - Use appropriate colors
                    - Keep layout clean
                    - Make content scannable
                    - Use whitespace effectively
                    - Ensure good contrast
                    - Keep design consistent
               `
      });

      // Post-process the AI response for empty or error results
      if (
        !object?.Topic?.Description ||
        /empty set|no data|no results|no sales|no records|not found|no matching/i.test(object.Topic.Description)
      ) {
        object.Topic.Heading = "No Data Found";
        object.Topic.Description = "No sales data found for the selected period.";
      }

      // Enforce language/fields based on configured DB type
      try {
        const dbType = (dbConfig?.type || '').toLowerCase();
        if (dbType === 'mongodb') {
          if (object?.Topic) {
            object.Topic.Language = 'mongodb' as any;
            // If AI returned SQL by mistake, drop it to avoid confusion
            if (Array.isArray(object.Topic.SqlQuery)) {
              object.Topic.SqlQuery = [];
            }
          }
        } else {
          if (object?.Topic) {
            object.Topic.Language = 'sql' as any;
            if (Array.isArray(object.Topic.MongoQuery)) {
              object.Topic.MongoQuery = [];
            }
          }
        }
      } catch {}

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