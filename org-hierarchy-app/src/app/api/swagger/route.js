import { NextResponse } from 'next/server';
import { swaggerSpec } from '../../../lib/swaggerSpec';

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
