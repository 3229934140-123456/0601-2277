import { LevelResult } from '@/data/levels';

export interface StarGap {
  done: boolean;
  gaps: string[];
}

function coin(r: LevelResult): string {
  const need = Math.max(0, r.totalCoins - r.coinsCollected);
  return need > 0 ? `还需 ${need} 金币` : `金币已集齐 (${r.coinsCollected}/${r.totalCoins})`;
}
function deliveries(r: LevelResult): string {
  const need = Math.max(0, r.targetDeliveries - r.deliveries);
  return need > 0 ? `还差 ${need} 份投递` : `投递完成 (${r.deliveries}/${r.targetDeliveries})`;
}
function deliveriesX(r: LevelResult, factor: number): string {
  const target = Math.ceil(r.targetDeliveries * factor);
  const need = Math.max(0, target - r.deliveries);
  return need > 0 ? `还差 ${need} 份投递 (${r.deliveries}/${target})` : `完成投递 ${r.deliveries}/${target}`;
}
function damage(r: LevelResult): string {
  return r.damageTaken === 0 ? '已做到无伤' : `需无伤 (已受伤 ${r.damageTaken} 次)`;
}
function timePercent(r: LevelResult, pct: number): string {
  const need = Math.ceil(r.timeLimit * pct);
  return r.timeLeft >= need ? `时间充足 (余 ${Math.ceil(r.timeLeft)}s)` : `剩余 ${Math.ceil(r.timeLeft)}s，需 ${need}s`;
}
function scoreGte(r: LevelResult, v: number): string {
  const need = Math.max(0, v - r.score);
  return need > 0 ? `还需 ${need} 分 (当前 ${r.score})` : `分数 ${r.score} 达标`;
}
function livesUsed(r: LevelResult): string {
  return r.livesUsed === 0 ? '未损失生命' : `未损失 0 生命 (已损 ${r.livesUsed})`;
}

export function getStarOneGap(r: LevelResult): StarGap {
  const target = Math.ceil(r.targetDeliveries * 0.6);
  const done = r.deliveries >= target;
  return {
    done,
    gaps: done ? [`达到 60% 投递 (${r.deliveries}/${target})`] : [deliveriesX(r, 0.6)],
  };
}

export function getStarTwoGap(r: LevelResult): StarGap {
  const dDone = r.deliveries >= r.targetDeliveries;
  const sDone = r.score >= 800;
  const done = dDone && sDone;
  const gaps: string[] = [];
  if (!dDone) gaps.push(deliveries(r));
  if (!sDone) gaps.push(scoreGte(r, 800));
  if (done) gaps.push('全投递 + 800分已达成');
  return { done, gaps };
}

export function getStarThreeGap(r: LevelResult): StarGap {
  const dmg = r.damageTaken === 0;
  const dlv = r.deliveries >= r.targetDeliveries;
  const cin = r.coinsCollected >= r.totalCoins;
  const tim = r.timeLeft >= r.timeLimit * 0.25;
  const done = dmg && dlv && cin && tim;
  const gaps: string[] = [];
  if (!dmg) gaps.push(damage(r));
  if (!dlv) gaps.push(deliveries(r));
  if (!cin) gaps.push(coin(r));
  if (!tim) gaps.push(timePercent(r, 0.25));
  if (done) gaps.push('无伤+全投递+全金币+时间都达成！');
  return { done, gaps };
}
