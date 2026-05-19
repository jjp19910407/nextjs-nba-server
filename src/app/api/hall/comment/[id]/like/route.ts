import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments, commentLikes, commentDislikes } from '@/db/schema';
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

    const commentId = parseInt(params.id);

    const existingLikeRows = await db.select().from(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, payload.userId)))
      .limit(1);
    const existingLike = existingLikeRows[0];

    if (existingLike) {
      await db.delete(commentLikes).where(eq(commentLikes.id, existingLike.id));
      await db.update(comments).set({
        likeCount: sql`${comments.likeCount} - 1`
      }).where(eq(comments.id, commentId));
      return NextResponse.json({ code: 0, msg: '取消点赞', data: { liked: false } });
    } else {
      // 点赞，同时取消点踩
      const dislikeRows = await db.select().from(commentDislikes)
        .where(and(eq(commentDislikes.commentId, commentId), eq(commentDislikes.userId, payload.userId)))
        .limit(1);
      if (dislikeRows[0]) {
        await db.delete(commentDislikes).where(eq(commentDislikes.id, dislikeRows[0].id));
        await db.update(comments).set({
          dislikeCount: sql`${comments.dislikeCount} - 1`
        }).where(eq(comments.id, commentId));
      }

      await db.insert(commentLikes).values({ commentId, userId: payload.userId });
      await db.update(comments).set({
        likeCount: sql`${comments.likeCount} + 1`
      }).where(eq(comments.id, commentId));
      return NextResponse.json({ code: 0, msg: '点赞成功', data: { liked: true, canceledDislike: !!dislikeRows[0] } });
    }
  } catch (error) {
    console.error('Like comment error:', error);
    return NextResponse.json({ code: 1, msg: '操作失败' }, { status: 500 });
  }
}

