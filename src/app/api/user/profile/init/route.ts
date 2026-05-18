import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const payload = verifyToken(token!);

    if (!payload) {
      return NextResponse.json({ code: 1, msg: '未授权' }, { status: 401 });
    }

    const { nickname, slogan, years, age, teamId, stars } = await request.json();

    // stars 格式: [{starId: 1, role: 'main'}, {starId: 2, role: 'sub'}, {starId: 3, role: 'sub'}]

    // 1. 更新用户主表
    await sql`
      UPDATE users
      SET nickname = ${nickname},
          slogan = ${slogan},
          watch_years = ${years},
          age = ${age},
          main_team_id = ${teamId},
          status = 'completed',
          updated_at = NOW()
      WHERE id = ${payload.userId}
    `;

    // 2. 清理旧的球星关联
    await sql`DELETE FROM user_stars WHERE user_id = ${payload.userId}`;

    // 3. 插入新的球星关联（主球星权重1，副球星0.5）
    for (const s of stars) {
      const weight = s.role === 'main' ? 1.0 : 0.5;
      await sql`
        INSERT INTO user_stars (user_id, star_id, role, weight)
        VALUES (${payload.userId}, ${s.starId}, ${s.role}, ${weight})
      `;
    }

    return NextResponse.json({
      code: 0,
      msg: '资料保存成功',
      data: { userId: payload.userId, initStatus: 'completed' }
    });

  } catch (error) {
    console.error('Profile init error:', error);
    return NextResponse.json({ code: 1, msg: '保存失败' }, { status: 500 });
  }
}
