import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Proxy endpoint for the OpenAI Responses API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (body.text?.format?.type === 'json_schema') {
      return await structuredResponse(openai, body);
    } else {
      return await textResponse(openai, body);
    }
  } catch (error) {
    console.error('JSON parsing error in responses API:', error);
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }
}

async function structuredResponse(openai: OpenAI, body: any) {
  try {
    const response = await openai.responses.parse({
      ...(body as any),
      stream: false,
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 }); 
  }
}

async function textResponse(openai: OpenAI, body: any) {
  try {
    const response = await openai.responses.create({
      ...(body as any),
      stream: false,
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
  