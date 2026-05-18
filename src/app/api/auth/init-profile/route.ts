import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

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
      const existing = await sql`
        SELECT id FROM users WHERE phone = ${phone} AND id != ${payload.userId}
      `;
      if (existing.length > 0) {
        return NextResponse.json({ code: 1, msg: '该手机号已被其他账号绑定' });
      }

      // TODO: 后续扩展短信验证码校验
      // const verified = await verifySmsCode(phone, smsCode);
      // if (!verified) return NextResponse.json({ code: 1, msg: '验证码错误或已过期' });
    }

    await sql`
      UPDATE users
      SET nickname   = ${nickname},
          avatar_url = ${avatarUrl || null},
          phone      = ${phone || null},
          status     = 'active'
      WHERE id = ${payload.userId}
    `;

    return NextResponse.json({ code: 0, msg: '注册成功' });
  } catch (error) {
    console.error('Init profile error:', error);
    return NextResponse.json({ code: 1, msg: '服务器错误' }, { status: 500 });
  }
}
