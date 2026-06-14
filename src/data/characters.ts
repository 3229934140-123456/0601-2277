export interface CharacterStage {
  threshold: number;
  title: string;
  story: string;
}

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
  stages: CharacterStage[];
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
    backstory: '小镇上家喻户晓的勤奋男孩，每天清晨骑着自行车穿梭在邻里间，用微笑和报纸开启每一家的一天。',
    stages: [
      { threshold: 0, title: '菜鸟学徒', story: '第一天踏上送报之路，车把还握不稳，报纸偶尔会投进狗窝里。' },
      { threshold: 5, title: '街区熟手', story: '对每条巷子了若指掌，甚至知道史密斯先生家的狗几点午睡。' },
      { threshold: 15, title: '投递达人', story: '邻居们开始在门口留饼干给你，小孩子们追着你的自行车跑。' },
      { threshold: 30, title: '金牌信使', story: '邮差都开始向你请教投递路线，你是小镇公认的最快车神。' },
      { threshold: 60, title: '街区传奇', story: '十年后老人们还会说起："当年那个汤米啊，投递从不出错。"' },
      { threshold: 100, title: '小镇之星', story: '镇议会为你立了一个铜像——永远的送报童，永远的邻家男孩。' },
    ],
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
    backstory: '第一位加入送报队伍的女孩，用事实证明女生的投递速度一点也不输男孩。梦想是当一名记者。',
    stages: [
      { threshold: 0, title: '好奇少女', story: '"男孩能做的我也能！"你鼓起勇气敲开了报馆的门。' },
      { threshold: 5, title: '崭露头角', story: '大家开始议论：那个蓝裙姑娘投得比男孩子还准！' },
      { threshold: 15, title: '灵巧信使', story: '采访本和报纸包一起挂在车把上，你开始为自己的未来积累素材。' },
      { threshold: 30, title: '街区之花', story: '读者专门等你送报，只为道一声早安。编辑部已经给你留了实习位置。' },
      { threshold: 60, title: '铁娘子记者', story: '战争前线、摩天大楼顶，哪里有新闻哪里就有你。送报的日子给了你最棒的脚力。' },
      { threshold: 100, title: '普利策之星', story: '你把毕生经历写成了《蓝裙上的油墨》，成为每一个年轻记者必读的经典。' },
    ],
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
    backstory: '高中棒球队的头号投手，把报纸当棒球投，准度惊人。目标是成为大联盟选手。',
    stages: [
      { threshold: 0, title: '板凳球员', story: '球队里还轮不到你上场，但送报路上你每天都在偷偷练习投球。' },
      { threshold: 5, title: '替补投手', story: '教练发现你把报纸扔进二楼窗户的准度，决定让你在热身赛试试。' },
      { threshold: 15, title: '先发投手', story: '每投出一个好球，你都会想起当年投报纸练出来的手腕力道。' },
      { threshold: 30, title: '王牌火球', story: '球探开始出现在看台上，你的速球已经能超过 90 迈。' },
      { threshold: 60, title: '大联盟新秀', story: '第一次登上大联盟投手丘时，你悄悄在口袋里塞了一张旧报纸。' },
      { threshold: 100, title: '棒球名人堂', story: '入选名人堂的演讲上你说："一切都从送报时扔出的第一份报纸开始。"' },
    ],
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
    backstory: '滑板爱好者，骑着自行车也不忘滑板招式。口袋里永远揣着Walkman和漫画书。',
    stages: [
      { threshold: 0, title: '街头新人', story: '第一次踩着滑板在街区滑行，Walkman里放着最新的嘻哈单曲。' },
      { threshold: 5, title: '涂鸦艺人', story: '空地上开始出现你喷漆的彩色涂鸦，城市因你多了一点色彩。' },
      { threshold: 15, title: '滑板女王', story: 'U池里你的 Ollie 越来越高，送报时能一下跳过整条路障。' },
      { threshold: 30, title: '潮流先锋', story: '你的穿搭被年轻人争相模仿，粉色双马尾成了街区标志。' },
      { threshold: 60, title: '地下文化教母', story: '你开了一家滑板店+黑胶唱片店，成为整个街区亚文化的中心。' },
      { threshold: 100, title: '传奇滑手', story: 'X Games 名人堂给你颁奖时，你踩着滑板上台——还是当年那个粉红色女孩。' },
    ],
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
    backstory: '贵族家庭的独生子，伪装成送报童体验民间生活。虽然贵气十足，但干起活来有板有眼。',
    stages: [
      { threshold: 0, title: '好奇少爷', story: '戴着白手套出门送报，第一天就被父亲发现并禁足了三天。' },
      { threshold: 5, title: '伪装学徒', story: '学会了和仆役们混在一起吃饭，偷偷把银餐具换成了帆布包。' },
      { threshold: 15, title: '平民绅士', story: '即使穿着粗布衣服，扶老太太过马路的姿态依然像王子。' },
      { threshold: 30, title: '民权运动家', story: '用家族的影响力开始为平民争取权益，报纸成了你宣传理念的武器。' },
      { threshold: 60, title: '下议院议员', story: '第一次在议会演讲时，你用送报路上听到的真实故事打动了所有人。' },
      { threshold: 100, title: '人民的伯爵', story: '你放弃了世袭爵位，将全部财产捐给了工人学校。历史记住的是你的品格，而非血统。' },
    ],
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
    backstory: '2077年的数据信使，把信息数据包当作报纸投递。偶尔穿越时空回来，只为感受一下古老的纸质报刊文化。',
    stages: [
      { threshold: 0, title: '数据包跑腿', story: '在霓虹都市的电缆管道里穿梭，每一份数据都是生死攸关的包裹。' },
      { threshold: 5, title: '街头黑客', story: '你黑进了公司的防火墙，把真相送到每一家的终端屏幕上。' },
      { threshold: 15, title: '霓虹信使', story: '你的荧光轨迹成了夜之城风景线，赏金猎人看到你都退避三舍。' },
      { threshold: 30, title: '网络幽灵', story: '你可以同时接入二十个频道，连人工智能都追不上你的速度。' },
      { threshold: 60, title: '数据自由斗士', story: '你攻破了公司最大的服务器集群，把被封锁的历史还给了所有人。' },
      { threshold: 100, title: '代码传说', story: '据说在暗网深处，你的ID成了一个都市传说——那个把信息本身当报纸送的人。' },
    ],
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
    backstory: '从战场上归来后选择了这份宁静的工作。他说，每一份报纸都是一封写给和平的信。',
    stages: [
      { threshold: 0, title: '归国老兵', story: '卸下军装的第一天，你在街角的报摊前站了很久，不知道该何去何从。' },
      { threshold: 5, title: '沉默投递员', story: '话不多，但每一份报纸都精确送达。邻居们慢慢习惯了这个安静的身影。' },
      { threshold: 15, title: '街区守护者', story: '有小孩差点被车撞，你用军人的反应速度把他拉开。街区从此把你当守护神。' },
      { threshold: 30, title: '无名英雄', story: '没人知道你曾获得过银星勋章，但每个人都知道——皮特的报纸从不会迟到。' },
      { threshold: 60, title: '和平使者', story: '你把自己的故事讲给学校的孩子们听，他们第一次明白"和平"两个字的重量。' },
      { threshold: 100, title: '永远的士兵', story: '葬礼上整条街区的人都来了，你投递过的每一户人家，都在门口放了一份折好的报纸。' },
    ],
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
    backstory: '从星辰降临的公主，为了收集人间的故事而来。每一份报纸对她而言，都是一段珍贵的人类记忆。',
    stages: [
      { threshold: 0, title: '星尘旅者', story: '从夜空坠落的那一刻，你第一次闻到了印刷油墨和雨后泥土的味道。' },
      { threshold: 5, title: '好奇公主', story: '"人类为什么要把字印在纸上？"你带着这个疑问，开始了自己的投递之旅。' },
      { threshold: 15, title: '童心守护者', story: '孩子们追着你跑，因为他们能看到你身后闪烁的星星尾迹。' },
      { threshold: 30, title: '记忆收集者', story: '你把报纸上的每一段故事都折成纸鹤，飞回夜空变成新的星座。' },
      { threshold: 60, title: '人界之友', story: '精灵王国要召你回去，但你选择留下——人类还有太多太多故事等着你收集。' },
      { threshold: 100, title: '星辰女王', story: '传说深夜仰望星空，能看到最亮的那颗旁边有一颗小小的新星——那是你为人间点亮的。' },
    ],
  },
];

export function getCharacterById(id: string): CharacterSkin {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

export function getCharacterStage(character: CharacterSkin, playCount: number): { stage: CharacterStage; index: number } {
  let idx = 0;
  for (let i = 0; i < character.stages.length; i++) {
    if (playCount >= character.stages[i].threshold) idx = i;
  }
  return { stage: character.stages[idx], index: idx };
}

export function getNextCharacterStage(character: CharacterSkin, playCount: number): { stage: CharacterStage; need: number } | null {
  for (let i = 0; i < character.stages.length; i++) {
    if (playCount < character.stages[i].threshold) {
      return { stage: character.stages[i], need: character.stages[i].threshold - playCount };
    }
  }
  return null;
}

export const characterRarityColors: Record<CharacterSkin['rarity'], { bg: string; border: string; text: string; label: string }> = {
  common: { bg: '#4A5568', border: '#718096', text: '#E2E8F0', label: '普通' },
  rare: { bg: '#2B6CB0', border: '#4299E1', text: '#BEE3F8', label: '稀有' },
  epic: { bg: '#6B46C1', border: '#9F7AEA', text: '#E9D8FD', label: '史诗' },
  legendary: { bg: '#B7791F', border: '#ECC94B', text: '#FEFCBF', label: '传说' },
};
