import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, postLikes, postDislikes, favorites, polls, pollVotes } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

// 获取帖子详情
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = parseInt(params.id);

    const postRows = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        title: posts.title,
        cover: posts.cover,
        content: posts.content,
        hasPoll: posts.hasPoll,
        relatedTeamId: posts.relatedTeamId,
        relatedStarIds: posts.relatedStarIds,
        viewCount: sql<number>`${posts.viewCount}`,
        likeCount: sql<number>`${posts.likeCount}`,
        dislikeCount: sql<number>`${posts.dislikeCount}`,
        commentCount: sql<number>`${posts.commentCount}`,
        createdAt: posts.createdAt,
        userName: users.nickname,
        userAvatar: users.avatarUrl
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId))
      .limit(1);

    if (postRows.length === 0) {
      return NextResponse.json({ code: 1, msg: '帖子不存在' }, { status: 404 });
    }

    const post = postRows[0];

    // 增加浏览量
    await db.update(posts).set({
      viewCount: (post.viewCount || 0) + 1
    }).where(eq(posts.id, postId));

    // 获取投票信息（如果有）
    let poll: any = null;
    let userVote = null;
    if (post.hasPoll) {
      // 用 ::text cast 绕过 neon-http 的 JSONB 反序列化问题
      const pollRows = await db.select({
        id: polls.id,
        postId: polls.postId,
        isActive: polls.isActive,
        endAt: polls.endAt,
        optionsText: sql<string>`options::text`
      }).from(polls).where(eq(polls.postId, postId)).limit(1);

      if (pollRows[0]) {
        const raw = pollRows[0];
        poll = {
          id: raw.id,
          postId: raw.postId,
          isActive: raw.isActive,
          endAt: raw.endAt,
          options: JSON.parse(raw.optionsText || '[]')
        };

        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        if (token) {
          const payload = verifyToken(token);
          if (payload) {
            const voteRows = await db
              .select()
              .from(pollVotes)
              .where(and(eq(pollVotes.pollId, raw.id), eq(pollVotes.userId, payload.userId)))
              .limit(1);
            userVote = voteRows[0] || null;
          }
        }
      }
    }

    // 检查用户是否已点赞、点踩和收藏
    let isLiked = false;
    let isDisliked = false;
    let isFavorited = false;
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const [likeRows, dislikeRows, favRows] = await Promise.all([
          db.select().from(postLikes)
            .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, payload.userId)))
            .limit(1),
          db.select().from(postDislikes)
            .where(and(eq(postDislikes.postId, postId), eq(postDislikes.userId, payload.userId)))
            .limit(1),
          db.select().from(favorites)
            .where(and(eq(favorites.postId, postId), eq(favorites.userId, payload.userId)))
            .limit(1)
        ]);
        isLiked = likeRows.length > 0;
        isDisliked = dislikeRows.length > 0;
        isFavorited = favRows.length > 0;
      }
    }

    return NextResponse.json({
      code: 0,
      msg: '获取成功',
      data: {
        ...post,
        poll,
        userVote: userVote?.optionId || null,
        isLiked,
        isDisliked,
        isFavorited
      }
    });

  } catch (error) {
    console.error('Get post detail error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
