import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { sql } from '@/lib/db';
import { signToken } from '@/lib/jwt';

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
    let user = await sql`SELECT id, status FROM users WHERE openid = ${openid}`;

    if (user.length === 0) {
      // 新用户，创建 pending 状态账号
      const [newUser] = await sql`
        INSERT INTO users (openid, status) VALUES (${openid}, 'pending')
        RETURNING id, status
      `;
      user = [newUser];
    }

    // 3. 生成 JWT
    const token = signToken({ userId: user[0].id, openid });

    return NextResponse.json({
      code: 0,
      msg: '登录成功',
      data: {
        token,
        isNew: user[0].status === 'pending'
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
