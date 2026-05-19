import { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ code: 1, msg: '缺少 token' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ code: 1, msg: 'token 已失效' }, { status: 401 });
    }

    const newToken = signToken({ userId: payload.userId, openid: payload.openid });

    return NextResponse.json({ code: 0, msg: '刷新成功', data: { token: newToken } });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ code: 1, msg: '服务器错误' }, { status: 500 });
  }
}
