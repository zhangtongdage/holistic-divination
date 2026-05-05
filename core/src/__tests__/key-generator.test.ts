import { describe, it, expect } from 'vitest';
import { UniqueDivinationKeyGenerator, JIAZI_PRIME_NUMBERS } from '../engine/key-generator';
import type { HolisticPersonContext } from '../collection/holistic-collector';
import { LunarCalendarConverter } from '../utils/lunar-calendar';

function makeContext(overrides: Partial<HolisticPersonContext> = {}): HolisticPersonContext {
  const birthDate = new Date(1990, 5, 15);
  const lunar = LunarCalendarConverter.solarToLunar(birthDate);
  return {
    core: {
      name: '张三',
      birthDatetime: {
        gregorian: birthDate,
        lunar,
        timezone: 'Asia/Shanghai',
        isExact: true,
        isDaylightSaving: false,
      },
      gender: 'male',
      currentLocation: {
        province: '安徽',
        city: '合肥',
        coordinates: { lat: 31.82, lng: 117.23 },
      },
      residenceDuration: 10,
    },
    question: {
      domain: 'career',
      description: '今年事业发展如何',
      urgency: 'normal',
      askTime: new Date(),
      similarAsks: 0,
    },
    situation: {
      lifeStage: 'accumulating',
      coreDilemma: '职业瓶颈',
      stagnationMonths: 6,
      currentResources: ['人脉', '经验'],
      majorChanges: false,
    },
    ...overrides,
  };
}

describe('KeyGenerator', () => {
  describe('六十甲子先天数', () => {
    it('应有60+个条目', () => {
      expect(Object.keys(JIAZI_PRIME_NUMBERS).length).toBeGreaterThanOrEqual(60);
    });

    it('甲子应为1', () => {
      expect(JIAZI_PRIME_NUMBERS['甲子']).toBe(1);
    });

    it('癸亥应为30', () => {
      expect(JIAZI_PRIME_NUMBERS['癸亥']).toBe(30);
    });
  });

  describe('密钥生成', () => {
    it('应返回完整的 DivinationKey 结构', () => {
      const key = UniqueDivinationKeyGenerator.generate(makeContext());
      expect(key.rawString).toBeTruthy();
      expect(key.combinedHash).toBeTruthy();
      expect(typeof key.priorityMod).toBe('number');
      expect(key.lines).toHaveLength(6);
      expect(key.hexagramName).toBeTruthy();
      expect(key.confidence).toBe(1.0);
    });

    it('七维度数值应全部为数字', () => {
      const key = UniqueDivinationKeyGenerator.generate(makeContext());
      const dims = key.sevenDimensions;
      expect(typeof dims.personNumber).toBe('number');
      expect(typeof dims.timeNumber).toBe('number');
      expect(typeof dims.questionNumber).toBe('number');
      expect(typeof dims.situationNumber).toBe('number');
      expect(typeof dims.mentalNumber).toBe('number');
      expect(typeof dims.locationNumber).toBe('number');
      expect(typeof dims.behaviorNumber).toBe('number');
    });

    it('lines 应为6个布尔值', () => {
      const key = UniqueDivinationKeyGenerator.generate(makeContext());
      expect(key.lines).toHaveLength(6);
      for (const line of key.lines) {
        expect(typeof line).toBe('boolean');
      }
    });

    it('priorityMod 应在 0-63 之间', () => {
      const key = UniqueDivinationKeyGenerator.generate(makeContext());
      expect(key.priorityMod).toBeGreaterThanOrEqual(0);
      expect(key.priorityMod).toBeLessThanOrEqual(63);
    });
  });

  describe('一致性', () => {
    it('同一上下文多次生成应完全相同', () => {
      const ctx = makeContext();
      const key1 = UniqueDivinationKeyGenerator.generate(ctx);
      const key2 = UniqueDivinationKeyGenerator.generate(ctx);
      expect(key1.combinedHash).toBe(key2.combinedHash);
      expect(key1.hexagramName).toBe(key2.hexagramName);
      expect(key1.lines).toEqual(key2.lines);
    });

    it('validateUniqueness 应返回有效结果', () => {
      const ctx1 = makeContext();
      const ctx2 = makeContext();
      const result = UniqueDivinationKeyGenerator.validateUniqueness(ctx1, ctx2);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
