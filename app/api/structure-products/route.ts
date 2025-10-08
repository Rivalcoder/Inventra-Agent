import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Schema for product extraction - category and minStock are now required
const ProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1), // Required - will always be provided
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  minStock: z.number().int().nonnegative(), // Required - will always be provided (default 5 if missing)
  supplier: z.string().min(1).optional(),
});

const OutputSchema = z.object({
  products: z.array(ProductSchema),
  notes: z.string().optional().default(''),
  debug: z.object({
    originalText: z.string().optional(),
    detectedFields: z.array(z.string()).optional(),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const raw = typeof body === 'string' ? body : body.raw || body.text || body.content || '';
    if (!raw || typeof raw !== 'string') {
      return NextResponse.json({ error: 'Missing raw text to structure' }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google('gemini-2.5-flash-lite'),
      schema: OutputSchema,
      temperature: 0.1, // Lower temperature for more consistent parsing
      prompt: `Parse the following inventory data into JSON format. The data contains product information in tabular format.

CRITICAL RULES:
1. ALWAYS extract the category field - look for words like "Electronics", "Accessories", "Stationery" in each row
2. ALWAYS extract minStock - if present in data use that value, if missing use default value 5
3. Extract ALL available fields for each product

FIELD EXTRACTION RULES:
- name: The product name (usually first field)
- category: The category word (Electronics/Accessories/Stationery/etc.) - REQUIRED
- price: Convert to number, remove commas and currency symbols
- stock: Current stock quantity as integer
- minStock: If present in data use that value, if missing use 5 as default - REQUIRED
- supplier: The supplier/vendor name

EXAMPLE PARSING:
Input: "Dell XPS 13 Laptop Electronics 85,000 12 5 TechZone Pyt, Ltd."
Output: {
  "name": "Dell XPS 13 Laptop",
  "category": "Electronics",
  "price": 85000,
  "stock": 12,
  "minStock": 5,
  "supplier": "TechZone Pyt, Ltd."
}

EXAMPLE PARSING (missing minStock):
Input: "Wireless Mouse Accessories 800 45 SmartTech Supplies"
Output: {
  "name": "Wireless Mouse",
  "category": "Accessories", 
  "price": 800,
  "stock": 45,
  "minStock": 5,
  "supplier": "SmartTech Supplies"
}

MANDATORY: Every product MUST have a category and minStock field. If category is missing, use "General". If minStock is missing, use 5.

INPUT DATA:
${raw}`,
    });

    // Post-process to ensure category and minStock are always present
    const processedProducts = object.products.map(product => ({
      ...product,
      category: product.category || 'General',
      minStock: product.minStock || 5
    }));

    // Add debug information
    const debugInfo = {
      originalText: raw.substring(0, 200) + '...',
      extractedCount: object.products.length,
      processedCount: processedProducts.length,
      categoriesFound: Array.from(new Set(processedProducts.map(p => p.category))),
      minStockValues: processedProducts.map(p => p.minStock)
    };

    return NextResponse.json({
      ...object,
      products: processedProducts,
      debug: debugInfo
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to structure products' }, { status: 500 });
  }
}


