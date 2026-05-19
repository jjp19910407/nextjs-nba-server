import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userStars } from '@/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const payload = verifyToken(token!);

    if (!payload) {
      return NextResponse.json({ code: 1, msg: '未授权' }, { status: 401 });
    }
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId)
    });
    const userStarList = await db.select().from(userStars).where(eq(userStars.userId, payload.userId));

    if (!user) {
      return NextResponse.json({ code: 1, msg: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({
      code: 0,
      msg: '获取成功',
      data: {
        userProfile: {
          id: user.id,
          openid: user.openid,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          phone: user.phone,
          slogan: user.slogan,
          watchYears: user.watchYears,
          age: user.age,
          teamId: user.mainTeamId,
          teamName: user.mainTeamName,
          status: user.status,
          creditScore: user.creditScore,
          points: user.points,
          level: user.level,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        userStars: userStarList,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
