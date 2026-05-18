import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// 今日之星（迭代一：返回单个MVP球员，Mock数据）
export async function GET() {
  try {
    // Mock: 默认展示勒布朗·詹姆斯，实际可以根据当日比赛数据更新
    const [mvp] = await sql`
      SELECT s.*, t.name as team_name, t.logo as team_logo
      FROM stars s
      LEFT JOIN teams t ON s.team_id = t.id
      WHERE s.id = 23 -- 詹姆斯
      LIMIT 1
    `;

    if (!mvp) {
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

    return NextResponse.json({
      code: 0,
      msg: '获取成功',
      data: mvp
    });

  } catch (error) {
    console.error('Get today star error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
