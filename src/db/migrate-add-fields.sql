-- 为已有数据库添加缺失的字段
-- 执行前请备份数据库

-- 1. 为 users 表添加 main_team_name
ALTER TABLE users ADD COLUMN IF NOT EXISTS main_team_name VARCHAR(50);

-- 2. 为 user_stars 表添加 star_name
ALTER TABLE user_stars ADD COLUMN IF NOT EXISTS star_name VARCHAR(50);
