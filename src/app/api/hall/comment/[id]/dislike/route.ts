import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments, commentDislikes, commentLikes } from '@/db/schema';
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

    const existingRows = await db.select().from(commentDislikes)
      .where(and(eq(commentDislikes.commentId, commentId), eq(commentDislikes.userId, payload.userId)))
      .limit(1);
    const existing = existingRows[0];

    if (existing) {
      await db.delete(commentDislikes).where(eq(commentDislikes.id, existing.id));
      await db.update(comments).set({
        dislikeCount: sql`${comments.dislikeCount} - 1`
      }).where(eq(comments.id, commentId));
      return NextResponse.json({ code: 0, msg: '取消点踩', data: { disliked: false } });
    } else {
      // 点踩，同时取消点赞
      const likeRows = await db.select().from(commentLikes)
        .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, payload.userId)))
        .limit(1);
      if (likeRows[0]) {
        await db.delete(commentLikes).where(eq(commentLikes.id, likeRows[0].id));
        await db.update(comments).set({
          likeCount: sql`${comments.likeCount} - 1`
        }).where(eq(comments.id, commentId));
      }

      await db.insert(commentDislikes).values({ commentId, userId: payload.userId });
      await db.update(comments).set({
        dislikeCount: sql`${comments.dislikeCount} + 1`
      }).where(eq(comments.id, commentId));
      return NextResponse.json({ code: 0, msg: '点踩成功', data: { disliked: true, canceledLike: !!likeRows[0] } });
    }
  } catch (error) {
    console.error('Dislike comment error:', error);
    return NextResponse.json({ code: 1, msg: '操作失败' }, { status: 500 });
  }
}
