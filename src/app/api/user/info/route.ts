import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const payload = verifyToken(token!);

    if (!payload) {
      return NextResponse.json({ code: 1, msg: '未授权' }, { status: 401 });
    }

    const [user] = await sql`SELECT * FROM users WHERE id = ${payload.userId}`;
    const userStars = await sql`SELECT * FROM user_stars WHERE user_id = ${payload.userId}`;

    return NextResponse.json({
      code: 0,
      msg: '获取成功',
      data: {
        userProfile: user,
        userStars: userStars,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
