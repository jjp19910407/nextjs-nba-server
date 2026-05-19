import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { news, users, userStars } from '@/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { sql as drizzleSql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'hot';

    let newsList;

    if (type === 'hot') {
      newsList = await db.select().from(news).where(eq(news.type, 'hot')).orderBy(desc(news.publishedAt)).limit(20);
    } else {
      // team/star 类型需要关联用户信息
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      const payload = verifyToken(token!);

      if (payload) {
        if (type === 'team') {
          const userRows = await db
            .select({ mainTeamId: users.mainTeamId })
            .from(users)
            .where(eq(users.id, payload.userId))
            .limit(1);
          const user = userRows[0];
          if (user?.mainTeamId) {
            newsList = await db.select().from(news).where(eq(news.relatedTeamId, user.mainTeamId)).orderBy(desc(news.publishedAt)).limit(20);
          }
        } else if (type === 'star') {
          const userStarList = await db.select({ starId: userStars.starId }).from(userStars).where(eq(userStars.userId, payload.userId));
          const starIds = userStarList.map(s => s.starId);
          if (starIds.length > 0) {
            newsList = await db.select().from(news).where(drizzleSql`${news.relatedStarIds} && ${starIds}`).orderBy(desc(news.publishedAt)).limit(20);
          }
        }
      }
    }

    if (!newsList || newsList.length === 0) {
      const mockNews = [
        { id: 1, title: 'NBA官宣：全明星投票正式开启', cover: 'https://picsum.photos/400/200?random=1', time: '2026-05-15', type: 'hot' },
        { id: 2, title: '詹姆斯砍下40+大三双率队逆转', cover: 'https://picsum.photos/400/200?random=2', time: '2026-05-14', type: 'hot' },
        { id: 3, title: '库里三分球命中数突破3500大关', cover: 'https://picsum.photos/400/200?random=3', time: '2026-05-13', type: 'hot' }
      ];
      return NextResponse.json({ code: 0, msg: '获取成功', data: mockNews });
    }

    return NextResponse.json({ code: 0, msg: '获取成功', data: newsList });

  } catch (error) {
    console.error('Get news error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
