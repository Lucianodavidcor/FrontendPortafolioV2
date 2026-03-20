import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { lang } = await req.json() as { lang: string };

    if (!lang || typeof lang !== 'string' || lang.length > 10) {
      return NextResponse.json({ error: 'Código de idioma inválido' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set('NEXT_LOCALE', lang.toLowerCase(), {
      path:     '/',
      maxAge:   60 * 60 * 24 * 365, // 1 año
      sameSite: 'lax',
      httpOnly: false, // accesible desde JS para el context client
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}