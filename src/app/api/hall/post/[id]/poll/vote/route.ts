import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { polls, pollVotes } from '@/db/schema';
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
    const { optionId } = await request.json();
    // Neon HTTP driver 可能把 JSONB 里的数字序列化为字符串，统一转 number
    const optionIdNum = Number(optionId);

    if (!optionIdNum) {
      return NextResponse.json({ code: 1, msg: '请选择选项' });
    }

    const pollRows = await db.select({
      id: polls.id,
      isActive: polls.isActive,
      optionsText: sql<string>`options::text`
    }).from(polls).where(eq(polls.postId, postId)).limit(1);
    const pollRow = pollRows[0];

    if (!pollRow) {
      return NextResponse.json({ code: 1, msg: '投票不存在' }, { status: 404 });
    }

    if (!pollRow.isActive) {
      return NextResponse.json({ code: 1, msg: '投票已结束' });
    }

    // 检查是否已投票
    const existingVoteRows = await db.select().from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollRow.id), eq(pollVotes.userId, payload.userId)))
      .limit(1);

    if (existingVoteRows[0]) {
      return NextResponse.json({ code: 1, msg: '您已投票' });
    }

    const options: { id: number; text: string; voteCount: number }[] = JSON.parse(pollRow.optionsText || '[]');

    if (options.length === 0) {
      return NextResponse.json({ code: 1, msg: '投票选项异常' });
    }

    if (!options.find(opt => Number(opt.id) === optionIdNum)) {
      return NextResponse.json({ code: 1, msg: '选项不存在' });
    }

    const updatedOptions = options.map(opt =>
      Number(opt.id) === optionIdNum
        ? { ...opt, voteCount: (opt.voteCount || 0) + 1 }
        : opt
    );

    await db.update(polls)
      .set({ options: sql`${JSON.stringify(updatedOptions)}::jsonb` })
      .where(eq(polls.id, pollRow.id));

    await db.insert(pollVotes).values({
      pollId: pollRow.id,
      userId: payload.userId,
      optionId: optionIdNum
    });

    // 回写后重新读一次确认
    const refreshed = await db.select({
      optionsText: sql<string>`options::text`
    }).from(polls).where(eq(polls.id, pollRow.id)).limit(1);
    const finalOptions = JSON.parse(refreshed[0]?.optionsText || JSON.stringify(updatedOptions));

    return NextResponse.json({
      code: 0,
      msg: '投票成功',
      data: { options: finalOptions, votedOptionId: optionIdNum }
    });

  } catch (error) {
    console.error('Vote poll error:', error);
    return NextResponse.json({ code: 1, msg: '投票失败' }, { status: 500 });
  }
}
