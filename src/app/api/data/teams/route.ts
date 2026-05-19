import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const teamList = await db.select().from(teams).orderBy(desc(teams.winPct));

    if (teamList.length === 0) {
      // 返回模拟数据
      const mockTeams = [
        // 东部
        { id: 1, name: '波士顿凯尔特人', nameEn: 'Boston Celtics', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg', wins: 57, losses: 25, winPct: 0.695 },
        { id: 2, name: '密尔沃基雄鹿', nameEn: 'Milwaukee Bucks', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg', wins: 54, losses: 28, winPct: 0.659 },
        { id: 3, name: '费城76人', nameEn: 'Philadelphia 76ers', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg', wins: 51, losses: 31, winPct: 0.622 },
        { id: 4, name: '纽约尼克斯', nameEn: 'New York Knicks', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg', wins: 48, losses: 34, winPct: 0.585 },
        { id: 5, name: '克利夫兰骑士', nameEn: 'Cleveland Cavaliers', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg', wins: 46, losses: 36, winPct: 0.561 },
        { id: 6, name: '迈阿密热火', nameEn: 'Miami Heat', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg', wins: 44, losses: 38, winPct: 0.537 },
        // 西部
        { id: 7, name: '俄克拉荷马雷霆', nameEn: 'Oklahoma City Thunder', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg', wins: 56, losses: 26, winPct: 0.683 },
        { id: 8, name: '丹佛掘金', nameEn: 'Denver Nuggets', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg', wins: 55, losses: 27, winPct: 0.671 },
        { id: 9, name: '明尼苏达森林狼', nameEn: 'Minnesota Timberwolves', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg', wins: 52, losses: 30, winPct: 0.634 },
        { id: 10, name: '洛杉矶快船', nameEn: 'LA Clippers', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg', wins: 49, losses: 33, winPct: 0.598 },
        { id: 11, name: '达拉斯独行侠', nameEn: 'Dallas Mavericks', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg', wins: 47, losses: 35, winPct: 0.573 },
        { id: 12, name: '菲尼克斯太阳', nameEn: 'Phoenix Suns', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg', wins: 45, losses: 37, winPct: 0.549 }
      ];
      return NextResponse.json({ code: 0, msg: '获取成功', data: mockTeams });
    }

    return NextResponse.json({ code: 0, msg: '获取成功', data: teamList });

  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
