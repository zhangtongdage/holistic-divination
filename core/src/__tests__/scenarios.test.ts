/**
 * 模板5: 全流程场景测试
 * 模拟真实使用场景，不同用户画像、不同问题
 */
import { describe, it, expect } from 'vitest';
import { LunarCalendarConverter } from '../utils/lunar-calendar';
import { UniqueDivinationKeyGenerator } from '../engine/key-generator';
import { SixLayerFusionEngine } from '../engine/six-layer-engine';
import type { HolisticPersonContext } from '../collection/holistic-collector';

// === 场景1: 年轻人问事业 ===
describe('场景: 25岁程序员问跳槽', () => {
  it('应完成全流程并给出合理结论', async () => {
    const birth = new Date(1999, 3, 15); // 1999年4月15日
    const lunar = LunarCalendarConverter.solarToLunar(birth);
    const bazi = LunarCalendarConverter.calculateEightCharacters(birth, 14);
    const ctx: HolisticPersonContext = {
      core: {
        name: '小明',
        birthDatetime: {
          gregorian: birth,
          lunar,
          timezone: 'Asia/Shanghai',
          isExact: true,
          isDaylightSaving: false,
        },
        gender: 'male',
        currentLocation: {
          province: '广东',
          city: '深圳',
          coordinates: { lat: 22.54, lng: 114.06 },
        },
        residenceDuration: 3,
      },
      question: {
        domain: 'career',
        description: '我应该跳槽去新公司吗？目前公司在裁员，新公司给的offer涨薪30%',
        urgency: 'urgent',
        askTime: new Date(),
        similarAsks: 1,
        previousAttempts: ['投了30份简历'],
      },
      situation: {
        lifeStage: 'transition',
        coreDilemma: '是否跳槽',
        stagnationMonths: 2,
        currentResources: ['3年工作经验', '技术能力', '存款10万'],
        majorChanges: true,
        changeDetails: '公司开始裁员',
      },
      mental: {
        emotionalState: 'anxious',
        premonitions: ['面试时窗外下大雨'],
        physicalState: '失眠2天',
        distraction: 7,
      },
    };

    const engine = new SixLayerFusionEngine();
    const result = await engine.divinate(ctx);

    // 验证结构完整
    expect(result.id).toBeTruthy();
    expect(result.hexagram.primary).toBeTruthy();
    expect(result.layers.gongLi).toBeDefined();
    expect(result.layers.tiYong).toBeDefined();
    expect(result.layers.jiBian).toBeDefined();
    expect(result.layers.quXiang).toBeDefined();
    expect(result.layers.yiLi).toBeDefined();
    expect(result.conclusion.verdict).toBeTruthy();
    expect(result.conclusion.actions.favorable.length).toBeGreaterThan(0);
    expect(result.conclusion.actions.avoid.length).toBeGreaterThan(0);
    expect(result.conclusion.directionAdvice).toBeTruthy();
    expect(result.conclusion.colorAdvice).toBeTruthy();
    expect(result.conclusion.mentalAdvice).toBeTruthy();
    expect(result.disclaimer).toBeTruthy();

    console.log(`\n【跳槽场景结果】`);
    console.log(`卦象: ${result.hexagram.primary}`);
    console.log(`吉凶: ${result.layers.yiLi.auspiciousness}`);
    console.log(`结论: ${result.conclusion.verdict}`);
  });
});

// === 场景2: 中年人问健康 ===
describe('场景: 45岁中年人问健康', () => {
  it('应完成全流程', async () => {
    const birth = new Date(1979, 8, 20);
    const lunar = LunarCalendarConverter.solarToLunar(birth);
    const ctx: HolisticPersonContext = {
      core: {
        name: '老王',
        birthDatetime: {
          gregorian: birth,
          lunar,
          timezone: 'Asia/Shanghai',
          isExact: false,
          isDaylightSaving: false,
        },
        gender: 'male',
        currentLocation: {
          province: '江苏',
          city: '南京',
          coordinates: { lat: 32.06, lng: 118.80 },
        },
        residenceDuration: 20,
      },
      question: {
        domain: 'health',
        description: '体检发现肺部结节，是否需要手术？',
        urgency: 'urgent',
        askTime: new Date(),
        similarAsks: 0,
      },
      situation: {
        lifeStage: 'bottleneck',
        coreDilemma: '健康问题',
        stagnationMonths: 1,
        currentResources: ['医疗保险', '家人支持', '三甲医院资源'],
        majorChanges: false,
      },
      mental: {
        emotionalState: 'anxious',
        premonitions: [],
        physicalState: '胸闷',
        distraction: 9,
      },
    };

    const engine = new SixLayerFusionEngine();
    const result = await engine.divinate(ctx);
    expect(result.conclusion.verdict).toBeTruthy();

    console.log(`\n【健康场景结果】`);
    console.log(`卦象: ${result.hexagram.primary}`);
    console.log(`吉凶: ${result.layers.yiLi.auspiciousness}`);
    console.log(`结论: ${result.conclusion.verdict}`);
  });
});

// === 场景3: 大学生问学业 ===
describe('场景: 大三学生问考研', () => {
  it('应完成全流程', async () => {
    const birth = new Date(2002, 1, 14);
    const lunar = LunarCalendarConverter.solarToLunar(birth);
    const ctx: HolisticPersonContext = {
      core: {
        name: '小红',
        birthDatetime: {
          gregorian: birth,
          lunar,
          timezone: 'Asia/Shanghai',
          isExact: true,
          isDaylightSaving: false,
        },
        gender: 'female',
        currentLocation: {
          province: '湖北',
          city: '武汉',
          coordinates: { lat: 30.59, lng: 114.31 },
        },
        residenceDuration: 3,
      },
      question: {
        domain: 'study',
        description: '考研应该选本校还是冲985？',
        urgency: 'planning',
        askTime: new Date(),
        similarAsks: 2,
        previousAttempts: ['咨询了辅导员', '问了学长'],
      },
      situation: {
        lifeStage: 'starting',
        coreDilemma: '升学选择',
        stagnationMonths: 4,
        currentResources: ['成绩前20%', '导师推荐', '家庭支持'],
        majorChanges: false,
      },
      mental: {
        emotionalState: 'confused',
        premonitions: ['梦见考试迟到'],
        physicalState: '偶尔头痛',
        distraction: 6,
      },
    };

    const engine = new SixLayerFusionEngine();
    const result = await engine.divinate(ctx);
    expect(result.conclusion.verdict).toBeTruthy();

    console.log(`\n【考研场景结果】`);
    console.log(`卦象: ${result.hexagram.primary}`);
    console.log(`吉凶: ${result.layers.yiLi.auspiciousness}`);
    console.log(`结论: ${result.conclusion.verdict}`);
  });
});

// === 场景4: 老年人问家庭 ===
describe('场景: 65岁退休老人问子女', () => {
  it('应完成全流程', async () => {
    const birth = new Date(1959, 10, 5);
    const lunar = LunarCalendarConverter.solarToLunar(birth);
    const ctx: HolisticPersonContext = {
      core: {
        name: '老李',
        birthDatetime: {
          gregorian: birth,
          lunar,
          timezone: 'Asia/Shanghai',
          isExact: false,
          isDaylightSaving: false,
        },
        gender: 'male',
        currentLocation: {
          province: '四川',
          city: '成都',
          coordinates: { lat: 30.57, lng: 104.07 },
        },
        residenceDuration: 30,
      },
      question: {
        domain: 'family',
        description: '女儿远嫁外地，我该支持还是反对？',
        urgency: 'normal',
        askTime: new Date(),
        similarAsks: 0,
      },
      situation: {
        lifeStage: 'stable',
        coreDilemma: '亲情与分离',
        stagnationMonths: 3,
        currentResources: ['退休金', '老伴支持', '亲戚网络'],
        majorChanges: false,
      },
      mental: {
        emotionalState: 'calm',
        premonitions: [],
        physicalState: '良好',
        distraction: 3,
      },
    };

    const engine = new SixLayerFusionEngine();
    const result = await engine.divinate(ctx);
    expect(result.conclusion.verdict).toBeTruthy();

    console.log(`\n【家庭场景结果】`);
    console.log(`卦象: ${result.hexagram.primary}`);
    console.log(`吉凶: ${result.layers.yiLi.auspiciousness}`);
    console.log(`结论: ${result.conclusion.verdict}`);
  });
});

// === 场景5: 商人问财运 ===
describe('场景: 个体户问投资', () => {
  it('应完成全流程', async () => {
    const birth = new Date(1985, 6, 22);
    const lunar = LunarCalendarConverter.solarToLunar(birth);
    const ctx: HolisticPersonContext = {
      core: {
        name: '张老板',
        birthDatetime: {
          gregorian: birth,
          lunar,
          timezone: 'Asia/Shanghai',
          isExact: true,
          isDaylightSaving: false,
        },
        gender: 'male',
        currentLocation: {
          province: '浙江',
          city: '温州',
          coordinates: { lat: 28.00, lng: 120.67 },
        },
        residenceDuration: 15,
      },
      question: {
        domain: 'wealth',
        description: '朋友邀请合伙开餐饮店，投资20万，是否值得？',
        urgency: 'normal',
        askTime: new Date(),
        similarAsks: 0,
      },
      situation: {
        lifeStage: 'accumulating',
        coreDilemma: '投资风险',
        stagnationMonths: 2,
        currentResources: ['存款50万', '餐饮经验', '人脉'],
        majorChanges: false,
      },
      mental: {
        emotionalState: 'hopeful',
        premonitions: ['路上捡到钱'],
        physicalState: '精神好',
        distraction: 4,
      },
    };

    const engine = new SixLayerFusionEngine();
    const result = await engine.divinate(ctx);
    expect(result.conclusion.verdict).toBeTruthy();

    console.log(`\n【投资场景结果】`);
    console.log(`卦象: ${result.hexagram.primary}`);
    console.log(`吉凶: ${result.layers.yiLi.auspiciousness}`);
    console.log(`结论: ${result.conclusion.verdict}`);
  });
});
