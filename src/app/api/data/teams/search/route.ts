import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/db/schema';
import { desc, ilike, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    if (!keyword) {
      const teamList = await db.select({
        id: teams.id,
        name: teams.name,
        nameEn: teams.nameEn,
        conference: teams.conference,
        logo: teams.logo
      }).from(teams).orderBy(desc(teams.winPct)).limit(20);
      return NextResponse.json({ code: 0, msg: '获取成功', data: teamList });
    }

    // 模糊匹配搜索球队
    const teamList = await db.select({
      id: teams.id,
      name: teams.name,
      nameEn: teams.nameEn,
      conference: teams.conference,
      logo: teams.logo
    }).from(teams).where(
      or(
        ilike(teams.name, `%${keyword}%`),
        ilike(teams.nameEn, `%${keyword}%`)
      )
    ).orderBy(desc(teams.winPct)).limit(20);

    return NextResponse.json({ code: 0, msg: '获取成功', data: teamList });

  } catch (error) {
    console.error('Search teams error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
