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
  customAvatar: varchar('custom_avatar', { length: 255 }), // 自定义头像
  // 自定义荣誉（可选覆盖）
  allNba: integer('all_nba'),
  allDefense: integer('all_defense'),
  mvp: integer('mvp'),
  fmvp: integer('fmvp'),
  championships: integer('championships'),
  allStar: integer('all_star'),
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
  blk: decimal('blk', { precision: 3, scale: 1 }),
  // 生涯荣誉
  allNba: integer('all_nba').default(0), // 最佳阵容次数
  allDefense: integer('all_defense').default(0), // 最佳防守阵容次数
  mvp: integer('mvp').default(0), // MVP次数
  fmvp: integer('fmvp').default(0), // FMVP次数
  championships: integer('championships').default(0), // 总冠军次数
  allStar: integer('all_star').default(0) // 全明星次数
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

// 每周话题表
export const weeklyTopics = pgTable('weekly_topics', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  cover: varchar('cover', { length: 255 }),
  weekStart: timestamp('week_start', { withTimezone: true }).notNull(),
  weekEnd: timestamp('week_end', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  createdBy: uuid('created_by').references(() => users.id)
});

// 帖子表
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  cover: varchar('cover', { length: 255 }),
  content: text('content'),
  hasPoll: boolean('has_poll').default(false),
  relatedTeamId: integer('related_team_id'),
  relatedStarIds: jsonb('related_star_ids').$type<number[]>(),
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  dislikeCount: integer('dislike_count').default(0),
  commentCount: integer('comment_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// 投票表
export const polls = pgTable('polls', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  options: jsonb('options').$type<{ id: number; text: string; voteCount: number }[]>(), // [{id:1, text:'选项1', voteCount:0}, ...]
  endAt: timestamp('end_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// 用户投票记录表
export const pollVotes = pgTable('poll_votes', {
  id: serial('id').primaryKey(),
  pollId: integer('poll_id').references(() => polls.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  optionId: integer('option_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// 留言表
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  parentId: integer('parent_id'),
  content: text('content').notNull(),
  likeCount: integer('like_count').default(0),
  dislikeCount: integer('dislike_count').default(0),
  replyCount: integer('reply_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// 点赞表（点赞帖子）
export const postLikes = pgTable('post_likes', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// 留言点赞表
export const commentLikes = pgTable('comment_likes', {
  id: serial('id').primaryKey(),
  commentId: integer('comment_id').references(() => comments.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// 收藏表
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// 帖子点踩表
export const postDislikes = pgTable('post_dislikes', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// 留言点踩表
export const commentDislikes = pgTable('comment_dislikes', {
  id: serial('id').primaryKey(),
  commentId: integer('comment_id').references(() => comments.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Star = typeof stars.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type News = typeof news.$inferSelect;
export type UserStar = typeof userStars.$inferSelect;
export type WeeklyTopic = typeof weeklyTopics.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Poll = typeof polls.$inferSelect;
export type PollVote = typeof pollVotes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;
export type CommentLike = typeof commentLikes.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type PostDislike = typeof postDislikes.$inferSelect;
export type CommentDislike = typeof commentDislikes.$inferSelect;
