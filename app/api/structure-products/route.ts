import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Allow partial extraction: include only fields detected from the source
const ProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  minStock: z.number().int().nonnegative().optional(),
  supplier: z.string().optional(),
});

const OutputSchema = z.object({
  products: z.array(ProductSchema),
  notes: z.string().optional().default(''),
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
      prompt: `You are an expert inventory data parser. Extract product records from the following text and output a clean JSON matching the provided schema exactly.

Constraints:
- Map fields only if they are EXPLICITLY present: name, description, category, price, stock, minStock, supplier.
- DO NOT invent or guess fields. If a field is not present, OMIT it entirely.
- For numbers, when explicitly present: parse currency to number for price; parse qty/units to stock.
- Prefer product names as they appear. Trim whitespace. Do not normalize categories unless clearly stated.

Input:
${raw}`,
    });

    return NextResponse.json(object);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to structure products' }, { status: 500 });
  }
}


