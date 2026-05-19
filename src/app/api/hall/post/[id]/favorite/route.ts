import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { favorites } from '@/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const payload = verifyToken(token!);

    if (!payload) {
      return NextResponse.json({ code: 1, msg: '未授权' }, { status: 401 });
    }

    const postId = parseInt(params.id);

    // 检查是否已收藏
    const existingFavRows = await db.select().from(favorites)
      .where(and(eq(favorites.postId, postId), eq(favorites.userId, payload.userId)))
      .limit(1);
    const existingFav = existingFavRows[0];

    if (existingFav) {
      // 取消收藏
      await db.delete(favorites).where(eq(favorites.id, existingFav.id));
      return NextResponse.json({ code: 0, msg: '取消收藏', data: { favorited: false } });
    } else {
      // 收藏
      await db.insert(favorites).values({
        postId,
        userId: payload.userId
      });
      return NextResponse.json({ code: 0, msg: '收藏成功', data: { favorited: true } });
    }

  } catch (error) {
    console.error('Favorite post error:', error);
    return NextResponse.json({ code: 1, msg: '操作失败' }, { status: 500 });
  }
}
