import { describe, it, expect } from 'vitest';
import { SixLayerFusionEngine } from '../engine/six-layer-engine';
import type { HolisticPersonContext } from '../collection/holistic-collector';
import { LunarCalendarConverter } from '../utils/lunar-calendar';

function makeContext(): HolisticPersonContext {
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
  };
}

describe('SixLayerFusionEngine', () => {
  describe('基础结构', () => {
    it('应能实例化', () => {
      const engine = new SixLayerFusionEngine();
      expect(engine).toBeDefined();
    });

    it('应能重置', () => {
      const engine = new SixLayerFusionEngine();
      expect(() => engine.reset()).not.toThrow();
    });
  });

  describe('卜算流程', () => {
    it('divinate 应返回完整的 FinalDivinationResult', async () => {
      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(makeContext());
      
      // 基础标识
      expect(result.id).toBeTruthy();
      expect(result.timestamp).toBeInstanceOf(Date);
      
      // 卦象
      expect(result.hexagram.primary).toBeTruthy();
      expect(result.hexagram.lines).toHaveLength(6);
      expect(Array.isArray(result.hexagram.changingLines)).toBe(true);
      
      // 六层分析
      expect(result.layers.gongLi).toBeDefined();
      expect(result.layers.tiYong).toBeDefined();
      expect(result.layers.jiBian).toBeDefined();
      expect(result.layers.quXiang).toBeDefined();
      expect(result.layers.yiLi).toBeDefined();
      
      // 结构化结论
      expect(result.conclusion.verdict).toBeTruthy();
      expect(Array.isArray(result.conclusion.keywords)).toBe(true);
      expect(result.conclusion.timeline.near).toBeTruthy();
      expect(result.conclusion.timeline.medium).toBeTruthy();
      expect(result.conclusion.timeline.far).toBeTruthy();
      expect(Array.isArray(result.conclusion.actions.favorable)).toBe(true);
      expect(Array.isArray(result.conclusion.actions.avoid)).toBe(true);
      
      // 权重解释
      expect(result.weightExplanation).toBeDefined();
      
      // 免责声明
      expect(result.disclaimer).toBeTruthy();
      
      // 上下文
      expect(result.context).toBeDefined();
    });

    it('gongLi 层应包含五行信息', async () => {
      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(makeContext());
      const gongli = result.layers.gongLi;
      expect(gongli).toBeDefined();
      expect(typeof gongli).toBe('object');
    });

    it('yiLi 层应有吉凶判定', async () => {
      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(makeContext());
      const yili = result.layers.yiLi;
      expect(yili.auspiciousness).toBeTruthy();
      expect(typeof yili.trendDescription).toBe('string');
    });

    it('quXiang 层应有类象', async () => {
      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(makeContext());
      const quxiang = result.layers.quXiang;
      expect(quxiang.primarySymbol).toBeTruthy();
      expect(Array.isArray(quxiang.secondarySymbols)).toBe(true);
    });

    it('jiBian 层应有变爻信息', async () => {
      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(makeContext());
      const jibian = result.layers.jiBian;
      expect(Array.isArray(jibian.changingLines)).toBe(true);
      expect(typeof jibian.pattern).toBe('string');
    });

    it('conclusion 应包含方位和颜色建议', async () => {
      const engine = new SixLayerFusionEngine();
      const result = await engine.divinate(makeContext());
      expect(typeof result.conclusion.directionAdvice).toBe('string');
      expect(typeof result.conclusion.colorAdvice).toBe('string');
      expect(typeof result.conclusion.mentalAdvice).toBe('string');
    });
  });
});
