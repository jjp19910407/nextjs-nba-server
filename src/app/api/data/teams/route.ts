import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const teams = await sql`
      SELECT * FROM teams ORDER BY win_pct DESC
    `;

    if (teams.length === 0) {
      // 返回模拟数据
      const mockTeams = [
        { id: 1, name: '波士顿凯尔特人', nameEn: 'Boston Celtics', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg', wins: 57, losses: 25, winPct: 0.695 },
        { id: 2, name: '俄克拉荷马雷霆', nameEn: 'Oklahoma City Thunder', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg', wins: 56, losses: 26, winPct: 0.683 },
        { id: 3, name: '丹佛掘金', nameEn: 'Denver Nuggets', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg', wins: 55, losses: 27, winPct: 0.671 },
        { id: 4, name: '密尔沃基雄鹿', nameEn: 'Milwaukee Bucks', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg', wins: 54, losses: 28, winPct: 0.659 }
      ];
      return NextResponse.json({ code: 0, msg: '获取成功', data: mockTeams });
    }

    return NextResponse.json({ code: 0, msg: '获取成功', data: teams });

  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
