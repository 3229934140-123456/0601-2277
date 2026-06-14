import { Level, LevelResult } from '@/data/levels';
import { getStarOneGap, getStarTwoGap, getStarThreeGap, StarGap } from './gap';

export function computeHighlights(r: LevelResult, level: Level): {
  bestStat: string;
  bestStatValue: string;
  almostStar: { star: 1 | 2 | 3; label: string; reason: string } | null;
  closestTarget: string;
  nextTip: string;
} {
  const g1 = getStarOneGap(r);
  const g2 = getStarTwoGap(r);
  const g3 = getStarThreeGap(r);
  const achievedStars = [g1.done, g2.done, g3.done].filter(Boolean).length;

  const bestStat = (() => {
    const comboRate = Math.min(1, r.comboMax / 10);
    const coinRate = r.totalCoins > 0 ? r.coinsCollected / r.totalCoins : 0;
    const deliveryRate = r.targetDeliveries > 0 ? r.deliveries / r.targetDeliveries : 0;
    const timeRate = r.timeLimit > 0 ? r.timeLeft / r.timeLimit : 0;
    const best = Math.max(comboRate, coinRate, deliveryRate, timeRate);
    if (best === comboRate && r.comboMax >= 3) return { k: '连击手感火热', v: `最高 x${r.comboMax}` };
    if (best === coinRate && r.totalCoins > 0) return { k: '金币收集', v: `${r.coinsCollected}/${r.totalCoins}` };
    if (best === deliveryRate) return { k: '投递完成度', v: `${r.deliveries}/${r.targetDeliveries}` };
    return { k: '剩余时间', v: `${Math.ceil(r.timeLeft)}s` };
  })();

  const almostStar = (() => {
    const candidates: Array<{ star: 1 | 2 | 3; gap: StarGap }> = [];
    if (!g1.done) candidates.push({ star: 1, gap: g1 });
    if (!g2.done) candidates.push({ star: 2, gap: g2 });
    if (!g3.done) candidates.push({ star: 3, gap: g3 });
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => a.gap.gaps.length - b.gap.gaps.length);
    const c = candidates[0];
    return {
      star: c.star,
      label: `${c.star}星条件`,
      reason: c.gap.gaps.join('；'),
    };
  })();

  const closestTarget = (() => {
    if (r.coinsCollected > 0 && r.coinsCollected < r.totalCoins) return `金币 ${r.coinsCollected}/${r.totalCoins}（差 ${r.totalCoins - r.coinsCollected}）`;
    if (r.comboMax >= 3) return `连击记录 x${r.comboMax}`;
    if (r.damageTaken === 0) return `无伤通关，继续保持！`;
    return `投递进度 ${r.deliveries}/${r.targetDeliveries}`;
  })();

  const nextTip = (() => {
    if (achievedStars === 0) return '先稳拿 1 星：完成至少 60% 投递';
    if (achievedStars === 1) return '冲 2 星：全投递 + 得分 800 以上';
    if (achievedStars === 2) return '冲 3 星：无伤 + 全投递 + 全金币 + 余时 25%';
    return '三星达成！可尝试换其他角色/车刷更高分';
  })();

  return {
    bestStat: bestStat.k,
    bestStatValue: bestStat.v,
    almostStar,
    closestTarget,
    nextTip,
  };
}
