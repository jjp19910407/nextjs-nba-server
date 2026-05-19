import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stars, teams } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 今日之星（迭代一：返回单个MVP球员，Mock数据）
export async function GET() {
  try {
    // Mock: 默认展示勒布朗·詹姆斯，实际可以根据当日比赛数据更新
    const mvp = await db.select({
      id: stars.id,
      name: stars.name,
      nameEn: stars.nameEn,
      teamId: stars.teamId,
      avatar: stars.avatar,
      position: stars.position,
      pts: stars.pts,
      reb: stars.reb,
      ast: stars.ast,
      stl: stars.stl,
      blk: stars.blk,
      teamName: teams.name,
      teamLogo: teams.logo
    }).from(stars).leftJoin(teams, eq(stars.teamId, teams.id)).where(eq(stars.id, 23)).limit(1);

    if (!mvp || mvp.length === 0) {
      // 如果数据库没有，返回模拟数据
      return NextResponse.json({
        code: 0,
        msg: '获取成功',
        data: {
          id: 23,
          name: '勒布朗·詹姆斯',
          nameEn: 'LeBron James',
          team: '洛杉矶湖人队',
          teamId: 14,
          avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png',
          position: 'SF',
          pts: 28.5,
          reb: 7.8,
          ast: 8.3,
          stl: 1.2,
          blk: 0.6
        }
      });
    }

    const result = mvp[0];
    return NextResponse.json({
      code: 0,
      msg: '获取成功',
      data: {
        ...result,
        team: result.teamName,
        teamLogo: result.teamLogo
      }
    });

  } catch (error) {
    console.error('Get today star error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
