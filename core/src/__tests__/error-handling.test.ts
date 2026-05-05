/**
 * 模板4: 错误处理与异常测试
 * 测试各种异常输入、边界错误、类型安全
 */
import { describe, it, expect } from 'vitest';
import { LunarCalendarConverter } from '../utils/lunar-calendar';
import { UniqueDivinationKeyGenerator } from '../engine/key-generator';
import { SixLayerFusionEngine } from '../engine/six-layer-engine';
import type { HolisticPersonContext } from '../collection/holistic-collector';

function makeCtx(): HolisticPersonContext {
  const birth = new Date(1990, 5, 15);
  const lunar = LunarCalendarConverter.solarToLunar(birth);
  return {
    core: {
      name: '异常测试',
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
      domain: 'general',
      description: '异常测试',
      urgency: 'normal',
      askTime: new Date(),
      similarAsks: 0,
    },
    situation: {
      lifeStage: 'stable',
      coreDilemma: '测试',
      stagnationMonths: 0,
      currentResources: ['测试'],
      majorChanges: false,
    },
  };
}

describe('异常处理 - 农历转换', () => {
  it('极早日期应抛出错误', () => {
    expect(() => LunarCalendarConverter.solarToLunar(new Date(1800, 0, 1))).toThrow();
  });

  it('极晚日期应抛出错误', () => {
    expect(() => LunarCalendarConverter.solarToLunar(new Date(2200, 0, 1))).toThrow();
  });

  it('闰年2月29日应能转换', () => {
    const lunar = LunarCalendarConverter.solarToLunar(new Date(2024, 1, 29));
    expect(lunar).toBeDefined();
    expect(lunar.year).toBe(2024);
  });

  it('非闰年2月28日应能转换', () => {
    const lunar = LunarCalendarConverter.solarToLunar(new Date(2023, 1, 28));
    expect(lunar).toBeDefined();
    expect(lunar.year).toBe(2023);
  });

  it('元旦应能转换', () => {
    const lunar = LunarCalendarConverter.solarToLunar(new Date(2024, 0, 1));
    expect(lunar).toBeDefined();
  });

  it('年末应能转换', () => {
    const lunar = LunarCalendarConverter.solarToLunar(new Date(2024, 11, 31));
    expect(lunar).toBeDefined();
  });
});

describe('异常处理 - 八字', () => {
  it('所有时辰(0-23)都应能计算八字', () => {
    const date = new Date(2024, 5, 15);
    for (let h = 0; h < 24; h++) {
      const bazi = LunarCalendarConverter.calculateEightCharacters(date, h);
      expect(bazi.yearStem).toBeTruthy();
      expect(bazi.yearBranch).toBeTruthy();
      expect(bazi.hourStem).toBeTruthy();
      expect(bazi.hourBranch).toBeTruthy();
    }
  });

  it('不同日期的八字不应完全相同', () => {
    const bazi1 = LunarCalendarConverter.calculateEightCharacters(new Date(2024, 0, 1), 12);
    const bazi2 = LunarCalendarConverter.calculateEightCharacters(new Date(2024, 5, 15), 12);
    // 日柱应该不同（不同日子）
    const different = bazi1.dayStem !== bazi2.dayStem || bazi1.dayBranch !== bazi2.dayBranch;
    expect(different).toBe(true);
  });
});

describe('异常处理 - 密钥', () => {
  it('所有紧急程度都应能生成密钥', async () => {
    for (const urgency of ['urgent', 'normal', 'planning'] as const) {
      const ctx = makeCtx();
      ctx.question.urgency = urgency;
      const key = UniqueDivinationKeyGenerator.generate(ctx);
      expect(key.combinedHash).toBeTruthy();
    }
  });

  it('所有人生阶段都应能生成密钥', async () => {
    for (const stage of ['starting', 'accumulating', 'bottleneck', 'transition', 'crisis', 'recovery', 'stable'] as const) {
      const ctx = makeCtx();
      ctx.situation.lifeStage = stage;
      const key = UniqueDivinationKeyGenerator.generate(ctx);
      expect(key.combinedHash).toBeTruthy();
    }
  });

  it('密钥生成不应修改原始上下文', () => {
    const ctx = makeCtx();
    const originalName = ctx.core.name;
    const originalDesc = ctx.question.description;
    UniqueDivinationKeyGenerator.generate(ctx);
    expect(ctx.core.name).toBe(originalName);
    expect(ctx.question.description).toBe(originalDesc);
  });
});

describe('异常处理 - 六层引擎', () => {
  it('不同急迫程度都应能完成卜算', async () => {
    for (const urgency of ['urgent', 'normal', 'planning'] as const) {
      const ctx = makeCtx();
      ctx.question.urgency = urgency;
      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(ctx);
      expect(result.conclusion).toBeDefined();
      expect(result.conclusion.verdict).toBeTruthy();
    }
  });

  it('不同心绪状态都应能完成卜算', async () => {
    for (const emotion of ['calm', 'anxious', 'hopeful', 'confused', 'urgent'] as const) {
      const ctx = makeCtx();
      ctx.mental = {
        emotionalState: emotion,
        premonitions: [],
        physicalState: '正常',
        distraction: 5,
      };
      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(ctx);
      expect(result.conclusion).toBeDefined();
    }
  });

  it('有外应数据应能完成卜算', async () => {
    const ctx = makeCtx();
    ctx.mental = {
      emotionalState: 'anxious',
      premonitions: ['鸟叫', '左眼皮跳'],
      physicalState: '心跳加速',
      distraction: 3,
    };
    const engine = new SixLayerFusionEngine();
    const result = await engine.divinate(ctx);
    expect(result.conclusion).toBeDefined();
  });
});
