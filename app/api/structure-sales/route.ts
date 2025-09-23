import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const SaleSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().optional(),
  quantity: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
  date: z.string().optional(),
  customer: z.string().optional(),
});

const OutputSchema = z.object({
  sales: z.array(SaleSchema),
  notes: z.string().optional(),
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
      prompt: `Extract sales entries from the text. Include only explicitly present fields among: productId, productName, quantity, price, total, date, customer.
- Do not guess missing values. Omit fields that are not clearly present.
- Parse currency to numeric price/total, parse qty to integer quantity.
- Keep date strings as-is if provided.

Input:
${raw}`,
    });

    return NextResponse.json(object);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to structure sales' }, { status: 500 });
  }
}


