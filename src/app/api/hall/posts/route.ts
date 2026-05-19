import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users } from '@/db/schema';
import { desc, eq, and, or, like, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all'; // hot 或 all
    const keyword = searchParams.get('keyword') || '';
    const teamId = searchParams.get('teamId');
    const starId = searchParams.get('starId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (keyword) {
      conditions.push(or(
        like(posts.title, `%${keyword}%`),
        like(posts.content, `%${keyword}%`)
      ));
    }

    if (teamId) {
      conditions.push(eq(posts.relatedTeamId, parseInt(teamId)));
    }

    if (starId) {
      // JSONB数组包含指定球星ID
      // 这里简化处理，实际可能需要更复杂的JSONB查询
    }

    const postList = await db
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        ...(type === 'hot'
          ? [desc(posts.likeCount), desc(posts.createdAt)]
          : [desc(posts.createdAt)])
      )
      .limit(limit)
      .offset(offset);

    // 如果是热门，只取10条
    const finalPosts = type === 'hot' ? postList.slice(0, 10) : postList;

    return NextResponse.json({
      code: 0,
      msg: '获取成功',
      data: {
        list: finalPosts,
        pagination: {
          page,
          limit,
          total: finalPosts.length // 简化处理
        }
      }
    });

  } catch (error: any) {
    console.error('Get posts error:', error);
    return NextResponse.json({ code: 1, msg: error?.message || '获取失败', stack: error?.stack }, { status: 500 });
  }
}
