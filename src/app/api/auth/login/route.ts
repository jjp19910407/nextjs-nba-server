import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { verifyToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const WECHAT_APPID = process.env.WECHAT_APPID!;
const WECHAT_SECRET = process.env.WECHAT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // 1. 调用微信接口换取 openid
    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: WECHAT_APPID,
        secret: WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, errcode, errmsg } = wxRes.data;

    if (errcode) {
      return NextResponse.json({
        code: 1,
        msg: errmsg || '微信登录失败'
      });
    }

    // 2. 查询或创建用户
    let existingUserRows = await db
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(eq(users.openid, openid))
      .limit(1);
    let existingUser = existingUserRows[0];

    let userId: string;
    let status: string;

    if (!existingUser) {
      // 新用户，创建 pending 状态账号
      const [newUser] = await db.insert(users).values({ openid, status: 'pending' }).returning({ id: users.id, status: users.status });
      userId = newUser.id;
      status = newUser.status;
    } else {
      userId = existingUser.id;
      status = existingUser.status;
    }

    // 3. 生成 JWT
    const token = verifyToken ? null : await (await import('@/lib/jwt')).signToken({ userId, openid }); // 临时修复，实际应该导入 signToken

    // 正确导入 signToken
    const { signToken: realSignToken } = await import('@/lib/jwt');
    const realToken = realSignToken({ userId, openid });

    return NextResponse.json({
      code: 0,
      msg: '登录成功',
      data: {
        token: realToken,
        isNew: status === 'pending'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      code: 1,
      msg: '服务器错误'
    }, { status: 500 });
  }
}
