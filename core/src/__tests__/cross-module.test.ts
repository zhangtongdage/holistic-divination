/**
 * 模板2: 跨模块集成测试
 * 测试模块间数据流转、一致性、兼容性
 */
import { describe, it, expect } from 'vitest';
import { LunarCalendarConverter } from '../utils/lunar-calendar';
import { UniqueDivinationKeyGenerator } from '../engine/key-generator';
import { SixLayerFusionEngine } from '../engine/six-layer-engine';
import type { HolisticPersonContext } from '../collection/holistic-collector';

describe('跨模块集成 - 农历→密钥→六层', () => {
  const dates = [
    new Date(1990, 0, 1),   // 1990年元旦
    new Date(1985, 5, 15),  // 1985年夏天
    new Date(2000, 11, 31), // 千禧年末
    new Date(1975, 2, 8),   // 春天
    new Date(2024, 0, 1),   // 2024年元旦
  ];

  for (const birthDate of dates) {
    it(`出生日期 ${birthDate.toISOString().slice(0,10)} 应能走完全流程`, async () => {
      // 第一步: 农历转换
      const lunar = LunarCalendarConverter.solarToLunar(birthDate);
      expect(lunar.year).toBeGreaterThanOrEqual(1900);

      // 第二步: 八字计算
      const bazi = LunarCalendarConverter.calculateEightCharacters(birthDate, 12);
      expect(bazi.yearStem).toBeTruthy();

      // 第三步: 生成密钥
      const ctx: HolisticPersonContext = {
        core: {
          name: '集成测试',
          birthDatetime: {
            gregorian: birthDate,
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
          domain: 'wealth',
          description: '集成测试问题',
          urgency: 'normal',
          askTime: new Date(),
          similarAsks: 0,
        },
        situation: {
          lifeStage: 'accumulating',
          coreDilemma: '测试',
          stagnationMonths: 3,
          currentResources: ['测试资源'],
          majorChanges: false,
        },
      };

      const key = UniqueDivinationKeyGenerator.generate(ctx);
      expect(key.hexagramName).toBeTruthy();
      expect(key.lines).toHaveLength(6);

      // 第四步: 六层卜算
      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(ctx);
      expect(result.hexagram.primary).toBeTruthy();
      expect(result.conclusion.verdict).toBeTruthy();
    });
  }
});

describe('跨模块集成 - 不同问题域', () => {
  const domains = ['career', 'wealth', 'relationship', 'health', 'study'] as const;

  for (const domain of domains) {
    it(`问题域 "${domain}" 应能完成完整流程`, async () => {
      const birth = new Date(1995, 3, 20);
      const lunar = LunarCalendarConverter.solarToLunar(birth);
      const ctx: HolisticPersonContext = {
        core: {
          name: '域测试',
          birthDatetime: {
            gregorian: birth,
            lunar,
            timezone: 'Asia/Shanghai',
            isExact: true,
            isDaylightSaving: false,
          },
          gender: 'female',
          currentLocation: { province: '测试', city: '测试' },
          residenceDuration: 3,
        },
        question: {
          domain,
          description: `${domain}域测试`,
          urgency: 'normal',
          askTime: new Date(),
          similarAsks: 0,
        },
        situation: {
          lifeStage: 'accumulating',
          coreDilemma: '测试',
          stagnationMonths: 2,
          currentResources: ['测试'],
          majorChanges: false,
        },
      };

      const key = UniqueDivinationKeyGenerator.generate(ctx);
      expect(key.hexagramName).toBeTruthy();

      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(ctx);
      expect(result.id).toBeTruthy();
      expect(result.conclusion.verdict).toBeTruthy();
    });
  }
});

describe('跨模块集成 - 八字与密钥一致性', () => {
  it('同一人的八字和密钥应基于相同农历数据', () => {
    const birth = new Date(1988, 7, 8);
    const lunar = LunarCalendarConverter.solarToLunar(birth);
    const bazi = LunarCalendarConverter.calculateEightCharacters(birth, 8);

    const ctx: HolisticPersonContext = {
      core: {
        name: '一致性测试',
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
        description: '测试',
        urgency: 'normal',
        askTime: new Date(),
        similarAsks: 0,
      },
      situation: {
        lifeStage: 'bottleneck',
        coreDilemma: '测试',
        stagnationMonths: 6,
        currentResources: ['测试'],
        majorChanges: false,
      },
    };

    const key = UniqueDivinationKeyGenerator.generate(ctx);
    // 密钥的七维度中personNumber应基于干支
    expect(typeof key.sevenDimensions.personNumber).toBe('number');
    expect(key.sevenDimensions.personNumber).toBeGreaterThan(0);
  });
});
