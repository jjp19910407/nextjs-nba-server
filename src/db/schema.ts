import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  uuid,
  decimal,
  timestamp,
  boolean,
  jsonb,
  pgEnum
} from 'drizzle-orm/pg-core';

// 用户表
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  openid: varchar('openid', { length: 64 }).unique().notNull(),
  nickname: varchar('nickname', { length: 50 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  phone: varchar('phone', { length: 20 }),
  slogan: varchar('slogan', { length: 100 }),
  watchYears: integer('watch_years'),
  age: integer('age'),
  mainTeamId: integer('main_team_id'),
  mainTeamName: varchar('main_team_name', { length: 50 }),
  status: varchar('status', { length: 20 }).default('pending'),
  creditScore: integer('credit_score').default(100),
  points: integer('points').default(0),
  level: integer('level').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// 用户球星关联表
export const userStars = pgTable('user_stars', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  starId: integer('star_id').notNull(),
  starName: varchar('star_name', { length: 50 }),
  role: varchar('role', { length: 10 }).notNull(),
  weight: decimal('weight', { precision: 2, scale: 1 }).default('1.0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// 球星表
export const stars = pgTable('stars', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  nameEn: varchar('name_en', { length: 50 }),
  teamId: integer('team_id'),
  avatar: varchar('avatar', { length: 255 }),
  position: varchar('position', { length: 20 }),
  pts: decimal('pts', { precision: 4, scale: 1 }),
  reb: decimal('reb', { precision: 4, scale: 1 }),
  ast: decimal('ast', { precision: 4, scale: 1 }),
  stl: decimal('stl', { precision: 3, scale: 1 }),
  blk: decimal('blk', { precision: 3, scale: 1 })
});

// 球队表
export const teams = pgTable('teams', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  nameEn: varchar('name_en', { length: 50 }),
  conference: varchar('conference', { length: 10 }),
  division: varchar('division', { length: 20 }),
  logo: varchar('logo', { length: 255 }),
  wins: integer('wins').default(0),
  losses: integer('losses').default(0),
  winPct: decimal('win_pct', { precision: 4, scale: 3 })
});

// 新闻表
export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  cover: varchar('cover', { length: 255 }),
  content: text('content'),
  type: varchar('type', { length: 20 }),
  relatedTeamId: integer('related_team_id'),
  relatedStarIds: jsonb('related_star_ids').$type<number[]>(),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Star = typeof stars.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type News = typeof news.$inferSelect;
export type UserStar = typeof userStars.$inferSelect;
