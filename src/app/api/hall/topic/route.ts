import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { weeklyTopics } from '@/db/schema';
import { desc, and, lte, gte, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const now = new Date();

    // 获取当前活跃的话题
    const topicRows = await db
      .select()
      .from(weeklyTopics)
      .where(and(
        gte(weeklyTopics.weekEnd, now),
        lte(weeklyTopics.weekStart, now),
        eq(weeklyTopics.isActive, true)
      ))
      .orderBy(desc(weeklyTopics.createdAt))
      .limit(1);
    const topic = topicRows[0];

    // 如果没有活跃话题，返回最新的一个
    if (!topic) {
      const latestRows = await db
        .select()
        .from(weeklyTopics)
        .orderBy(desc(weeklyTopics.createdAt))
        .limit(1);
      return NextResponse.json({ code: 0, msg: '获取成功', data: latestRows[0] || null });
    }

    return NextResponse.json({ code: 0, msg: '获取成功', data: topic });

  } catch (error) {
    console.error('Get weekly topic error:', error);
    return NextResponse.json({ code: 1, msg: '获取失败' }, { status: 500 });
  }
}
