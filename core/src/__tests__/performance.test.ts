/**
 * 模板3: 性能与稳定性测试
 * 批量运算、重复调用、一致性验证
 */
import { describe, it, expect } from 'vitest';
import { LunarCalendarConverter, TIAN_GAN, DI_ZHI } from '../utils/lunar-calendar';
import { UniqueDivinationKeyGenerator } from '../engine/key-generator';
import { SixLayerFusionEngine } from '../engine/six-layer-engine';
import type { HolisticPersonContext } from '../collection/holistic-collector';

function makeCtx(): HolisticPersonContext {
  const birth = new Date(1995, 5, 20);
  const lunar = LunarCalendarConverter.solarToLunar(birth);
  return {
    core: {
      name: '性能测试',
      birthDatetime: {
        gregorian: birth,
        lunar,
        timezone: 'Asia/Shanghai',
        isExact: true,
        isDaylightSaving: false,
      },
      gender: 'male',
      currentLocation: { province: '测试', city: '测试' },
      residenceDuration: 5,
    },
    question: {
      domain: 'career',
      description: '性能测试',
      urgency: 'normal',
      askTime: new Date(),
      similarAsks: 0,
    },
    situation: {
      lifeStage: 'accumulating',
      coreDilemma: '测试',
      stagnationMonths: 3,
      currentResources: ['测试'],
      majorChanges: false,
    },
  };
}

describe('性能测试 - 农历转换', () => {
  it('100次连续转换不应报错', () => {
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      const date = new Date(1900 + i, i % 12, (i % 28) + 1);
      const lunar = LunarCalendarConverter.solarToLunar(date);
      expect(lunar.year).toBeGreaterThanOrEqual(1900);
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000); // 应在5秒内完成
  });

  it('200年逐日遍历不应报错', () => {
    let count = 0;
    const start = new Date(1900, 0, 31);
    const end = new Date(2100, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 30)) {
      const lunar = LunarCalendarConverter.solarToLunar(new Date(d));
      expect(lunar.year).toBeGreaterThanOrEqual(1900);
      expect(lunar.year).toBeLessThanOrEqual(2100);
      count++;
    }
    expect(count).toBeGreaterThan(1000);
  });
});

describe('性能测试 - 密钥生成', () => {
  it('50次连续生成不应报错', () => {
    const start = Date.now();
    for (let i = 0; i < 50; i++) {
      const key = UniqueDivinationKeyGenerator.generate(makeCtx());
      expect(key.combinedHash).toBeTruthy();
      expect(key.lines).toHaveLength(6);
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  it('同一上下文10次生成结果应完全一致', () => {
    const ctx = makeCtx();
    const keys = Array.from({ length: 10 }, () => UniqueDivinationKeyGenerator.generate(ctx));
    const hashes = keys.map(k => k.combinedHash);
    expect(new Set(hashes).size).toBe(1); // 所有hash应相同
    const names = keys.map(k => k.hexagramName);
    expect(new Set(names).size).toBe(1);
  });
});

describe('性能测试 - 六层引擎', () => {
  it('5次连续卜算不应报错', async () => {
    const start = Date.now();
    for (let i = 0; i < 5; i++) {
      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(makeCtx());
      expect(result.id).toBeTruthy();
      expect(result.conclusion.verdict).toBeTruthy();
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(30000); // 30秒内
  });

  it('同一引擎reset后应能重新卜算', async () => {
    const engine = new SixLayerFusionEngine();
    const r1 = await engine.divinate(makeCtx());
    engine.reset();
    const r2 = await engine.divinate(makeCtx());
    expect(r1.id).toBeTruthy();
    expect(r2.id).toBeTruthy();
  });
});

describe('稳定性测试 - 干支映射', () => {
  it('六十甲子中每个天干地支组合都应出现', () => {
    const combos = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const stem = TIAN_GAN[i % 10];
      const branch = DI_ZHI[i % 12];
      combos.add(`${stem}${branch}`);
    }
    expect(combos.size).toBe(60);
  });

  it('连续60年不应出现重复干支', () => {
    const stems: string[] = [];
    const branches: string[] = [];
    for (let year = 2000; year < 2060; year++) {
      const bazi = LunarCalendarConverter.calculateEightCharacters(new Date(year, 5, 1), 12);
      stems.push(bazi.yearStem);
      branches.push(bazi.yearBranch);
    }
    const pairs = stems.map((s, i) => `${s}${branches[i]}`);
    expect(new Set(pairs).size).toBe(60);
  });
});
