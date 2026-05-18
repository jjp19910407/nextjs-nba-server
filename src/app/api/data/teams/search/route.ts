import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    if (!keyword) {
      const teams = await sql`
        SELECT id, name, name_en AS nameEn, conference, logo
        FROM teams
        ORDER BY win_pct DESC
        LIMIT 20
      `;
      return NextResponse.json({ code: 0, msg: '获取成功', data: teams });
    }

    // 模糊匹配搜索球队
    const teams = await sql`
      SELECT id, name, name_en AS nameEn, conference, logo
      FROM teams
      WHERE name ILIKE ${'%' + keyword + '%'} OR name_en ILIKE ${'%' + keyword + '%'}
      ORDER BY win_pct DESC
      LIMIT 20
    `;

    return NextResponse.json({ code: 0, msg: '获取成功', data: teams });

  } catch (error) {
    console.error('Search teams error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
