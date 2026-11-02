import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('ig_token');
  cookieStore.delete('ig_user_id');

  return NextResponse.redirect(new URL('/', request.url));
}
