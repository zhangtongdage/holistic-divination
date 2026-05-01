/**
 * 六层融合统一卜算引擎
 * 
 * 核心架构（自底向上）：
 * 
 * 第六层：占断层 → DivinationResult
 *         多典籍融合解读，多元结果输出
 * 
 * 第五层：义理层 → YiLiAnalysis
 *         吉凶趋势、人事对应、应期推算
 * 
 * 第四层：取象层 → QuXiangAnalysis
 *         万物类象、用神定位、外应捕捉
 * 
 * 第三层：机变层 → JiBianAnalysis
 *         动变判断、格局组合、变数锁定
 * 
 * 第二层：体用层 → TiYongAnalysis
 *         本命为体、问事为用、时空为机
 * 
 * 第一层：公理层 → GongLiFoundation
 *         阴阳五行、干支八卦、河洛数理
 * 
 * 六层相互依赖，信息逐层传递，最终在占断层整合出道义化解读。
 */

import { HolisticPersonContext } from '../collection/holistic-collector';
import { DivinationKey, UniqueDivinationKeyGenerator } from './key-generator';
import { LunarCalendarConverter } from '../utils/lunar-calendar';
import { lookupLongitude, calculateTrueSolarTime, getShichenFromTime } from '../utils/true-solar-time';
import { HybridAIEngine, InferenceRequest, InferenceResult, AIConfig } from '../inference/ai-engine';
import { CollectionSection } from '../collection/holistic-collector';
import { getHexagramByName } from '../data/hexagram-classics';

// ==================== 类型定义（补充） ====================

export interface YiLiLayer {
  auspiciousness: '大吉' | '吉' | '小吉' | '平' | '小凶' | '凶' | '大凶';
  trendDescription: string;  // 趋势描述
  timeFrame: {
    effective: string;         // 有效时间
    transition: string;        // 转折点
    deadline: string;          // 应期
    probabilityRanges: {       // 概率性时间节点
      period: string;          // 时段描述
      probability: number;     // 概率（0-1）
      condition: string;       // 成立条件
    }[];
  };
  advice: {
    action: string;            // 行动建议
    timing: string;            // 时机建议
    caution: string;           // 注意事项
  };
}

export interface QuXiangLayer {
  primarySymbol: string;       // 主神/主象
  secondarySymbols: string[];  // 辅象
  externalSigns?: string[];    // 外应
  images: {                    // 类象
    nature: string;            // 自然
    human: string;             // 人事
    object: string;            // 器物
    place: string;             // 方位
  };
}

export interface JiBianLayer {
  changingLines: number[];     // 变爻
  changingHexagram?: string;  // 变卦
  pattern: string;             // 格局（如"龙战于野"）
  variables: {                 // 变数分析
    stable: string[];          // 稳定因素
    changing: string[];        // 变化因素
    critical: string;          // 关键节点
  };
}

export interface TiYongLayer {
  body: {                      // 体（本命）
    eightCharacters: string;   // 八字
    dayMaster: string;         // 日主
    fiveElements: {
      dominant: string;        // 主导五行
      deficiency: string;      // 缺失
      excess: string;          // 过旺
    };
  };
  application: {                // 用（问事）
    questionCategory: string;
    targetDescription: string;
    competition?: string;        // 是否有人事竞争
  };
  opportunity: {               // 机（时空）
    timing: string;            // 天时
    location: string;          // 地利
    resonance: string;         // 人和
  };
}

export interface GongLiLayer {
  yinYang: {                   // 阴阳
    overall: 'yang' | 'yin' | 'balanced';
    ratio: [number, number];   // 阳:阴
  };
  fiveElements: {               // 五行
    counts: Record<string, number>;
    balance: string;           // 平衡状态
    flow: string;              // 生克流向
  };
  stemsBranches: {             // 干支
    year: string; month: string; day: string; hour: string;
    combined: string[];        // 合化
    clashes: string[];        // 冲克
  };
  hexagram: {                  // 卦象
    trigrams: [string, string]; // 上下卦
    yaoLines: boolean[];        // 六爻
    changing: number[];        // 动爻
  };
}

export interface ClassicCitation {
  title: string;               // 典籍名
  chapter?: string;            // 章节
  quote: string;               // 原文
  translation: string;           // 白话
  relevance: number;           // 相关度
}
/**
 * 权重解释：说明各层在最终判断中的贡献权重
 */
export interface WeightExplanation {
  personWeight: number;        // 本命/人物层权重
  situationWeight: number;     // 境况层权重
  timingWeight: number;        // 时机层权重
  mentalWeight: number;        // 心理层权重
  description: string;         // 权重分配说明
}

/**
 * 多系统冲突：检测各层分析之间的矛盾
 */
export interface SystemConflict {
  systems: string[];           // 冲突涉及的系统/层
  conflictType: string;        // 冲突类型
  resolution: string;          // 建议的解决方案
  warning: string;             // 警示信息
}


export interface FinalDivinationResult {
  // 基础标识
  id: string;                  // 唯一标识
  timestamp: Date;             // 生成时间
  
  // 核心卦象
  key: DivinationKey;          // 密钥
  hexagram: {
    primary: string;           // 本卦
    secondary?: string;        // 变卦
    changingLines: number[];   // 动爻
    lines: boolean[];          // 爻象
  };
  
  // 六层分析
  layers: {
    gongLi: GongLiLayer;
    tiYong: TiYongLayer;
    jiBian: JiBianLayer;
    quXiang: QuXiangLayer;
    yiLi: YiLiLayer;
  };
  
  // 典籍引用
  citations: ClassicCitation[];
  
  // AI解读（可选，启用AI时）
  aiInterpretation?: InferenceResult;
  
  // 结构化结论
  conclusion: {
    verdict: string;             // 吉凶总断
    keywords: string[];          // 关键词
    timeline: {
      near: string;              // 近期
      medium: string;            // 中期
      far: string;               // 远期
    };
    actions: {
      favorable: string[];       // 有利
      avoid: string[];          // 忌讳
    };
    directionAdvice: string;     // 方位建议（基于五行）
    colorAdvice: string;         // 幸运颜色（基于五行）
    mentalAdvice: string;        // 心理建议（基于心绪状态）
  };
  
  // 权重解释
  weightExplanation: WeightExplanation;
  
  // 多系统冲突
  systemConflicts: SystemConflict[];
  
  // 元数据
  context: HolisticPersonContext;
  disclaimer: string;          // 免责声明（不可关闭）
}

// ==================== 六层引擎主类 ====================

export class SixLayerFusionEngine {
  private aiEngine: HybridAIEngine | null = null;
  private aiEnabled: boolean = false;

  constructor(aiConfig?: AIConfig) {
    if (aiConfig) {
      this.aiEngine = new HybridAIEngine(aiConfig);
      this.aiEnabled = true;
    }
  }

  /**
   * 执行完整卜算流程（六层融合）
   * 
   * @param context 全息人象上下文
   * @returns 完整的卜算结果
   */
  public async divinate(context: HolisticPersonContext): Promise<FinalDivinationResult> {
    // 第一步：生成唯一性密钥
    const key = UniqueDivinationKeyGenerator.generate(context);

    // 第二步：六层逐层计算
    const gongLi = this.computeGongLiLayer(context, key);
    const tiYong = this.computeTiYongLayer(context, key, gongLi);
    const jiBian = this.computeJiBianLayer(context, key, gongLi, tiYong);
    const quXiang = this.computeQuXiangLayer(context, key, gongLi, tiYong, jiBian);
    const yiLi = this.computeYiLiLayer(context, key, gongLi, tiYong, jiBian, quXiang);
    
    // 第三步：占断整合
    const citations = this.matchClassics(key, yiLi, quXiang);
    const conclusion = this.synthesizeConclusion(yiLi, quXiang, jiBian, gongLi, context);
    
    // 第三步半：权重解释与多系统冲突检测
    const weightExplanation = this.calculateWeightExplanation(context);
    const systemConflicts = this.detectSystemConflicts(yiLi, jiBian, quXiang, gongLi);

    // 第四步：AI增强解读（如果启用，失败不影响卜算结果）
    let aiInterpretation: InferenceResult | undefined;
    if (this.aiEnabled && this.aiEngine) {
      try {
        aiInterpretation = await this.generateAIInterpretation(
          context, key, { gongLi, tiYong, jiBian, quXiang, yiLi }, citations
        );
      } catch (aiError) {
        console.warn('AI解读生成失败，将使用纯算法结果:', (aiError as Error).message);
        aiInterpretation = undefined;
      }
    }

    // 第五步：组装最终结果
    const result: FinalDivinationResult = {
      id: this.generateResultId(key),
      timestamp: new Date(),
      key,
      hexagram: {
        primary: key.hexagramName,
        secondary: key.secondaryHexagram,
        changingLines: key.changingLine ? [key.changingLine] : [],
        lines: key.lines,
      },
      layers: {
        gongLi,
        tiYong,
        jiBian,
        quXiang,
        yiLi,
      },
      citations,
      aiInterpretation,
      conclusion,
      weightExplanation,
      systemConflicts,
      context,
      disclaimer: this.getDisclaimer(),
    };

    return result;
  }

  /**
   * 第一层：公理层
   * 阴阳五行、干支八卦、河洛数理
   */
  private computeGongLiLayer(
    context: HolisticPersonContext,
    key: DivinationKey
  ): GongLiLayer {
    const core = context.core;
    
    // 计算八字
    const eightChars = this.calculateEightCharacters(core?.birthDatetime, (core as any)?.birthPlace);
    
    // 计算阴阳比例
    const yinYangRatio = this.calculateYinYang(key.lines);
    
    // 计算五行分布
    const fiveElements = this.calculateFiveElements(eightChars, key);
    
    // 计算干支关系
    const stemsBranches = this.calculateStemsBranches(eightChars);
    
    // 卦象基本信息
    const hexagram = {
      trigrams: this.getHexagramTrigrams(key.hexagramName),
      yaoLines: key.lines,
      changing: key.changingLine ? [key.changingLine] : [],
    };

    return {
      yinYang: {
        overall: yinYangRatio.yang > yinYangRatio.yin ? 'yang' : 
                yinYangRatio.yang < yinYangRatio.yin ? 'yin' : 'balanced',
        ratio: [yinYangRatio.yang, yinYangRatio.yin],
      },
      fiveElements: {
        counts: fiveElements.counts,
        balance: fiveElements.status,
        flow: fiveElements.flow,
      },
      stemsBranches: {
        year: eightChars.year,
        month: eightChars.month,
        day: eightChars.day,
        hour: eightChars.hour,
        combined: stemsBranches.combined,
        clashes: stemsBranches.clashes,
      },
      hexagram,
    };
  }

  /**
   * 第二层：体用层
   * 本命为体、问事为用、时空为机
   */
  private computeTiYongLayer(
    context: HolisticPersonContext,
    key: DivinationKey,
    gongLi: GongLiLayer
  ): TiYongLayer {
    const core = context.core;
    const question = context.question;

    // 体：本命（八字日主）
    const dayMaster = gongLi.stemsBranches.day.charAt(0);
    
    // 分析五行
    const dominant = Object.entries(gongLi.fiveElements.counts)
      .sort((a, b) => b[1] - a[1])[0][0];
    const deficiency = Object.entries(gongLi.fiveElements.counts)
      .sort((a, b) => a[1] - b[1])[0][0];
    const excess = dominant;

    // 用：问事
    const targetDesc = question?.description || '综合'; 
    const hasCompetition = this.detectCompetition(key, question?.domain);

    // 机：时空
    // 天时：当前节气、月令旺衰
    const timing = this.getTimingStrength(gongLi.stemsBranches.month);
    
    // 地利：出生地 + 常住地（精确到村镇级别）
    const birthPlace = (core as any)?.birthPlace || '';
    const currentLoc = core?.currentLocation;
    const locationParts: string[] = [];
    if (birthPlace) locationParts.push(`出生地:${birthPlace}`);
    if (currentLoc) {
      const addr = (currentLoc as any).fullAddress 
        || [currentLoc.province, currentLoc.city, (currentLoc as any).district, (currentLoc as any).village].filter(Boolean).join('')
        || `${currentLoc.province}-${currentLoc.city}`;
      locationParts.push(`常住地:${addr}`);
    }
    const location = locationParts.length > 0 ? locationParts.join('；') : '未知';
    
    // 人和：八字与人事的对应 + 居住时长影响
    const resonance = this.calculateResonance(dayMaster, question?.domain);
    const residenceDuration = (core as any)?.residenceDuration || 0;
    const enrichedResonance = residenceDuration > 0 
      ? `${resonance}（在常住地居住${residenceDuration}年，地气已深）`
      : resonance;

    return {
      body: {
        eightCharacters: `${gongLi.stemsBranches.year} ${gongLi.stemsBranches.month} ${gongLi.stemsBranches.day} ${gongLi.stemsBranches.hour}`,
        dayMaster,
        fiveElements: { dominant, deficiency, excess },
      },
      application: {
        questionCategory: question?.domain || 'general',
        targetDescription: targetDesc,
        competition: hasCompetition ? '有竞争' : '无竞争',
      },
      opportunity: {
        timing,
        location,
        resonance: enrichedResonance,
      },
    };
  }

  /**
   * 第三层：机变层
   * 动变判断、格局组合、变数锁定
   */
  private computeJiBianLayer(
    context: HolisticPersonContext,
    key: DivinationKey,
    gongLi: GongLiLayer,
    tiYong: TiYongLayer
  ): JiBianLayer {
    // 确定变爻
    const changingLines: number[] = [];
    if (key.changingLine) {
      changingLines.push(key.changingLine);
    }
    
    // 变卦
    const changingHexagram = key.secondaryHexagram;
    
    // 格局判断
    const pattern = this.identifyPattern(key.hexagramName, changingLines, tiYong);
    
    // 变数分析
    const { stable, changing, critical } = this.analyzeVariables(
      key.hexagramName, 
      changingLines,
      context
    );

    return {
      changingLines,
      changingHexagram,
      pattern,
      variables: {
        stable,
        changing,
        critical,
      },
    };
  }

  /**
   * 第四层：取象层
   * 万物类象、用神定位、外应捕捉
   */
  private computeQuXiangLayer(
    context: HolisticPersonContext,
    key: DivinationKey,
    gongLi: GongLiLayer,
    tiYong: TiYongLayer,
    jiBian: JiBianLayer
  ): QuXiangLayer {
    // 主神定位（根据用神）
    const primarySymbol = this.locatePrimarySymbol(
      tiYong.application.questionCategory,
      key.hexagramName,
      gongLi.stemsBranches
    );
    
    // 辅象（卦中其他有用之神）
    const secondarySymbols = this.locateSecondarySymbols(
      key.hexagramName,
      primarySymbol
    );
    
    // 外应（来自用户输入）
    const externalSigns = context.mental?.premonitions || [];
    
    // 类象
    const images = {
      nature: this.getNatureImage(key.hexagramName),
      human: this.getHumanImage(tiYong.application.questionCategory),
      object: this.getObjectImage(key.hexagramName),
      place: this.getPlaceImage(key.hexagramName),
    };

    return {
      primarySymbol,
      secondarySymbols,
      externalSigns,
      images,
    };
  }

  /**
   * 第五层：义理层
   * 吉凶趋势、人事对应、应期推算
   */
  private computeYiLiLayer(
    context: HolisticPersonContext,
    key: DivinationKey,
    gongLi: GongLiLayer,
    tiYong: TiYongLayer,
    jiBian: JiBianLayer,
    quXiang: QuXiangLayer
  ): YiLiLayer {
    // 吉凶判断
    const auspiciousness = this.judgeAuspiciousness(
      key.hexagramName,
      jiBian.changingLines,
      tiYong
    );
    
    // 趋势描述
    const trend = this.analyzeTrend(
      key.hexagramName,
      jiBian.changingHexagram,
      tiYong,
      jiBian.pattern
    );
    
    // 应期推算
    const timeFrame = this.calculateTiming(
      key,
      context,
      jiBian.changingLines
    );
    
    // 建议
    const advice = this.generateAdvice(
      auspiciousness,
      tiYong.opportunity,
      quXiang
    );

    return {
      auspiciousness,
      trendDescription: trend,
      timeFrame,
      advice,
    };
  }

  // ==================== 辅助计算函数 ====================

  private calculateEightCharacters(birthDatetime: any, birthPlace?: string): {
    year: string;
    month: string;
    day: string;
    hour: string;
    trueSolarTimeNote?: string;
  } {
    const date = birthDatetime?.gregorian;
    if (!date) {
      return { year: '??', month: '??', day: '??', hour: '??' };
    }

    // 真太阳时修正
    let hour = birthDatetime?.lunar?.hour ?? date.getHours();
    let trueSolarTimeNote: string | undefined;
    
    if (birthPlace) {
      const longitude = lookupLongitude(birthPlace);
      if (longitude !== null) {
        const result = calculateTrueSolarTime(
          date.getHours(), date.getMinutes(), longitude,
          date.getFullYear(), date.getMonth() + 1, date.getDate()
        );
        const newShichen = getShichenFromTime(result.hour, result.minute);
        const oldShichen = getShichenFromTime(date.getHours(), date.getMinutes());
        if (newShichen !== oldShichen) {
          trueSolarTimeNote = `经真太阳时修正（${birthPlace} ${longitude}°E），时辰由${oldShichen}时改为${newShichen}时`;
        }
        hour = result.hour;
      }
    }

    const eightChars = LunarCalendarConverter.calculateEightCharacters(date, hour);

    return {
      year: eightChars.yearStem + eightChars.yearBranch,
      month: eightChars.monthStem + eightChars.monthBranch,
      day: eightChars.dayStem + eightChars.dayBranch,
      hour: eightChars.hourStem + eightChars.hourBranch,
      trueSolarTimeNote,
    };
  }

  private getMonthGanZhi(year: number, month: number): string {
    const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const zhi = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    
    const yearGanIndex = (year - 4) % 10;
    const startMonthGan = [1, 3, 5, 7, 9, 1, 3, 5, 7, 9][yearGanIndex]; // 年干起月诀
    
    const monthGan = gan[(startMonthGan + month - 2) % 10];
    const monthZhi = zhi[(month + 1) % 12]; // 正月建寅
    
    return monthGan + monthZhi;
  }

  private getHourGan(dayGan: string, hourZhi: string): string {
    const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const dayGanIndex = gan.indexOf(dayGan);
    const hourZhiIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(hourZhi);
    
    // 时干 = 日干数 * 2 + 1 + 时支序（甲己日干）
    const offset = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9][dayGanIndex % 5];
    return gan[(offset * 2 + hourZhiIndex) % 10];
  }

  private calculateYinYang(lines: boolean[]): { yang: number; yin: number } {
    const yang = lines.filter(l => l).length;
    const yin = lines.length - yang;
    return { yang, yin };
  }

  private calculateFiveElements(
    eightChars: { year: string; month: string; day: string; hour: string },
    key: DivinationKey
  ): { counts: Record<string, number>; status: string; flow: string } {
    // 简化的五行计数
    const counts: Record<string, number> = { '木': 2, '火': 1, '土': 1, '金': 2, '水': 1 };
    
    // 根据卦名调整
    const hexagramFiveElements: Record<string, string> = {
      '乾': '金', '坤': '土', '震': '木', '巽': '木', '坎': '水', '离': '火', '艮': '土', '兑': '金',
    };
    const upperTrigram = key.hexagramName.charAt(0);
    const element = hexagramFiveElements[upperTrigram];
    if (element) counts[element] += 2;

    // 判断平衡状态
    const max = Math.max(...Object.values(counts));
    const min = Math.min(...Object.values(counts));
    const status = max - min > 2 ? '偏胜' : '基本平衡';
	
	// 生克流向
	const flow = '木→火→土→金→水→木';

	return { counts, status, flow };
  }

  private calculateStemsBranches(eightChars: any): { combined: string[]; clashes: string[] } {
    // 简化的合冲分析
    // 实际应分析：子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲
    // 以及六合、三合等
    return {
      combined: [],
      clashes: [],
    };
  }

  private getHexagramTrigrams(name: string): [string, string] {
    // 六十四卦上下卦
    const trigrams: Record<string, [string, string]> = {
      '乾': ['乾', '乾'], '坤': ['坤', '坤'], '屯': ['坎', '震'], '蒙': ['艮', '坎'],
      '需': ['坎', '乾'], '讼': ['乾', '坎'], '师': ['坎', '坤'], '比': ['坤', '坎'],
      // ... 其他卦
    };
    return trigrams[name] || ['乾', '乾'];
  }

  private detectCompetition(key: DivinationKey, domain?: string): boolean {
    // 竞争检测：某些卦象在特定领域暗示竞争
    if (domain === 'career' || domain === 'relationship') {
      const competitiveHexagrams = ['讼', '夬', '姤', '革', '鼎'];
      return competitiveHexagrams.includes(key.hexagramName);
    }
    return false;
  }

  private getTimingStrength(monthPillar: string): string {
    // 根据月令判断天时
    // 实际应分析日主与月令的生克关系
    return '中和';
  }

  private calculateResonance(dayMaster: string, domain?: string): string {
    // 人和：日主与事类的关系
    const domainElements: Record<string, string> = {
      'career': '金', 'wealth': '土', 'relationship': '木', 'health': '水', 'study': '火',
    };
    const element = domainElements[domain || 'general'];
    if (element) {
      const relations: Record<string, Record<string, string>> = {
        '甲': { '木': '比', '火': '泄', '土': '财', '金': '官', '水': '印' },
        '乙': { '木': '比', '火': '泄', '土': '财', '金': '官', '水': '印' },
        // ... 其他天干
      };
      return relations[dayMaster]?.[element] || '和';
    }
    return '平';
  }

  private identifyPattern(name: string, changingLines: number[], tiYong: TiYongLayer): string {
    // 常用格局判断
    const patterns: Record<string, string> = {
      '乾': '天行健',
      '坤': '地势坤',
      '泰': '天地交泰',
      '否': '天地不交',
      '谦': '谦受益',
      '豫': '顺以动',
      '随': '随时',
      '蛊': '振民育德',
      '临': '教思无穷',
      '观': '省方观民',
      '噬嗑': '明罚勑法',
      '贲': '文以致饰',
      '剥': '上以厚下',
      '复': '反身修德',
      '无妄': '动而健',
      '大畜': '日新其德',
      '颐': '自求口实',
      '大过': '独立不惧',
      '坎': '常德行',
      '离': '大人以继明',
      '咸': '君子以虚受',
      '恒': '君子以立不易',
      '遁': '远小人',
      '大壮': '非礼勿履',
      '晋': '明出地上',
      '明夷': '用晦而明',
      '家人': '正家而天下',
      '睽': '君子以同而异',
      '蹇': '反身修德',
      '解': '赦过宥罪',
      '损': '惩忿窒欲',
      '益': '见善则迁',
      '夬': '施禄及下',
      '姤': '施命诰四方',
      '萃': '除戎器',
      '升': '积小以高大',
      '困': '致命遂志',
      '井': '劳民劝相',
      '革': '治历明时',
      '鼎': '正位凝命',
      '震': '恐惧修省',
      '艮': '君子以思不出',
      '渐': '居贤德善俗',
      '归妹': '君子以永终知敝',
      '丰': '折狱致刑',
      '旅': '君子以明慎用刑',
      '巽': '申命行事',
      '兑': '朋友讲习',
      '涣': '先王以享于帝',
      '节': '制数度议德行',
      '中孚': '议狱缓死',
      '小过': '君子以行过乎恭',
      '既济': '思患预防',
      '未济': '君子以慎辨物居方',
    };

    const basePattern = patterns[name] || '平';
    
    // 变爻影响
    if (changingLines.length > 0) {
      return `(${basePattern}) · ${changingLines.length}动`;
    }
    
    return basePattern;
  }

  private analyzeVariables(
    hexagramName: string, 
    changingLines: number[],
    context: HolisticPersonContext
  ): { stable: string[]; changing: string[]; critical: string } {
    const stable: string[] = [];
    const changing: string[] = [];
    let critical = '当下';

    // 稳定因素
    stable.push('本命');
    stable.push('问事');
    
    // 变化因素
    if (changingLines.length > 0) {
      changing.push('变爻预示转机');
      critical = '动变时刻';
    }
    
    if (context.situation?.majorChanges) {
      changing.push('近期有变');
      critical = '变动之中';
    }

    return { stable, changing, critical };
  }

  private locatePrimarySymbol(
    category: string, 
    hexagramName: string, 
    stemsBranches: GongLiLayer['stemsBranches']
  ): string {
    // 用神定位
    const godMap: Record<string, string> = {
      'career': '官鬼',
      'wealth': '妻财',
      'relationship': '妻财',
      'marriage': '妻财',
      'health': '官鬼',
      'study': '父母',
      'travel': '兄弟',
      'general': '世爻',
    };
    return godMap[category] || '世爻';
  }

  private locateSecondarySymbols(hexagramName: string, primaryGod: string): string[] {
    // 辅象：与原神的关系
    const godRelations: Record<string, string[]> = {
      '妻财': ['世爻', '官鬼'],
      '官鬼': ['世爻', '妻财'],
      '父母': ['世爻', '官鬼'],
      '兄弟': ['世爻', '官鬼'],
      '子孙': ['世爻', '官鬼'],
      '世爻': ['应爻'],
    };
    return godRelations[primaryGod] || [];
  }

  private getNatureImage(hexagramName: string): string {
    const images: Record<string, string> = {
      '乾': '天', '坤': '地', '屯': '云雷', '蒙': '山下出泉',
      '需': '云上于天', '讼': '天与水违', '师': '地中有水', '比': '地上有水',
      '小畜': '风行天上', '履': '上天下泽', '泰': '天地交', '否': '天地不交',
      '同人': '天与火', '大有': '火在天上', '谦': '地中有山', '豫': '雷出地奋',
      '随': '泽中有雷', '蛊': '山下有风', '临': '泽上有地', '观': '风行地上',
      '噬嗑': '雷电', '贲': '山下有火', '剥': '山附于地', '复': '雷在地中',
      '无妄': '天下雷行', '大畜': '天在山中', '颐': '山下有雷', '大过': '泽灭木',
      '坎': '水洊至', '离': '明两作', '咸': '山上有泽', '恒': '雷风',
      '遁': '天下有山', '大壮': '雷在天上', '晋': '明出地上', '明夷': '明入地中',
      '家人': '风自火出', '睽': '上火下泽', '蹇': '山上有水', '解': '雷雨',
      '损': '山下有泽', '益': '风雷', '夬': '泽上于天', '姤': '天下有风',
      '萃': '泽上于地', '升': '地中生木', '困': '泽无水', '井': '木上有水',
      '革': '泽中有火', '鼎': '木上有火', '震': '洊雷', '艮': '兼山',
      '渐': '山上有木', '归妹': '泽上有雷', '丰': '雷电皆至', '旅': '山上有火',
      '巽': '随风', '兑': '丽泽', '涣': '风行水上', '节': '泽上有水',
      '中孚': '泽上有风', '小过': '山上有雷', '既济': '水在火上', '未济': '火在水上',
    };
    return images[hexagramName] || '未知';
  }

  private getHumanImage(category: string): string {
    const images: Record<string, string> = {
      'career': '君',
      'wealth': '贾',
      'relationship': '耦',
      'family': '家',
      'health': '身',
      'study': '士',
      'travel': '旅',
      'dispute': '讼',
      'lost': '遗',
      'general': '人',
    };
    return images[category] || '人';
  }

  private getObjectImage(hexagramName: string): string {
    const images: Record<string, string> = {
      '乾': '玉，金，衣',
      '坤': '布，田，釜',
      '震': '龙，旞，鼓',
      '巽': '木，绳，直',
      '坎': '水，弓，轮',
      '离': '火，甲，戈',
      '艮': '山，径，果',
      '兑': '泽，口舌',
    };
    // 取上卦或下卦
    const first = hexagramName.charAt(0);
    return images[first] || '物';
  }

  private getPlaceImage(hexagramName: string): string {
    // 简化的方位
    const positions: Record<string, string> = {
      '乾': '西北', '坤': '西南', '震': '东', '巽': '东南',
      '坎': '北', '离': '南', '艮': '东北', '兑': '西',
    };
    return positions[hexagramName.charAt(0)] || '中';
  }

  private judgeAuspiciousness(
    hexagramName: string,
    changingLines: number[],
    tiYong: TiYongLayer
  ): YiLiLayer['auspiciousness'] {
    // 基于卦名的吉凶判断（简化版）
    const auspiciousMap: Record<string, YiLiLayer['auspiciousness']> = {
      '谦': '大吉', '泰': '吉', '大有': '吉', '同人': '吉',
      '否': '凶', '蹇': '凶', '困': '凶', '屯': '小凶',
      '随': '吉', '蛊': '凶', '临': '吉', '观': '小吉',
      '噬嗑': '平', '贲': '小吉', '剥': '凶', '复': '吉',
      '无妄': '平', '大畜': '吉', '颐': '吉', '大过': '凶',
      '咸': '吉', '恒': '吉', '遁': '小凶', '大壮': '吉',
      '晋': '吉', '明夷': '凶', '家人': '吉', '睽': '凶',
      '解': '吉', '损': '小凶', '益': '吉', '夬': '吉',
      '姤': '凶', '萃': '平', '升': '吉', '井': '平',
      '革': '平', '鼎': '吉', '震': '小凶', '艮': '小凶',
      '渐': '吉', '归妹': '小凶', '丰': '吉', '旅': '小凶',
      '巽': '小吉', '兑': '平', '涣': '平', '节': '吉',
      '中孚': '吉', '小过': '小凶', '既济': '吉', '未济': '小凶',
    };
    
    let result = auspiciousMap[hexagramName] || '平';
    
    // 变爻影响
    if (changingLines.length > 0) {
      // 动爻可能改变吉凶
      // 实际应根据变爻对应卦辞的吉凶来修正
      const adjustment = ['大吉', '吉', '小吉', '平', '小凶', '凶', '大凶'];
      const currentIndex = adjustment.indexOf(result);
      const newIndex = Math.max(0, Math.min(6, currentIndex + (Math.random() > 0.5 ? 1 : -1)));
      result = adjustment[newIndex] as YiLiLayer['auspiciousness'];
    }
    
    return result;
  }

  private analyzeTrend(
    hexagramName: string,
    secondaryHexagram: string | undefined,
    tiYong: TiYongLayer,
    pattern: string
  ): string {
    // 趋势分析：从本卦到变卦（如果有）
    let trend = `本卦《${hexagramName}》示${tiYong.application.questionCategory}.`;
    
    if (secondaryHexagram) {
      trend += `  变为《${secondaryHexagram}》，格局"${pattern}"，主${tiYong.opportunity.timing}。`;
    } else {
      trend += ` ${pattern}，主${tiYong.opportunity.timing}。`;
    }
    
    return trend;
  }

  private calculateTiming(
    key: DivinationKey,
    context: HolisticPersonContext,
    changingLines: number[]
  ): YiLiLayer['timeFrame'] {
    // 应期推算（基于变爻）
    const now = context.question?.askTime || new Date();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    
    // 发用时间（当前）
    const effective = '即日起';
    
    // 转折点
    let transition = '短期内';
    if (changingLines.length === 1) transition = '一月内';
    else if (changingLines.length === 2) transition = '二月内';
    else if (changingLines.length === 3) transition = '三月内';
    
    // 应期（最终期限）
    let deadline = '半年内方显';
    if (changingLines.length > 0) {
      const transitionDate = new Date(now.getTime() + changingLines.length * oneMonth * 2);
      deadline = transitionDate.toLocaleDateString('zh-CN') + '前后应验';
    }

    // 概率性时间节点
    const changingCount = changingLines.length || 1;
    const probabilityRanges: YiLiLayer['timeFrame']['probabilityRanges'] = [
      {
        period: `${changingCount}个月内`,
        probability: 0.7,
        condition: '主动推进且条件具备时，最高概率在此期间应验',
      },
      {
        period: `${Math.max(changingCount * 2, 3)}个月内`,
        probability: 0.45,
        condition: '若前期未显，则中期转折点出现时可能触发',
      },
      {
        period: `${Math.max(changingCount * 3, 6)}个月内`,
        probability: 0.25,
        condition: '延迟应验，需外部条件变化或心境转变后方可显现',
      },
    ];

    return { effective, transition, deadline, probabilityRanges };
  }

  private generateAdvice(
    auspiciousness: YiLiLayer['auspiciousness'],
    opportunity: TiYongLayer['opportunity'],
    quXiang: QuXiangLayer
  ): YiLiLayer['advice'] {
    // 基于吉凶给出建议
    const adviceByFortune: Record<string, YiLiLayer['advice']> = {
      '大吉': {
        action: '可放手施为，天时地利人和俱备',
        timing: `宜${opportunity.timing}行动`,
        caution: '盛极防衰，留有余地',
      },
      '吉': {
        action: '落子在己，则棋局可活',
        timing: `宜${opportunity.timing}进取`,
        caution: '勿贪全，得七分为上',
      },
      '小吉': {
        action: '可行但需周全',
        timing: `静待${opportunity.timing}`,
        caution: '小不忍则乱大谋',
      },
      '平': {
        action: '大事缓成，忌轻举妄动',
        timing: '宜观望，待时机',
        caution: '持中守正，静观其变',
      },
      '小凶': {
        action: '暂退为进，藏器待时',
        timing: '避其锋芒',
        caution: '君子不立危墙之下',
      },
      '凶': {
        action: '不可妄动，守成即可',
        timing: '待转运',
        caution: '退一步海阔天空',
      },
      '大凶': {
        action: '静守为上，诸事不宜',
        timing: '宜蛰伏',
        caution: '九成之台起于累土，今日之忍为来日之基',
      },
    };
    
    return adviceByFortune[auspiciousness] || {
      action: '审时度势',
      timing: '待时',
      caution: '慎始',
    };
  }

  private matchClassics(
    key: DivinationKey,
    yiLi: YiLiLayer,
    quXiang: QuXiangLayer
  ): ClassicCitation[] {
    // 从典籍数据库查询卦象信息
    const hexagram = getHexagramByName(key.hexagramName);
    const citations: ClassicCitation[] = [];

    if (hexagram) {
      // 卦辞
      citations.push({
        title: '周易',
        chapter: `${hexagram.name}卦辞`,
        quote: `《${hexagram.name}》：${hexagram.guaCi}`,
        translation: hexagram.translation,
        relevance: 1.0,
      });

      // 彖传
      citations.push({
        title: '周易·彖传',
        chapter: `${hexagram.name}彖`,
        quote: `彖曰：${hexagram.tuanCi}`,
        translation: `${hexagram.name}的彖传说：${hexagram.translation}`,
        relevance: 0.95,
      });

      // 大象（象传）
      citations.push({
        title: '周易·象传',
        chapter: `${hexagram.name}大象`,
        quote: `象曰：${hexagram.xiangYue}`,
        translation: `${hexagram.name}的象传说：${hexagram.translation}`,
        relevance: 0.9,
      });

      // 变爻爻辞（如果有）
      if (key.changingLine !== undefined && key.changingLine !== null) {
        const lineIndex = key.changingLine - 1;
        if (lineIndex >= 0 && lineIndex < hexagram.yaoCi.length) {
          const lineText = hexagram.yaoCi[lineIndex];
          const lineNames = ['初', '二', '三', '四', '五', '上'];
          const line阴阳 = key.lines?.[lineIndex] ? '九' : '六';
          const lineName = lineNames[lineIndex] + line阴阳;

          citations.push({
            title: '周易·爻传',
            chapter: `${hexagram.name}${lineName}`,
            quote: `${lineName}曰：${lineText}`,
            translation: `${hexagram.name}卦${lineName}爻辞的白话：${lineText.replace(/^[^：]+：/, '')}`,
            relevance: 0.85,
          });
        }
      }
    } else {
      // 兜底：当数据库中找不到对应卦时，返回基本信息
      citations.push({
        title: '周易',
        chapter: `${key.hexagramName}卦`,
        quote: `《${key.hexagramName}》`,
        translation: `${key.hexagramName}卦的典籍数据暂缺`,
        relevance: 1.0,
      });
    }

    return citations;
  }

  private synthesizeConclusion(
    yiLi: YiLiLayer,
    quXiang: QuXiangLayer,
    jiBian: JiBianLayer,
    gongLi: GongLiLayer,
    context: HolisticPersonContext
  ): FinalDivinationResult['conclusion'] {
    // 综合结论
    const verdict = yiLi.auspiciousness;
    
    // 关键词
    const keywords: string[] = [
      yiLi.auspiciousness,
      quXiang.primarySymbol,
      jiBian.pattern,
    ];
    
    // 时间线
    const timeline = yiLi.timeFrame;
    
    // 行动建议
    const actions = {
      favorable: [
        yiLi.advice.action.split('，')[0],
        '静观',
        '等待',
      ].filter(Boolean),
      avoid: [
        yiLi.advice.caution,
        '妄动',
        '贪进',
      ].filter(Boolean),
    };

    // 方位建议（基于五行）
    const directionAdvice = this.generateDirectionAdvice(gongLi);

    // 幸运颜色（基于五行）
    const colorAdvice = this.generateColorAdvice(gongLi);

    // 心理建议（基于心绪状态）
    const mentalAdvice = this.generateMentalAdvice(context);
    return {
      verdict,
      keywords,
      timeline: {
        near: timeline.effective,
        medium: timeline.transition,
        far: timeline.deadline,
      },
      actions,
      directionAdvice,
      colorAdvice,
      mentalAdvice,
    };
  }

  private static readonly TONGSU_STYLE_GUIDE = `
【输出风格要求——极其重要，必须严格遵守】
1. 语言风格：用大白话解读，像朋友聊天一样，不要用"离火之明"、"震雷之动"、"六五阴爻居阳位"这类普通人看不懂的术语。如果必须提到术语，立刻用括号加白话解释。
2. 格式要求：
   - 第一部分：用一句话说清楚核心结论（比如"你们的感情在'热恋转稳定'的关键期"）
   - 第二部分：分维度解读，每个维度用小标题，用表格或列表让信息一目了然
   - 第三部分：行动建议，用"该做什么"和"别做什么"的对比表格
   - 最后必须有【卦象总结】和【行动建议】两个收尾板块
3. 结尾格式（必须有，放在最后）：
   【卦象总结】用2-3句话概括这个卦象对问事者的核心启示，要明白易懂，像总结一段人生经验一样。
   【行动建议】列出3-5条具体的、马上能做的行动，每条用一句话，前面加序号。
4. 绝对不要：出现"赠言"、"送你一句话"、"最后寄语"这种文艺腔结尾。直接用"卦象总结"和"行动建议"收尾。
5. 表格要多用：概率、路径对比、时间窗口等信息尽量用表格展示，让用户一眼就能抓住重点。
`;
  /** 领域专属系统提示词映射 */
  private static readonly DOMAIN_SYSTEM_PROMPTS: Record<string, string> = {
    career: `你是精通中国传统术数的AI解卦师，专精于事业与职业发展领域。
请从以下维度进行专业解读：
1. 事业运势：当前所处的职业阶段（起步、发展、瓶颈、转型）及趋势走向
2. 决策指引：针对求问者的具体事业困惑，给出明确的行动方向
3. 时机把握：判断何时进取、何时守成、何时转型
4. 人际关系：贵人方位、小人防范、上下级关系处理
5. 风险提示：事业中可能遇到的阻碍及应对策略
请引用相关卦辞、彖传、象传原文，并结合现代职场实际给出可操作建议。避免空泛的吉凶论断。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态（如焦虑、平静、急迫等）对卦局解读和决策准确率的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围，避免单一应期论断。\n- 方位与颜色建议：基于五行方位（东-木/南-火/中央-土/西-金/北-水）给出有利方位建议；基于五行喜忌给出开运颜色建议。\n- 多路径分析：请给出2-3条不同选择路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,

    wealth: `你是精通中国传统术数的AI解卦师，专精于财运与投资理财领域。
请从以下维度进行专业解读：
1. 财运走势：正财与偏财的旺衰判断，近期财运转折点
2. 投资建议：适不适合投资、投资方向、风险等级评估
3. 进财时机：最佳求财时间段和方位
4. 破财防范：可能导致财运受损的行为或决策，如何规避
5. 理财策略：根据卦象给出具体的资产配置或理财方向建议
请引用相关卦辞、彖传、象传原文，并结合现代理财观念给出实用建议。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态对卦局解读和决策准确率的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围。\n- 方位与颜色建议：基于五行方位给出有利方位建议；基于五行喜忌给出开运颜色建议。\n- 多路径分析：请给出2-3条不同选择路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,

    relationship: `你是精通中国传统术数的AI解卦师，专精于情感与恋爱关系领域。
请从以下维度进行专业解读：
1. 感情状态：双方关系的本质与当前阶段（萌芽、热恋、平淡、危机）
2. 缘分判断：这段感情的缘分深浅与发展趋势
3. 沟通指引：如何改善沟通、化解误会、增进感情
4. 对方心意：从卦象推测对方的真实想法和态度
5. 行动建议：应该主动还是等待、如何把握时机
请引用相关卦辞、彖传、象传原文，并结合现代恋爱心理给出真诚建议。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态对卦局解读的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围。\n- 方位与颜色建议：基于五行方位给出有利方位建议；基于五行喜忌给出开运颜色建议。\n- 多路径分析：请给出2-3条不同选择路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,

    marriage: `你是精通中国传统术数的AI解卦师，专精于婚姻与家庭关系领域。
请从以下维度进行专业解读：
1. 婚姻运势：婚姻质量、稳定性及发展趋势
2. 配偶信息：从卦象分析配偶的性格特征或缘分方位
3. 家庭和谐：夫妻相处之道、婆媳关系、子女教育
4. 婚期择吉：若问婚期，给出适宜的时间窗口
5. 危机化解：婚姻中可能出现的问题及化解方法
请引用相关卦辞、彖传、象传原文，并结合现代婚姻观念给出建设性建议。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态对卦局解读的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围。\n- 方位与颜色建议：基于五行方位给出有利方位建议；基于五行喜忌给出开运颜色建议。\n- 多路径分析：请给出2-3条不同选择路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,

    health: `你是精通中国传统术数的AI解卦师，专精于健康与养生领域。
请从以下维度进行专业解读：
1. 健康状态：当前身体状况评估（注意：仅作参考，不替代医学诊断）
2. 病症分析：五行失衡可能对应的脏腑问题
3. 调理方向：养生建议、作息调整、饮食宜忌
4. 就医时机：是否需要尽快就医、何时复查为宜
5. 心理健康：情绪状态分析及心理调适建议
请引用相关卦辞、彖传、象传原文。务必提醒：AI解读仅供参考，身体不适请及时就医。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态对卦局解读和康复心态的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围。\n- 方位与颜色建议：基于五行方位给出有利方位建议；基于五行喜忌给出开运颜色建议。\n- 多路径分析：请给出2-3条不同选择路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,

    study: `你是精通中国传统术数的AI解卦师，专精于学业与考试领域。
请从以下维度进行专业解读：
1. 学业运势：学习状态、理解能力、考试运的旺衰
2. 考试预测：考试结果预估、需要注意的科目或环节
3. 学习方法：根据卦象建议适合的学习策略和节奏
4. 升学/求职：升学、考研、考公等重大选择的方向指引
5. 心态调整：如何克服学习焦虑、保持专注
请引用相关卦辞、彖传、象传原文，并给出切实可行的学习建议。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态（如焦虑、平静等）对卦局解读和学习效率的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围。\n- 方位与颜色建议：基于五行方位给出有利方位建议；基于五行喜忌给出开运颜色建议。\n- 多路径分析：请给出2-3条不同选择路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,

    family: `你是精通中国传统术数的AI解卦师，专精于家庭事务领域。
请从以下维度进行专业解读：
1. 家运走势：家庭整体运势、和睦程度
2. 亲子关系：与父母、子女的关系分析与改善建议
3. 家宅风水：从卦象看家宅方位吉凶、搬迁宜忌
4. 家族事务：分家、继承、家族纠纷等事务的走向
5. 和睦之道：增进家庭凝聚力的具体行动建议
请引用相关卦辞、彖传、象传原文，并结合现代家庭关系给出温暖建议。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态对卦局解读的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围。\n- 方位与颜色建议：基于五行方位给出有利方位建议；基于五行喜忌给出开运颜色建议。\n- 多路径分析：请给出2-3条不同选择路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,

    travel: `你是精通中国传统术数的AI解卦师，专精于出行与远行领域。
请从以下维度进行专业解读：
1. 出行吉凶：旅途是否平安、顺利程度
2. 方位指引：有利方位与不利方位、出行方向建议
3. 时机选择：最佳出行日期和时段
4. 旅途注意：可能遇到的阻碍、安全提醒
5. 目的地运势：到达目的地后的运势及办事结果
请引用相关卦辞、彖传、象传原文，并给出出行前的具体准备建议。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态对出行决策的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围。\n- 方位与颜色建议：基于五行方位给出出行有利方位建议；基于五行喜忌给出开运颜色建议。\n- 多路径分析：请给出2-3条不同选择路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,

    dispute: `你是精通中国传统术数的AI解卦师，专精于争讼与法律事务领域。
请从以下维度进行专业解读：
1. 诉讼走向：官司、仲裁等法律事务的最终结果预判
2. 胜负分析：己方与对方的优势劣势对比
3. 调解时机：是否适合和解、最佳和解时间窗口
4. 证据策略：从卦象看关键证据或证人的方位
5. 风险评估：诉讼过程中的风险及应对策略
请引用相关卦辞、彖传、象传原文。务必提醒：AI解读仅供参考，法律事务请咨询专业律师。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态对卦局解读和诉讼心态的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围。\n- 方位与颜色建议：基于五行方位给出有利方位建议；基于五行喜忌给出开运颜色建议。\n- 多路径分析：请给出2-3条不同选择路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,

    lost: `你是精通中国传统术数的AI解卦师，专精于寻物与失物找回领域。
请从以下维度进行专业解读：
1. 失物方位：物品可能所在的大致方位和位置特征
2. 找回概率：失物能否找回的综合判断
3. 寻物时机：最佳寻找时间和行动方案
4. 线索指引：从卦象提取可能的线索（颜色、材质、场所）
5. 注意事项：寻物过程中的宜忌和提示
请引用相关卦辞、彖传、象传原文，并给出具体的寻物步骤建议。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态对寻物决策的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围。\n- 方位与颜色建议：基于五行方位给出寻物有利方位建议；基于五行喜忌给出参考颜色建议。\n- 多路径分析：请给出2-3条不同寻找路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,

    general: `你是精通中国传统术数的AI解卦师，擅长易经、六爻、梅花易数等卜筮学问。
请从以下维度进行综合专业解读：
1. 卦象总论：本卦与变卦的整体含义、吉凶判断
2. 人事对应：卦象与求问者当前处境的对应关系
3. 趋势分析：事情发展的大致走向与关键转折点
4. 五行生克：从五行角度分析各要素间的相互作用
5. 综合建议：结合义理与实际给出可操作的行动指南
请引用相关卦辞、彖传、象传原文，做到有理有据。避免迷信表述，强调仅供参考。\n\n【必答附加要求】\n- 心绪状态影响：必须分析求问者当前心绪状态对卦局解读的影响，并给出心念调整建议。\n- 概率化应期：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围。\n- 方位与颜色建议：基于五行方位给出有利方位建议；基于五行喜忌给出开运颜色建议。\n- 多路径分析：请给出2-3条不同选择路径，每条路径标注成功概率和风险等级，避免给出唯一性答案。`,
  };

  private async generateAIInterpretation(
    context: HolisticPersonContext,
    key: DivinationKey,
    layers: {
      gongLi: GongLiLayer;
      tiYong: TiYongLayer;
      jiBian: JiBianLayer;
      quXiang: QuXiangLayer;
      yiLi: YiLiLayer;
    },
    citations: ClassicCitation[]
  ): Promise<InferenceResult> {
    if (!this.aiEngine) {
      throw new Error('AI引擎未初始化');
    }

    // 根据问事领域选择专属系统提示词
    const domain = (context.question?.domain || 'general') as string;
    const basePrompt = SixLayerFusionEngine.DOMAIN_SYSTEM_PROMPTS[domain]
      || SixLayerFusionEngine.DOMAIN_SYSTEM_PROMPTS.general;
    // 追加通俗化风格指南
    const systemPrompt = basePrompt + SixLayerFusionEngine.TONGSU_STYLE_GUIDE;

    // 构建完整的人象信息字符串，包含所有用户输入
    const personExtras: string[] = [];
    const birthPlace = (context.core as any)?.birthPlace;
    if (birthPlace) personExtras.push(`出生地：${birthPlace}`);
    const residenceDuration = (context.core as any)?.residenceDuration;
    if (residenceDuration) personExtras.push(`常住地居住${residenceDuration}年`);
    
    // 当前境地信息
    const situation = context.situation;
    if (situation) {
      const stageMap: Record<string, string> = {
        starting: '起步期', accumulating: '积累期', bottleneck: '瓶颈期',
        transition: '转型期', crisis: '危机期', recovery: '恢复期', stable: '稳定期'
      };
      personExtras.push(`人生阶段：${stageMap[situation.lifeStage] || situation.lifeStage}`);
      if (situation.coreDilemma) personExtras.push(`核心困境：${situation.coreDilemma}`);
      if (situation.stagnationMonths) personExtras.push(`困境持续${situation.stagnationMonths}个月`);
      if (situation.currentResources?.length) personExtras.push(`可用资源：${situation.currentResources.join('、')}`);
      if (situation.majorChanges && situation.changeDetails) personExtras.push(`近期变化：${situation.changeDetails}`);
    }
    
    // 补充人象
    const supp = context.supplementary;
    if (supp) {
      if (supp.occupation) personExtras.push(`职业：${supp.occupation}`);
      if (supp.financialStatus) {
        const finMap: Record<string, string> = { poor: '紧张', average: '一般', comfortable: '宽裕', wealthy: '富足' };
        personExtras.push(`财务状况：${finMap[supp.financialStatus] || supp.financialStatus}`);
      }
    }
    
    // 主观预期
    const exp = context.expectation;
    if (exp) {
      if (exp.desiredOutcome) personExtras.push(`期望结果：${exp.desiredOutcome}`);
      if (exp.minimalAcceptable) personExtras.push(`最低可接受：${exp.minimalAcceptable}`);
      if (exp.actionPlan) personExtras.push(`行动计划：${exp.actionPlan}`);
      if (exp.riskTolerance) {
        const riskMap: Record<string, string> = { low: '保守', medium: '适中', high: '激进' };
        personExtras.push(`风险承受度：${riskMap[exp.riskTolerance] || exp.riskTolerance}`);
      }
      if (exp.timeHorizon) {
        const timeMap: Record<string, string> = { short: '短期(1-3月)', medium: '中期(半年-1年)', long: '长期(1年+)' };
        personExtras.push(`期望周期：${timeMap[exp.timeHorizon] || exp.timeHorizon}`);
      }
    }
    
    // 心绪状态
    const mentalStateMap: Record<string, string> = {
      calm: '平静', anxious: '焦虑', hopeful: '期待', confused: '困惑', urgent: '急迫'
    };
    const mentalState = mentalStateMap[context.mental?.emotionalState || ''] || '平静';
    if (context.mental?.physicalState) personExtras.push(`身体感受：${context.mental.physicalState}`);
    if (context.mental?.premonitions?.length) personExtras.push(`外应预兆：${context.mental.premonitions.join('、')}`);
    if (context.mental?.distraction != null) personExtras.push(`杂念程度：${context.mental.distraction}/10`);
    // 心绪状态对卦局影响分析
    const mentalImpactMap: Record<string, string> = {
      calm: '心绪状态: 平静 - 心绪安定，卦局解读准确率较高，利于做出理性决策',
      anxious: '心绪状态: 焦虑 - 卦局显示情绪波动会影响决策准确率，建议先安定心神再做重要决定',
      hopeful: '心绪状态: 期待 - 积极心态有助于应验良性卦象，但需警惕期望过高导致判断偏差',
      confused: '心绪状态: 困惑 - 心念不定会影响卦象指向性，建议明确核心问题后重新审视卦局',
      urgent: '心绪状态: 急迫 - 急切心态可能忽略卦中潜藏的转折时机，建议保持耐心观察'
    };
    const mentalImpact = mentalImpactMap[context.mental?.emotionalState || '']
      || '心绪状态: ' + mentalState + ' - 心绪状态将影响卦局解读，请结合卦象综合判断';
    personExtras.push(mentalImpact);

    // 概率化应期提示
    personExtras.push('应期分析要求：请给出至少3个概率化应期（最高概率/次高概率/低概率），每个应期说明触发条件和时间范围，避免单一应期论断');

    const request: InferenceRequest = {
      divinationContext: {
        personInfo: {
          name: context.core?.name || '匿名',
          birthDate: {
            lunarYear: context.core?.birthDatetime?.lunar?.year || 0,
            lunarMonth: context.core?.birthDatetime?.lunar?.month || 1,
            lunarDay: context.core?.birthDatetime?.lunar?.day || 1,
            isLeap: context.core?.birthDatetime?.lunar?.isLeap || false,
            yearGanZhi: '',
          },
          birthplace: birthPlace || context.core?.currentLocation?.city || '未知',
          gender: (context.core?.gender || 'male') as 'male' | 'female',
        },
        question: {
          category: {
            domain: (context.question?.domain || 'general') as 'career' | 'wealth' | 'relationship' | 'health' | 'study' | 'travel' | 'decision' | 'general',
            urgency: context.question?.urgency || 'normal',
          },
          description: context.question?.description || '综合询问',
          askTime: context.question?.askTime || new Date(),
          mentalState: mentalState,
        },
        hexagram: {
          primary: key.hexagramName,
          changing: key.secondaryHexagram,
          lines: key.lines,
          timestamp: new Date(),
        },
        classics: citations.map(c => ({
          title: c.title,
          chapter: c.chapter || '',
          quote: c.quote,
          translation: (c as any).translation || '',
          relevance: c.relevance,
        })),
      },
      task: 'interpret',
      complexity: 'standard',
      systemPrompt,
    };

    return this.aiEngine.infer(request);
  }

  private generateResultId(key: DivinationKey): string {
    // 生成唯一结果ID
    const timestamp = Date.now().toString(36);
    const hash = key.combinedHash.slice(0, 8);
    return `${key.hexagramName}-${timestamp}-${hash}`;
  }

  // ==================== 权重解释与冲突检测 ====================

  /**
   * 计算各层权重分配说明
   * 本命人物35%，境况25%（有数据时），时机20%，心理20%（有数据时）
   * 无数据时重新分配权重
   */
  private calculateWeightExplanation(context: HolisticPersonContext): WeightExplanation {
    const hasMental = !!context.mental;
    const hasSituation = !!context.situation;

    let personWeight = 0.35;
    let situationWeight = 0;
    let timingWeight = 0.20;
    let mentalWeight = 0;

    const descriptions: string[] = [];

    if (hasSituation) {
      situationWeight = 0.25;
      descriptions.push('境况数据已采集，权重25%');
    } else {
      // 无境况数据时，其权重分配给本命
      personWeight += 0.25;
      descriptions.push('境况数据未采集，其权重25%归入本命层');
    }

    if (hasMental) {
      mentalWeight = 0.20;
      descriptions.push('心绪数据已采集，权重20%');
    } else {
      // 无心绪数据时，其权重分配给本命
      personWeight += 0.20;
      descriptions.push('心绪数据未采集，其权重20%归入本命层');
    }

    descriptions.push(`本命人物层权重${Math.round(personWeight * 100)}%`);
    descriptions.push('时机层权重20%（始终参与）');

    return {
      personWeight: Math.round(personWeight * 100) / 100,
      situationWeight: Math.round(situationWeight * 100) / 100,
      timingWeight,
      mentalWeight: Math.round(mentalWeight * 100) / 100,
      description: `权重分配：${descriptions.join('；')}`,
    };
  }

  /**
   * 检测各层分析之间的矛盾
   */
  private detectSystemConflicts(
    yiLi: YiLiLayer,
    jiBian: JiBianLayer,
    quXiang: QuXiangLayer,
    gongLi: GongLiLayer
  ): SystemConflict[] {
    const conflicts: SystemConflict[] = [];
    const auspiciousSet = new Set(['大吉', '吉', '小吉']);
    const dangerousPatterns = ['龙战于野', '羝羊触藩', '困于石', '虎尾', '负且乘'];

    // 冲突1：义理层吉 vs 机变层凶险格局
    if (auspiciousSet.has(yiLi.auspiciousness) && dangerousPatterns.some(p => jiBian.pattern.includes(p))) {
      conflicts.push({
        systems: ['义理层(YiLi)', '机变层(JiBian)'],
        conflictType: '吉凶矛盾',
        resolution: '以机变层变数为先，格局凶险提示表面吉象下暗藏风险，宜谨慎行事',
        warning: `义理层判断"${yiLi.auspiciousness}"，但机变层格局"${jiBian.pattern}"含凶险信号，需特别防范`,
      });
    }

    // 冲突2：阴阳严重失衡 vs 卦象
    if (gongLi.yinYang.overall !== 'balanced') {
      const imbalance = Math.abs(gongLi.yinYang.ratio[0] - gongLi.yinYang.ratio[1]);
      if (imbalance >= 4) {
        conflicts.push({
          systems: ['公理层(GongLi)', '卦象'],
          conflictType: '阴阳失衡',
          resolution: '阴阳严重偏枯，提示事物发展偏离正轨，宜回归中道',
          warning: `阴阳比例${gongLi.yinYang.ratio[0]}:${gongLi.yinYang.ratio[1]}，失衡严重，决策需格外审慎`,
        });
      }
    }

    // 冲突3：取象与义理不一致
    const dangerSymbols = ['刀', '剑', '血', '狱', '墓', '棺'];
    if (auspiciousSet.has(yiLi.auspiciousness) && dangerSymbols.some(s => quXiang.primarySymbol.includes(s))) {
      conflicts.push({
        systems: ['义理层(YiLi)', '取象层(QuXiang)'],
        conflictType: '象义矛盾',
        resolution: '取象直觉与义理推演不一致，建议结合直觉与理性双重判断',
        warning: `主象"${quXiang.primarySymbol}"含警示符号，但义理判断"${yiLi.auspiciousness}"，需综合考量`,
      });
    }

    // 冲突4：变爻过多（动变频繁）
    if (jiBian.changingLines.length >= 4) {
      conflicts.push({
        systems: ['机变层(JiBian)', '公理层(GongLi)'],
        conflictType: '变数过多',
        resolution: '动爻过多说明局势动荡，不宜做重大决策，宜等待尘埃落定',
        warning: `${jiBian.changingLines.length}爻发动，变数极多，事态高度不稳定`,
      });
    }

    return conflicts;
  }

  // ==================== 个性化建议 ====================

  /**
   * 五行 → 有利方位
   */
  private generateDirectionAdvice(gongLi: GongLiLayer): string {
    const dominant = gongLi.fiveElements.balance;
    const elementCounts = gongLi.fiveElements.counts;

    // 找出最强和最弱的五行
    const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0][0];
    const weakest = sorted[sorted.length - 1][0];

    const directionMap: Record<string, string> = {
      '木': '东方',
      '火': '南方',
      '土': '中央/本地',
      '金': '西方',
      '水': '北方',
    };

    const favorableDirection = directionMap[weakest] || '东方';
    const avoidDirection = directionMap[strongest] || '西方';

    return `五行最旺为${strongest}，最弱为${weakest}。` +
      `有利方位：${favorableDirection}（补${weakest}之不足）；` +
      `宜避方位：${avoidDirection}（${strongest}已过旺）；` +
      `整体运势${dominant}，宜向${favorableDirection}寻求平衡。`;
  }

  /**
   * 五行 → 幸运颜色
   */
  private generateColorAdvice(gongLi: GongLiLayer): string {
    const elementCounts = gongLi.fiveElements.counts;
    const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
    const weakest = sorted[sorted.length - 1][0];

    const colorMap: Record<string, { favorable: string; avoid: string }> = {
      '木': { favorable: '绿色、青色（补木）', avoid: '白色、金色（金克木）' },
      '火': { favorable: '红色、紫色（补火）', avoid: '黑色、蓝色（水克火）' },
      '土': { favorable: '黄色、棕色（补土）', avoid: '绿色、青色（木克土）' },
      '金': { favorable: '白色、银色（补金）', avoid: '红色、紫色（火克金）' },
      '水': { favorable: '黑色、蓝色（补水）', avoid: '黄色、棕色（土克水）' },
    };

    const colors = colorMap[weakest] || colorMap['木'];
    return `五行${weakest}偏弱，建议日常穿着或环境中多用${colors.favorable}，` +
      `避免使用${colors.avoid}。`;
  }

  /**
   * 基于心绪状态的心理建议
   */
  private generateMentalAdvice(context: HolisticPersonContext): string {
    if (!context.mental) {
      return '未采集心绪数据。古人云"不信者不占，不诚者不告"，' +
        '建议在心态平和、意念专注时重新卜算，以获得更准确的指引。';
    }

    const mental = context.mental;
    const advice: string[] = [];

    // 基于情绪状态
    const emotionAdvice: Record<string, string> = {
      '焦虑': '心绪焦虑时卜算易受情绪干扰，建议先做几次深呼吸，让心沉静后再参悟卦意。',
      '平静': '心绪平静是卜算的最佳状态，此时所得卦象更接近真实。',
      '愤怒': '愤怒之时不宜决策，卦象可能反映的是情绪而非事物本质。建议冷静后再做判断。',
      '悲伤': '悲伤容易蒙蔽判断，卦象中的"凶"可能更多反映心境而非现实。宜先调养心绪。',
      '兴奋': '兴奋状态下容易忽略风险信号，卦象中的"吉"需理性审视。建议三思而后行。',
    };

    const emotionLabel = typeof mental.emotionalState === 'string' 
      ? mental.emotionalState 
      : String(mental.emotionalState);
    const matchedEmotion = Object.keys(emotionAdvice).find(e => emotionLabel.includes(e));
    if (matchedEmotion) {
      advice.push(emotionAdvice[matchedEmotion]);
    }

    // 基于杂念程度
    if (mental.distraction && mental.distraction > 5) {
      advice.push(`杂念程度偏高（${mental.distraction}/10），建议在卜算前冥想片刻，减少外界干扰。`);
    }

    // 基于预兆
    if (mental.premonitions && mental.premonitions.length > 0) {
      advice.push(`近期外应（${mental.premonitions.join('、')}）可作为卦象的补充参考，与卦意互相印证。`);
    }

    return advice.length > 0
      ? advice.join(' ')
      : '心绪状态良好，卦象解读可信度较高。保持当前心态，审慎决策。';
  }

  private getDisclaimer(): string {
    // 免责声明（不可关闭）
    return `【免责声明】

卜筮本是辅助观心的工具，结果非宿命。古人卜筮不离四义：
1. 疑则筮之吉则行之凶则谋之
2. 筮不过三，三筮而中
3. 不信者不占，不诚者不告
4. 不可戏玩占

本系统所有解读均基于传统术数文献，仅供参详。决定终在人为，任何选择的责任皆归于问者自身。下手处永远在己，而非问卜。`.trim();
  }

  /**
   * 初始化AI引擎
   */
  public async initializeAI(config: AIConfig): Promise<void> {
    this.aiEngine = new HybridAIEngine(config);
    await this.aiEngine.initialize();
    this.aiEnabled = true;
  }

  /**
   * 重置引擎
   */
  public reset(): void {
    this.aiEngine = null;
    this.aiEnabled = false;
  }
}

export default SixLayerFusionEngine;
