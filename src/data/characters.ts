export interface CharacterSkin {
  id: string;
  name: string;
  era: string;
  colors: string[];
  unlockCondition: string;
  unlockValue: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  backstory: string;
}

export const CHARACTERS: CharacterSkin[] = [
  {
    id: 'char-tommy',
    name: '邻家小子汤米',
    era: '1980s',
    colors: ['#FFD8A8', '#5C3A21', '#4A9E55', '#2D7A3A', '#FFFFFF'],
    unlockCondition: '初始拥有',
    unlockValue: 0,
    rarity: 'common',
    description: '绿衣棕发的标准送报童，勤勉可靠。',
    backstory: '小镇上家喻户晓的勤奋男孩，每天清晨骑着自行车穿梭在邻里间，用微笑和报纸开启每一家的一天。'
  },
  {
    id: 'char-jenny',
    name: '蓝裙少女珍妮',
    era: '1960s',
    colors: ['#FFD1B0', '#C68E5A', '#4169E1', '#1E3A8A', '#FFE4B5'],
    unlockCondition: '累计投递达到 30 份',
    unlockValue: 30,
    rarity: 'common',
    description: '60年代的金发蓝裙女孩，动作敏捷。',
    backstory: '第一位加入送报队伍的女孩，用事实证明女生的投递速度一点也不输男孩。梦想是当一名记者。'
  },
  {
    id: 'char-rocky',
    name: '棒球少年洛奇',
    era: '1950s',
    colors: ['#FFCC99', '#000000', '#CC3333', '#8B0000', '#FFFFFF'],
    unlockCondition: '累计收集金币达到 50',
    unlockValue: 50,
    rarity: 'rare',
    description: '戴着棒球帽的少年，投球手感一流。',
    backstory: '高中棒球队的头号投手，把报纸当棒球投，准度惊人。目标是成为大联盟选手。'
  },
  {
    id: 'char-miki',
    name: '滑板女孩美琪',
    era: '1990s',
    colors: ['#FFDBAC', '#FF1493', '#8B008B', '#FFD700', '#00FFFF'],
    unlockCondition: '任意关卡连击达到 5 次',
    unlockValue: 5,
    rarity: 'rare',
    description: '街头酷女孩，霓虹色系的潮流先锋。',
    backstory: '滑板爱好者，骑着自行车也不忘滑板招式。口袋里永远揣着Walkman和漫画书。'
  },
  {
    id: 'char-arthur',
    name: '绅士少爷阿瑟',
    era: 'Edwardian',
    colors: ['#FFE8CC', '#333333', '#191970', '#000080', '#DAA520'],
    unlockCondition: '无伤完成任意关卡 1 次',
    unlockValue: 1,
    rarity: 'epic',
    description: '爱德华时代的富家少爷，体验平民生活。',
    backstory: '贵族家庭的独生子，伪装成送报童体验民间生活。虽然贵气十足，但干起活来有板有眼。'
  },
  {
    id: 'char-neo',
    name: '赛博骇客尼奥',
    era: '2077',
    colors: ['#E0E0E0', '#00FFFF', '#FF00FF', '#000000', '#FFFF00'],
    unlockCondition: '累计得分达到 3000 分',
    unlockValue: 3000,
    rarity: 'epic',
    description: '来自未来的霓虹骑士，全身发光。',
    backstory: '2077年的数据信使，把信息数据包当作报纸投递。偶尔穿越时空回来，只为感受一下古老的纸质报刊文化。'
  },
  {
    id: 'char-pete',
    name: '老兵皮特',
    era: '1940s',
    colors: ['#DEB887', '#556B2F', '#2F4F4F', '#8B4513', '#D3D3D3'],
    unlockCondition: '全关卡至少 1 星',
    unlockValue: 5,
    rarity: 'epic',
    description: '二战退伍老兵，沉稳老练不慌不忙。',
    backstory: '从战场上归来后选择了这份宁静的工作。他说，每一份报纸都是一封写给和平的信。'
  },
  {
    id: 'char-zara',
    name: '星辰公主扎拉',
    era: 'Fantasy',
    colors: ['#FFF0F5', '#FFB6C1', '#9370DB', '#DDA0DD', '#FFD700'],
    unlockCondition: '全关卡三星通关',
    unlockValue: 15,
    rarity: 'legendary',
    description: '来自魔法王国的公主，传说中的存在。',
    backstory: '从星辰降临的公主，为了收集人间的故事而来。每一份报纸对她而言，都是一段珍贵的人类记忆。'
  },
];

export function getCharacterById(id: string): CharacterSkin {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

export const characterRarityColors: Record<CharacterSkin['rarity'], { bg: string; border: string; text: string; label: string }> = {
  common: { bg: '#4A5568', border: '#718096', text: '#E2E8F0', label: '普通' },
  rare: { bg: '#2B6CB0', border: '#4299E1', text: '#BEE3F8', label: '稀有' },
  epic: { bg: '#6B46C1', border: '#9F7AEA', text: '#E9D8FD', label: '史诗' },
  legendary: { bg: '#B7791F', border: '#ECC94B', text: '#FEFCBF', label: '传说' },
};
