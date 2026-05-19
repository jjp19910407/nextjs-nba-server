import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, postDislikes, postLikes } from '@/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq, and, sql } from 'drizzle-orm';

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

    const existingRows = await db.select().from(postDislikes)
      .where(and(eq(postDislikes.postId, postId), eq(postDislikes.userId, payload.userId)))
      .limit(1);
    const existing = existingRows[0];

    if (existing) {
      // 取消点踩
      await db.delete(postDislikes).where(eq(postDislikes.id, existing.id));
      await db.update(posts).set({
        dislikeCount: sql`${posts.dislikeCount} - 1`
      }).where(eq(posts.id, postId));
      return NextResponse.json({ code: 0, msg: '取消点踩', data: { disliked: false } });
    } else {
      // 点踩，同时取消点赞
      const likeRows = await db.select().from(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, payload.userId)))
        .limit(1);
      if (likeRows[0]) {
        await db.delete(postLikes).where(eq(postLikes.id, likeRows[0].id));
        await db.update(posts).set({
          likeCount: sql`${posts.likeCount} - 1`
        }).where(eq(posts.id, postId));
      }

      await db.insert(postDislikes).values({ postId, userId: payload.userId });
      await db.update(posts).set({
        dislikeCount: sql`${posts.dislikeCount} + 1`
      }).where(eq(posts.id, postId));
      return NextResponse.json({ code: 0, msg: '点踩成功', data: { disliked: true, canceledLike: !!likeRows[0] } });
    }
  } catch (error) {
    console.error('Dislike post error:', error);
    return NextResponse.json({ code: 1, msg: '操作失败' }, { status: 500 });
  }
}
