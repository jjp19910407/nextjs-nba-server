import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userStars } from '@/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const payload = verifyToken(token!);

    if (!payload) {
      return NextResponse.json({ code: 1, msg: '未授权' }, { status: 401 });
    }

    // stars 格式: [{starId: 1, starName: '詹姆斯', role: 'main'}, ...]
    const { nickname, avatarUrl, slogan, age, watchYears, teamId, teamName, stars } = await request.json();

    // 1. 更新用户主表
    await db.update(users).set({
      nickname: nickname ?? null,
      avatarUrl: avatarUrl ?? null,
      slogan: slogan ?? null,
      age: age ?? null,
      watchYears: watchYears ?? null,
      mainTeamId: teamId ?? null,
      mainTeamName: teamName ?? null,
      status: 'completed',
      updatedAt: new Date()
    }).where(eq(users.id, payload.userId));

    // 2. 清理旧的球星关联
    await db.delete(userStars).where(eq(userStars.userId, payload.userId));

    // 3. 插入新的球星关联（主球星权重1，副球星0.5）
    if (stars && stars.length > 0) {
      const starValues = stars.map((s: any) => ({
        userId: payload.userId,
        starId: s.starId,
        starName: s.starName ?? null,
        role: s.role,
        weight: s.role === 'main' ? 1.0 : 0.5
      }));
      await db.insert(userStars).values(starValues);
    }

    return NextResponse.json({
      code: 0,
      msg: '资料保存成功',
      data: { userId: payload.userId, initStatus: 'completed' }
    });

  } catch (error) {
    console.error('Profile init error:', error);
    return NextResponse.json({ code: 1, msg: '保存失败' }, { status: 500 });
  }
}
