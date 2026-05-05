/**
 * 模板1: 边界值测试
 * 测试极端输入、边界条件、数据完整性
 */
import { describe, it, expect } from 'vitest';
import { LunarCalendarConverter, TIAN_GAN, DI_ZHI, SOLAR_TERMS } from '../utils/lunar-calendar';
import { UniqueDivinationKeyGenerator } from '../engine/key-generator';
import { SixLayerFusionEngine } from '../engine/six-layer-engine';
import type { HolisticPersonContext } from '../collection/holistic-collector';

// === 农历边界 ===
describe('边界值测试 - 农历', () => {
  it('1900年1月31日(农历起始日)应能转换', () => {
    const lunar = LunarCalendarConverter.solarToLunar(new Date(1900, 0, 31));
    expect(lunar.year).toBe(1900);
    expect(lunar.month).toBe(1);
    expect(lunar.day).toBe(1);
  });

  it('2100年12月31日(范围末端)应能转换', () => {
    const lunar = LunarCalendarConverter.solarToLunar(new Date(2100, 11, 31));
    expect(lunar.year).toBeLessThanOrEqual(2100);
  });

  it('1899年12月31日应抛出错误', () => {
    expect(() => LunarCalendarConverter.solarToLunar(new Date(1899, 11, 31))).toThrow();
  });

  it('2101年1月1日应抛出错误', () => {
    expect(() => LunarCalendarConverter.solarToLunar(new Date(2101, 0, 1))).toThrow();
  });

  it('闰月年份的农历数据应有效', () => {
    // 2024年有闰四月
    const info2024 = LunarCalendarConverter.getCompleteLunarInfo(new Date(2024, 3, 1));
    expect(info2024.lunarDate.isLeapYear).toBe(true);
  });

  it('农历月份边界: 腊月日期应有效', () => {
    // 2024-01-30 在农历上属于年末月份
    const lunar = LunarCalendarConverter.solarToLunar(new Date(2024, 0, 30));
    expect(lunar.month).toBeGreaterThanOrEqual(1);
    expect(lunar.month).toBeLessThanOrEqual(12);
    expect(lunar.day).toBeGreaterThanOrEqual(1);
    expect(lunar.day).toBeLessThanOrEqual(30);
  });
});

// === 八字边界 ===
describe('边界值测试 - 八字', () => {
  it('子时(0点)应能计算', () => {
    const bazi = LunarCalendarConverter.calculateEightCharacters(new Date(2024, 0, 1), 0);
    expect(bazi.hourStem).toBeTruthy();
    expect(bazi.hourBranch).toBe('子');
  });

  it('亥时(22点)应能计算', () => {
    const bazi = LunarCalendarConverter.calculateEightCharacters(new Date(2024, 0, 1), 22);
    expect(bazi.hourBranch).toBe('亥');
  });

  it('23点应归为子时', () => {
    const bazi = LunarCalendarConverter.calculateEightCharacters(new Date(2024, 0, 1), 23);
    expect(bazi.hourBranch).toBe('子');
  });

  it('每天24个时辰应产生不同结果', () => {
    const date = new Date(2024, 5, 15);
    const results = new Set<string>();
    for (let hour = 0; hour < 24; hour++) {
      const bazi = LunarCalendarConverter.calculateEightCharacters(date, hour);
      results.add(`${bazi.hourStem}${bazi.hourBranch}`);
    }
    // 12个地支，24小时应该产生12种不同时柱
    expect(results.size).toBe(12);
  });
});

// === 密钥边界 ===
describe('边界值测试 - 密钥', () => {
  const makeCtx = (hour: number = 12): HolisticPersonContext => {
    const birth = new Date(1990, 0, 1);
    const lunar = LunarCalendarConverter.solarToLunar(birth);
    return {
      core: {
        name: '测试',
        birthDatetime: {
          gregorian: birth,
          lunar,
          timezone: 'Asia/Shanghai',
          isExact: true,
          isDaylightSaving: false,
        },
        gender: 'male',
        currentLocation: { province: '测试省', city: '测试市' },
        residenceDuration: 0,
      },
      question: {
        domain: 'general',
        description: '测试',
        urgency: 'normal',
        askTime: new Date(),
        similarAsks: 0,
      },
      situation: {
        lifeStage: 'starting',
        coreDilemma: '测试',
        stagnationMonths: 0,
        currentResources: [],
        majorChanges: false,
      },
    };
  };

  it('空资源列表应能生成密钥', () => {
    const ctx = makeCtx();
    ctx.situation.currentResources = [];
    const key = UniqueDivinationKeyGenerator.generate(ctx);
    expect(key.combinedHash).toBeTruthy();
  });

  it('极端经纬度应能生成密钥', () => {
    const ctx = makeCtx();
    ctx.core.currentLocation.coordinates = { lat: 90, lng: 180 };
    const key = UniqueDivinationKeyGenerator.generate(ctx);
    expect(key.combinedHash).toBeTruthy();
  });

  it('0度经纬度应能生成密钥', () => {
    const ctx = makeCtx();
    ctx.core.currentLocation.coordinates = { lat: 0, lng: 0 };
    const key = UniqueDivinationKeyGenerator.generate(ctx);
    expect(key.combinedHash).toBeTruthy();
  });

  it('负经纬度应能生成密钥', () => {
    const ctx = makeCtx();
    ctx.core.currentLocation.coordinates = { lat: -33.86, lng: 151.21 }; // 悉尼
    const key = UniqueDivinationKeyGenerator.generate(ctx);
    expect(key.combinedHash).toBeTruthy();
  });

  it('不同性别应能生成密钥', () => {
    for (const gender of ['male', 'female', 'other'] as const) {
      const ctx = makeCtx();
      ctx.core.gender = gender;
      const key = UniqueDivinationKeyGenerator.generate(ctx);
      expect(key.combinedHash).toBeTruthy();
    }
  });
});

// === 六层引擎边界 ===
describe('边界值测试 - 六层引擎', () => {
  const makeCtx = (lifeStage: string = 'starting'): HolisticPersonContext => {
    const birth = new Date(1990, 0, 1);
    const lunar = LunarCalendarConverter.solarToLunar(birth);
    return {
      core: {
        name: '边界测试',
        birthDatetime: {
          gregorian: birth,
          lunar,
          timezone: 'Asia/Shanghai',
          isExact: true,
          isDaylightSaving: false,
        },
        gender: 'female',
        currentLocation: { province: '测试', city: '测试' },
        residenceDuration: 1,
      },
      question: {
        domain: 'health',
        description: '边界测试问题',
        urgency: 'urgent',
        askTime: new Date(),
        similarAsks: 0,
      },
      situation: {
        lifeStage: lifeStage as any,
        coreDilemma: '边界测试',
        stagnationMonths: 12,
        currentResources: ['资源1'],
        majorChanges: true,
        changeDetails: '测试变化',
      },
    };
  };

  it('起步期应能完成卜算', async () => {
    const engine = new SixLayerFusionEngine();
    const result = await engine.divinate(makeCtx('starting'));
    expect(result.layers).toBeDefined();
  });

  it('危机期应能完成卜算', async () => {
    const engine = new SixLayerFusionEngine();
    const result = await engine.divinate(makeCtx('crisis'));
    expect(result.layers).toBeDefined();
  });

  it('恢复期应能完成卜算', async () => {
    const engine = new SixLayerFusionEngine();
    const result = await engine.divinate(makeCtx('recovery'));
    expect(result.layers).toBeDefined();
  });
});
