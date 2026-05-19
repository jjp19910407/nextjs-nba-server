import { db } from '../lib/db';
import { teams, stars, news } from './schema';

async function seed() {
  console.log('开始填充初始数据...');

  // 1. 插入球队数据
  const teamData = [
    { id: 1, name: '波士顿凯尔特人', nameEn: 'Boston Celtics', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg', wins: 57, losses: 25, winPct: 0.695 },
    { id: 2, name: '密尔沃基雄鹿', nameEn: 'Milwaukee Bucks', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg', wins: 54, losses: 28, winPct: 0.659 },
    { id: 3, name: '费城76人', nameEn: 'Philadelphia 76ers', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg', wins: 50, losses: 32, winPct: 0.610 },
    { id: 4, name: '纽约尼克斯', nameEn: 'New York Knicks', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg', wins: 48, losses: 34, winPct: 0.585 },
    { id: 5, name: '布鲁克林篮网', nameEn: 'Brooklyn Nets', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg', wins: 45, losses: 37, winPct: 0.549 },
    { id: 6, name: '迈阿密热火', nameEn: 'Miami Heat', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg', wins: 44, losses: 38, winPct: 0.537 },
    { id: 7, name: '克利夫兰骑士', nameEn: 'Cleveland Cavaliers', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg', wins: 43, losses: 39, winPct: 0.524 },
    { id: 8, name: '芝加哥公牛', nameEn: 'Chicago Bulls', conference: 'East', logo: 'https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg', wins: 40, losses: 42, winPct: 0.488 },
    { id: 10, name: '金州勇士', nameEn: 'Golden State Warriors', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg', wins: 46, losses: 36, winPct: 0.561 },
    { id: 11, name: '菲尼克斯太阳', nameEn: 'Phoenix Suns', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg', wins: 49, losses: 33, winPct: 0.598 },
    { id: 12, name: '丹佛掘金', nameEn: 'Denver Nuggets', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg', wins: 52, losses: 30, winPct: 0.634 },
    { id: 13, name: '洛杉矶快船', nameEn: 'LA Clippers', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg', wins: 47, losses: 35, winPct: 0.573 },
    { id: 14, name: '洛杉矶湖人', nameEn: 'Los Angeles Lakers', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg', wins: 48, losses: 34, winPct: 0.585 },
    { id: 15, name: '达拉斯独行侠', nameEn: 'Dallas Mavericks', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg', wins: 45, losses: 37, winPct: 0.549 },
    { id: 16, name: '俄克拉荷马雷霆', nameEn: 'Oklahoma City Thunder', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg', wins: 55, losses: 27, winPct: 0.671 },
    { id: 17, name: '萨克拉门托国王', nameEn: 'Sacramento Kings', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg', wins: 42, losses: 40, winPct: 0.512 },
    { id: 18, name: '休斯顿火箭', nameEn: 'Houston Rockets', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg', wins: 41, losses: 41, winPct: 0.500 },
    { id: 19, name: '圣安东尼奥马刺', nameEn: 'San Antonio Spurs', conference: 'West', logo: 'https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg', wins: 38, losses: 44, winPct: 0.463 }
  ];

  await db.insert(teams).values(teamData).onConflictDoNothing();
  console.log('球队数据插入完成！');

  // 2. 插入球星数据
  const starData = [
    { id: 0, name: '杰森·塔图姆', nameEn: 'Jayson Tatum', teamId: 1, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1628369.png', position: 'SF', pts: 27.9, reb: 8.4, ast: 4.8, stl: 1.0, blk: 0.7 },
    { id: 1, name: '杰伦·布朗', nameEn: 'Jaylen Brown', teamId: 1, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1627759.png', position: 'SG', pts: 23.4, reb: 5.6, ast: 3.8, stl: 1.2, blk: 0.5 },
    { id: 23, name: '勒布朗·詹姆斯', nameEn: 'LeBron James', teamId: 14, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png', position: 'SF', pts: 28.5, reb: 7.8, ast: 8.3, stl: 1.2, blk: 0.6 },
    { id: 3, name: '安东尼·戴维斯', nameEn: 'Anthony Davis', teamId: 14, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203076.png', position: 'PF', pts: 25.2, reb: 11.5, ast: 3.2, stl: 1.1, blk: 2.2 },
    { id: 30, name: '斯蒂芬·库里', nameEn: 'Stephen Curry', teamId: 10, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png', position: 'PG', pts: 27.3, reb: 4.5, ast: 6.2, stl: 1.0, blk: 0.4 },
    { id: 11, name: '克莱·汤普森', nameEn: 'Klay Thompson', teamId: 10, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/202691.png', position: 'SG', pts: 17.2, reb: 3.4, ast: 2.5, stl: 0.7, blk: 0.3 },
    { id: 13, name: '卢卡·东契奇', nameEn: 'Luka Doncic', teamId: 15, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png', position: 'PG', pts: 33.2, reb: 8.6, ast: 8.8, stl: 1.3, blk: 0.5 },
    { id: 35, name: '凯文·杜兰特', nameEn: 'Kevin Durant', teamId: 11, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png', position: 'SF', pts: 27.8, reb: 6.7, ast: 5.4, stl: 0.8, blk: 1.3 },
    { id: 15, name: '尼古拉·约基奇', nameEn: 'Nikola Jokic', teamId: 12, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png', position: 'C', pts: 26.5, reb: 11.8, ast: 10.5, stl: 1.5, blk: 0.8 },
    { id: 34, name: '扬尼斯·阿德托昆博', nameEn: 'Giannis Antetokounmpo', teamId: 2, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png', position: 'PF', pts: 30.1, reb: 11.2, ast: 5.8, stl: 1.3, blk: 1.1 },
    { id: 22, name: '德玛尔·德罗赞', nameEn: 'DeMar DeRozan', teamId: 5, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/201942.png', position: 'SG', pts: 22.3, reb: 4.8, ast: 5.1, stl: 0.9, blk: 0.3 },
    { id: 10, name: '乔尔·恩比德', nameEn: 'Joel Embiid', teamId: 4, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203954.png', position: 'C', pts: 32.5, reb: 10.8, ast: 4.3, stl: 1.1, blk: 1.7 },
    { id: 6, name: '吉米·巴特勒', nameEn: 'Jimmy Butler', teamId: 6, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/202710.png', position: 'SF', pts: 21.8, reb: 5.5, ast: 5.4, stl: 1.6, blk: 0.4 },
    { id: 8, name: '凯里·欧文', nameEn: 'Kyrie Irving', teamId: 13, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/202681.png', position: 'PG', pts: 25.4, reb: 4.8, ast: 5.5, stl: 1.2, blk: 0.5 },
    { id: 7, name: '谢伊·吉尔杰斯-亚历山大', nameEn: 'Shai Gilgeous-Alexander', teamId: 16, avatar: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1628983.png', position: 'PG', pts: 30.7, reb: 5.5, ast: 6.6, stl: 2.0, blk: 0.9 }
  ];

  await db.insert(stars).values(starData).onConflictDoNothing();
  console.log('球星数据插入完成！');

  // 3. 插入新闻数据
  const newsData = [
    { title: 'NBA官宣：2026全明星投票正式开启', cover: 'https://picsum.photos/400/200?random=1', type: 'hot' },
    { title: '詹姆斯里程碑：常规赛总得分突破42000分', cover: 'https://picsum.photos/400/200?random=2', type: 'hot', relatedTeamId: 14, relatedStarIds: [23] },
    { title: '库里三分球命中数突破3500大关', cover: 'https://picsum.photos/400/200?random=3', type: 'hot', relatedTeamId: 10, relatedStarIds: [30] },
    { title: '字母哥大号两双率雄鹿锁定东部第二', cover: 'https://picsum.photos/400/200?random=4', type: 'hot', relatedTeamId: 2, relatedStarIds: [34] }
  ];

  await db.insert(news).values(newsData).onConflictDoNothing();
  console.log('新闻数据插入完成！');

  console.log('初始数据填充完成！');
}

seed().catch(console.error);
