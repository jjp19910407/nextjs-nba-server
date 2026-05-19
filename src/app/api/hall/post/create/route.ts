import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, polls } from '@/db/schema';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const payload = verifyToken(token!);

    if (!payload) {
      return NextResponse.json({ code: 1, msg: '未授权' }, { status: 401 });
    }

    const { title, cover, content, hasPoll, pollOptions, relatedTeamId, relatedStarIds } = await request.json();

    if (!title) {
      return NextResponse.json({ code: 1, msg: '标题不能为空' });
    }

    // 1. 创建帖子
    const [newPost] = await db.insert(posts).values({
      userId: payload.userId,
      title,
      cover: cover || null,
      content: content || null,
      hasPoll: hasPoll || false,
      relatedTeamId: relatedTeamId || null,
      relatedStarIds: relatedStarIds || null
    }).returning();

    // 2. 如果有投票，创建投票
    if (hasPoll && pollOptions && pollOptions.length > 0) {
      const options = pollOptions.map((text: string, index: number) => ({
        id: index + 1,
        text,
        voteCount: 0
      }));

      await db.insert(polls).values({
        postId: newPost.id,
        options: options
      });
    }

    return NextResponse.json({
      code: 0,
      msg: '发布成功',
      data: { postId: newPost.id }
    });

  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ code: 1, msg: '发布失败' }, { status: 500 });
  }
}
