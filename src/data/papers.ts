export interface PaperSkin {
  id: string;
  name: string;
  headline: string;
  colors: string[];
  unlockCondition: string;
  unlockValue: number;
  rarity: 'common' | 'rare' | 'epic';
  description: string;
}

export const PAPERS: PaperSkin[] = [
  {
    id: 'paper-daily',
    name: '每日邮报',
    headline: 'DAILY NEWS',
    colors: ['#F5F5DC', '#000000', '#8B0000'],
    unlockCondition: '初始拥有',
    unlockValue: 0,
    rarity: 'common',
    description: '黑白印刷的经典日报，头条醒目。',
  },
  {
    id: 'paper-morning',
    name: '晨报速递',
    headline: 'MORNING SUN',
    colors: ['#FFFEF0', '#FFD700', '#CC0000'],
    unlockCondition: '累计投递达到 100 份',
    unlockValue: 100,
    rarity: 'common',
    description: '温暖阳光色调的早间报纸。',
  },
  {
    id: 'paper-sports',
    name: '体育快报',
    headline: 'SPORTS TODAY',
    colors: ['#FFFFFF', '#006400', '#FF4500'],
    unlockCondition: '连续命中达到 10 次',
    unlockValue: 10,
    rarity: 'common',
    description: '绿橙配色，体育迷的最爱。',
  },
  {
    id: 'paper-finance',
    name: '财经周刊',
    headline: 'WALL ST WEEK',
    colors: ['#F0E68C', '#000080', '#006400'],
    unlockCondition: '累计收集金币达到 300',
    unlockValue: 300,
    rarity: 'rare',
    description: '烫金印刷，记录财富浪潮。',
  },
  {
    id: 'paper-comic',
    name: '漫画小报',
    headline: 'FUNNY TIMES',
    colors: ['#FFFACD', '#FF69B4', '#4169E1'],
    unlockCondition: '任意关卡得分超过 1500',
    unlockValue: 1500,
    rarity: 'rare',
    description: '充满趣味和卡通色彩的小报。',
  },
  {
    id: 'paper-midnight',
    name: '午夜秘闻',
    headline: 'MIDNIGHT TALES',
    colors: ['#191970', '#00CED1', '#FFD700'],
    unlockCondition: '无伤完成 3 个关卡',
    unlockValue: 3,
    rarity: 'epic',
    description: '神秘深夜版，记录奇闻异事。',
  },
];

export function getPaperById(id: string): PaperSkin {
  return PAPERS.find(p => p.id === id) || PAPERS[0];
}

export const paperRarityColors: Record<PaperSkin['rarity'], { bg: string; border: string; text: string; label: string }> = {
  common: { bg: '#4A5568', border: '#718096', text: '#E2E8F0', label: '普通' },
  rare: { bg: '#2B6CB0', border: '#4299E1', text: '#BEE3F8', label: '稀有' },
  epic: { bg: '#6B46C1', border: '#9F7AEA', text: '#E9D8FD', label: '史诗' },
};
