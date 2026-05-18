import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'hot';

    let news;

    if (type === 'hot') {
      news = await sql`SELECT * FROM news WHERE type = 'hot' ORDER BY published_at DESC LIMIT 20`;
    } else {
      // team/star 类型需要关联用户信息
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      const payload = verifyToken(token!);

      if (payload) {
        if (type === 'team') {
          const [user] = await sql`SELECT main_team_id FROM users WHERE id = ${payload.userId}`;
          if (user?.main_team_id) {
            news = await sql`SELECT * FROM news WHERE related_team_id = ${user.main_team_id} ORDER BY published_at DESC LIMIT 20`;
          }
        } else if (type === 'star') {
          const userStars = await sql`SELECT star_id FROM user_stars WHERE user_id = ${payload.userId}`;
          const starIds = userStars.map((s: any) => s.star_id);
          if (starIds.length > 0) {
            news = await sql`SELECT * FROM news WHERE related_star_ids && ${starIds} ORDER BY published_at DESC LIMIT 20`;
          }
        }
      }
    }

    if (!news || news.length === 0) {
      const mockNews = [
        { id: 1, title: 'NBA官宣：全明星投票正式开启', cover: 'https://picsum.photos/400/200?random=1', time: '2026-05-15', type: 'hot' },
        { id: 2, title: '詹姆斯砍下40+大三双率队逆转', cover: 'https://picsum.photos/400/200?random=2', time: '2026-05-14', type: 'hot' },
        { id: 3, title: '库里三分球命中数突破3500大关', cover: 'https://picsum.photos/400/200?random=3', time: '2026-05-13', type: 'hot' }
      ];
      return NextResponse.json({ code: 0, msg: '获取成功', data: mockNews });
    }

    return NextResponse.json({ code: 0, msg: '获取成功', data: news });

  } catch (error) {
    console.error('Get news error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
