import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, postLikes, postDislikes } from '@/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const payload = verifyToken(token!);

    if (!payload) {
      return NextResponse.json({ code: 1, msg: '未授权' }, { status: 401 });
    }

    const postId = parseInt(params.id);

    const existingLikeRows = await db.select().from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, payload.userId)))
      .limit(1);
    const existingLike = existingLikeRows[0];

    if (existingLike) {
      // 取消点赞
      await db.delete(postLikes).where(eq(postLikes.id, existingLike.id));
      await db.update(posts).set({
        likeCount: sql`${posts.likeCount} - 1`
      }).where(eq(posts.id, postId));
      return NextResponse.json({ code: 0, msg: '取消点赞', data: { liked: false } });
    } else {
      // 点赞，同时取消点踩
      const dislikeRows = await db.select().from(postDislikes)
        .where(and(eq(postDislikes.postId, postId), eq(postDislikes.userId, payload.userId)))
        .limit(1);
      if (dislikeRows[0]) {
        await db.delete(postDislikes).where(eq(postDislikes.id, dislikeRows[0].id));
        await db.update(posts).set({
          dislikeCount: sql`${posts.dislikeCount} - 1`
        }).where(eq(posts.id, postId));
      }

      await db.insert(postLikes).values({ postId, userId: payload.userId });
      await db.update(posts).set({
        likeCount: sql`${posts.likeCount} + 1`
      }).where(eq(posts.id, postId));
      return NextResponse.json({ code: 0, msg: '点赞成功', data: { liked: true, canceledDislike: !!dislikeRows[0] } });
    }
  } catch (error) {
    console.error('Like post error:', error);
    return NextResponse.json({ code: 1, msg: '操作失败' }, { status: 500 });
  }
}

