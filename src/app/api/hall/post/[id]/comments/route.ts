import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments, users, posts, commentLikes, commentDislikes } from '@/db/schema';
import { verifyToken } from '@/lib/jwt';
import { eq, and, isNull, asc, inArray, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// 获取留言列表（含嵌套回复）
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = parseInt(params.id);

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const payload = token ? verifyToken(token) : null;

    // 获取所有留言
    const allComments = await db
      .select({
        id: comments.id,
        parentId: comments.parentId,
        userId: comments.userId,
        content: comments.content,
        likeCount: comments.likeCount,
        dislikeCount: comments.dislikeCount,
        replyCount: comments.replyCount,
        createdAt: comments.createdAt,
        userName: users.nickname,
        userAvatar: users.avatarUrl
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));

    // 批量获取当前用户的点赞/点踩状态
    let likedIds = new Set<number>();
    let dislikedIds = new Set<number>();

    if (payload && allComments.length > 0) {
      const commentIds = allComments.map(c => c.id);
      const [likedRows, dislikedRows] = await Promise.all([
        db.select({ commentId: commentLikes.commentId })
          .from(commentLikes)
          .where(and(inArray(commentLikes.commentId, commentIds), eq(commentLikes.userId, payload.userId))),
        db.select({ commentId: commentDislikes.commentId })
          .from(commentDislikes)
          .where(and(inArray(commentDislikes.commentId, commentIds), eq(commentDislikes.userId, payload.userId)))
      ]);
      likedIds = new Set(likedRows.map(r => r.commentId!));
      dislikedIds = new Set(dislikedRows.map(r => r.commentId!));
    }

    // 构建树形结构
    const map = new Map<number, any>();
    allComments.forEach(c => {
      map.set(c.id, { ...c, liked: likedIds.has(c.id), disliked: dislikedIds.has(c.id), replies: [] });
    });

    const topLevel: any[] = [];
    allComments.forEach(c => {
      if (c.parentId) {
        map.get(c.parentId)?.replies.push(map.get(c.id));
      } else {
        topLevel.push(map.get(c.id));
      }
    });

    return NextResponse.json({ code: 0, msg: '获取成功', data: topLevel });

  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}

// 发表留言
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const payload = verifyToken(token!);

    if (!payload) {
      return NextResponse.json({ code: 1, msg: '未授权' }, { status: 401 });
    }

    const postId = parseInt(params.id);
    const { content, parentId } = await request.json();

    if (!content) {
      return NextResponse.json({ code: 1, msg: '内容不能为空' });
    }

    const [newComment] = await db.insert(comments).values({
      postId,
      userId: payload.userId,
      content,
      parentId: parentId || null
    }).returning();

    await db.update(posts).set({
      commentCount: sql`${posts.commentCount} + 1`
    }).where(eq(posts.id, postId));

    if (parentId) {
      await db.update(comments).set({
        replyCount: sql`${comments.replyCount} + 1`
      }).where(eq(comments.id, parentId));
    }

    return NextResponse.json({ code: 0, msg: '留言成功', data: { commentId: newComment.id } });

  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ code: 1, msg: '留言失败' }, { status: 500 });
  }
}
