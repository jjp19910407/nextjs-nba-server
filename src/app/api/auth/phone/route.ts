import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { verifyToken } from '@/lib/jwt';
import { sql } from '@/lib/db';

const WECHAT_APPID = process.env.WECHAT_APPID!;
const WECHAT_SECRET = process.env.WECHAT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // 验证登录态
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ code: 401, msg: '未登录' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ code: 401, msg: 'token 无效' }, { status: 401 });
    }

    const { code } = await request.json();

    // 用 code 换手机号
    const wxRes = await axios.post(
      `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${await getAccessToken()}`,
      { code }
    );

    const { phone_info, errcode, errmsg } = wxRes.data;
    if (errcode) {
      return NextResponse.json({ code: 1, msg: errmsg || '获取手机号失败' });
    }

    const phone = phone_info.phoneNumber;

    // 更新用户手机号
    await sql`UPDATE users SET phone = ${phone} WHERE id = ${payload.userId}`;

    return NextResponse.json({ code: 0, data: { phone } });
  } catch (error) {
    console.error('Get phone error:', error);
    return NextResponse.json({ code: 1, msg: '服务器错误' }, { status: 500 });
  }
}

// 获取 access_token（简单实现，生产环境应加缓存）
async function getAccessToken() {
  const res = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
    params: {
      grant_type: 'client_credential',
      appid: WECHAT_APPID,
      secret: WECHAT_SECRET
    }
  });
  return res.data.access_token;
}
