import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stars, teams } from '@/db/schema';
import { desc, ilike, or, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    if (!keyword) {
      const starList = await db.select({
        id: stars.id,
        name: stars.name,
        nameEn: stars.nameEn,
        avatar: stars.avatar,
        position: stars.position,
        teamId: stars.teamId,
        teamName: teams.name
      }).from(stars).leftJoin(teams, eq(stars.teamId, teams.id)).orderBy(desc(stars.pts)).limit(20);
      return NextResponse.json({ code: 0, msg: '获取成功', data: starList });
    }

    // 模糊匹配搜索球星
    const starList = await db.select({
      id: stars.id,
      name: stars.name,
      nameEn: stars.nameEn,
      avatar: stars.avatar,
      position: stars.position,
      teamId: stars.teamId,
      teamName: teams.name
    }).from(stars).leftJoin(teams, eq(stars.teamId, teams.id)).where(
      or(
        ilike(stars.name, `%${keyword}%`),
        ilike(stars.nameEn, `%${keyword}%`)
      )
    ).orderBy(desc(stars.pts)).limit(20);

    return NextResponse.json({ code: 0, msg: '获取成功', data: starList });

  } catch (error) {
    console.error('Search stars error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
