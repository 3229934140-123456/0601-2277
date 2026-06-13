export interface BikeSkin {
  id: string;
  name: string;
  era: string;
  colors: string[];
  unlockCondition: string;
  unlockValue: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

export const BIKES: BikeSkin[] = [
  {
    id: 'bike-classic',
    name: '经典通勤车',
    era: '1980s',
    colors: ['#4A9E55', '#2D7A3A', '#6BCB77', '#8B4513', '#D2691E'],
    unlockCondition: '初始拥有',
    unlockValue: 0,
    rarity: 'common',
    description: '朴实无华的绿色通勤车，送报童的好伙伴。',
  },
  {
    id: 'bike-redracer',
    name: '红色竞速',
    era: '1950s',
    colors: ['#CC3333', '#8B0000', '#FF6666', '#333333', '#666666'],
    unlockCondition: '累计投递达到 50 份',
    unlockValue: 50,
    rarity: 'common',
    description: '复古红色赛车，轻快如飞。',
  },
  {
    id: 'bike-bluecruiser',
    name: '蓝色巡航',
    era: '1970s',
    colors: ['#4169E1', '#1E3A8A', '#87CEEB', '#FFFFFF', '#C0C0C0'],
    unlockCondition: '累计收集金币达到 100',
    unlockValue: 100,
    rarity: 'common',
    description: '美式蓝色巡航车，舒适度一流。',
  },
  {
    id: 'bike-yellowbmx',
    name: '黄金 BMX',
    era: '1990s',
    colors: ['#FFD700', '#B8860B', '#FFEC8B', '#222222', '#444444'],
    unlockCondition: '任意关卡获得 3 星',
    unlockValue: 1,
    rarity: 'rare',
    description: '闪闪发光的 BMX 小轮车，街头之王。',
  },
  {
    id: 'bike-purplemountain',
    name: '紫霞山地',
    era: '1990s',
    colors: ['#8B008B', '#4B0082', '#DA70D6', '#2F4F4F', '#778899'],
    unlockCondition: '所有关卡至少 1 星',
    unlockValue: 5,
    rarity: 'rare',
    description: '紫色渐变山地车，征服任何地形。',
  },
  {
    id: 'bike-fixie',
    name: '死飞狂潮',
    era: '2000s',
    colors: ['#00CED1', '#008B8B', '#48D1CC', '#FF1493', '#FF69B4'],
    unlockCondition: '无伤完成任意关卡',
    unlockValue: 1,
    rarity: 'epic',
    description: '简约到极致的死飞车，炫技必备。',
  },
  {
    id: 'bike-steampunk',
    name: '蒸汽朋克',
    era: 'Victorian',
    colors: ['#CD853F', '#8B4513', '#DAA520', '#B87333', '#A0522D'],
    unlockCondition: '累计得分达到 5000 分',
    unlockValue: 5000,
    rarity: 'epic',
    description: '黄铜与齿轮构筑的梦幻坐骑。',
  },
  {
    id: 'bike-neonfuture',
    name: '霓虹未来',
    era: '20XX',
    colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#000000', '#FFFFFF'],
    unlockCondition: '全关卡三星通关',
    unlockValue: 15,
    rarity: 'legendary',
    description: '赛博朋克风格概念车，传说的终点。',
  },
];

export function getBikeById(id: string): BikeSkin {
  return BIKES.find(b => b.id === id) || BIKES[0];
}

export const rarityColors: Record<BikeSkin['rarity'], { bg: string; border: string; text: string; label: string }> = {
  common: { bg: '#4A5568', border: '#718096', text: '#E2E8F0', label: '普通' },
  rare: { bg: '#2B6CB0', border: '#4299E1', text: '#BEE3F8', label: '稀有' },
  epic: { bg: '#6B46C1', border: '#9F7AEA', text: '#E9D8FD', label: '史诗' },
  legendary: { bg: '#B7791F', border: '#ECC94B', text: '#FEFCBF', label: '传说' },
};
