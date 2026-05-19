import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq, and, ne } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ code: 401, msg: '未登录' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ code: 401, msg: 'token 无效' }, { status: 401 });
    }

    const { avatarUrl, nickname, phone } = await request.json();

    // 手机号验重（排除当前用户自己）
    if (phone) {
      const existingRows = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.phone, phone), ne(users.id, payload.userId)))
        .limit(1);
      const existing = existingRows[0];
      if (existing) {
        return NextResponse.json({ code: 1, msg: '该手机号已被其他账号绑定' });
      }
    }

    await db.update(users).set({
      nickname,
      avatarUrl: avatarUrl || null,
      phone: phone || null,
      status: 'active'
    }).where(eq(users.id, payload.userId));

    return NextResponse.json({ code: 0, msg: '注册成功' });
  } catch (error) {
    console.error('Init profile error:', error);
    return NextResponse.json({ code: 1, msg: '服务器错误' }, { status: 500 });
  }
}
