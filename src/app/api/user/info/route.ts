import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userStars, stars, teams } from '@/db/schema';
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
    const userRows = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
    const user = userRows[0];
	
    // 获取用户球星关联并关联球星详情
    const userStarList = await db
      .select({
        id: userStars.id,
        userId: userStars.userId,
        starId: userStars.starId,
        starName: userStars.starName,
        role: userStars.role,
        weight: userStars.weight,
        customAvatar: userStars.customAvatar,
        // 用户保存的荣誉数据
        allNba: userStars.allNba,
        allDefense: userStars.allDefense,
        mvp: userStars.mvp,
        fmvp: userStars.fmvp,
        championships: userStars.championships,
        allStar: userStars.allStar,
        // 球星详情
        name: stars.name,
        nameEn: stars.nameEn,
        avatar: stars.avatar,
        position: stars.position,
        teamId: stars.teamId,
        pts: stars.pts,
        reb: stars.reb,
        ast: stars.ast,
        stl: stars.stl,
        blk: stars.blk
      })
      .from(userStars)
      .leftJoin(stars, eq(userStars.starId, stars.id))
      .where(eq(userStars.userId, payload.userId));

    // 获取用户主队信息
    let userTeam = null;
    if (user?.mainTeamId) {
      const teamRows = await db.select().from(teams).where(eq(teams.id, user.mainTeamId)).limit(1);
      userTeam = teamRows[0] || null;
    }

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
          verified: (user.creditScore ?? 0) >= 200, // 模拟认证状态
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        userStars: userStarList.map(us => ({
          ...us,
          teamName: userTeam?.name || null
        })),
        userTeam: userTeam,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
