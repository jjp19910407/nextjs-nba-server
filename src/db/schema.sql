-- ==========================================
-- NBA球迷小程序数据库 Schema
-- ==========================================

-- 用户主表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(64) UNIQUE NOT NULL,
  nickname VARCHAR(50),
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  slogan VARCHAR(100),
  watch_years INT,
  age INT,
  main_team_id INT,
  status VARCHAR(20) DEFAULT 'pending', -- pending/completed
  credit_score INT DEFAULT 100,        -- 信誉分
  points INT DEFAULT 0,                -- 积分
  level INT DEFAULT 1,                 -- 球迷等级
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户球星关联表
CREATE TABLE IF NOT EXISTS user_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  star_id INT NOT NULL,
  role VARCHAR(10) NOT NULL, -- main/sub
  weight DECIMAL(2,1) DEFAULT 1.0, -- 主球星1，副球星0.5
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 基础数据表 - 球星
CREATE TABLE IF NOT EXISTS stars (
  id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_en VARCHAR(50),
  team_id INT,
  avatar VARCHAR(255), -- 高清无水印头像
  position VARCHAR(20),
  pts DECIMAL(4,1), -- 场均得分
  reb DECIMAL(4,1), -- 篮板
  ast DECIMAL(4,1), -- 助攻
  stl DECIMAL(3,1),
  blk DECIMAL(3,1)
);

-- 基础数据表 - 球队
CREATE TABLE IF NOT EXISTS teams (
  id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_en VARCHAR(50),
  conference VARCHAR(10), -- East/West
  division VARCHAR(20),
  logo VARCHAR(255),
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  win_pct DECIMAL(4,3)
);

-- 基础数据表 - 新闻
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  cover VARCHAR(255),
  content TEXT,
  type VARCHAR(20), -- hot/team/star
  related_team_id INT,
  related_star_ids INT[],
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_user_stars_user_id ON user_stars(user_id);
CREATE INDEX IF NOT EXISTS idx_news_type ON news(type);
