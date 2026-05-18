import { sql } from '../lib/db.js';
import fs from 'fs';
import path from 'path';

async function initSchema() {
  console.log('开始初始化数据库 Schema...');

  const schemaPath = path.join(process.cwd(), 'src/db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // 分割并执行每个 SQL 语句（以分号分隔）
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      await sql.unsafe(statement);
      console.log('执行成功:', statement.substring(0, 50) + '...');
    } catch (e) {
      console.warn('警告:', (e as Error).message);
    }
  }

  console.log('数据库 Schema 初始化完成！');
}

initSchema().catch(console.error);
