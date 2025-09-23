import { NextResponse } from 'next/server';

// Proxies uploads to an external extractor (PDF or Image) and returns extracted text/JSON
// Expects multipart/form-data with field 'file' and a query param kind=pdf|image
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind') === 'pdf' ? 'pdf' : 'image';

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const extractorBase = process.env.RAPID_EXTRACTOR_BASE || 'https://Rivalcoder-Rapid-Extractor.hf.space';
    const path = kind === 'pdf' ? '/extract-pdf' : '/extract-image';

    const forwardForm = new FormData();
    forwardForm.append('file', file, (file as any).name || `upload.${kind === 'pdf' ? 'pdf' : 'png'}`);

    const res = await fetch(`${extractorBase}${path}`, {
      method: 'POST',
      body: forwardForm,
    });

    const text = await res.text();
    console.log(text)
    let json: any;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!res.ok) {
      return NextResponse.json({ error: 'Extractor error', status: res.status, data: json }, { status: 502 });
    }
    console.log('Extractor response:', json);
    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unexpected error' }, { status: 500 });
  }
}


