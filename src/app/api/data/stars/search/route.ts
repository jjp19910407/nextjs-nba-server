import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    if (!keyword) {
      const stars = await sql`
        SELECT s.id, s.name, s.name_en AS nameEn, s.avatar, s.position, s.team_id AS teamId, t.name AS teamName
        FROM stars s
        LEFT JOIN teams t ON s.team_id = t.id
        ORDER BY s.pts DESC
        LIMIT 20
      `;
      return NextResponse.json({ code: 0, msg: '获取成功', data: stars });
    }

    // 模糊匹配搜索球星
    const stars = await sql`
      SELECT s.id, s.name, s.name_en AS nameEn, s.avatar, s.position, s.team_id AS teamId, t.name AS teamName
      FROM stars s
      LEFT JOIN teams t ON s.team_id = t.id
      WHERE s.name ILIKE ${'%' + keyword + '%'} OR s.name_en ILIKE ${'%' + keyword + '%'}
      ORDER BY s.pts DESC
      LIMIT 20
    `;

    return NextResponse.json({ code: 0, msg: '获取成功', data: stars });

  } catch (error) {
    console.error('Search stars error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
