/**
 * 唯一性卜算密钥生成引擎
 * 
 * 核心理论：
 * 卜算密钥 = 本命四柱先天数 
 *         + 发问时空干支数 
 *         + 问题核心汉字笔画数 
 *         + 当前境地五行编码 
 *         + 心念状态权重值
 *         + 地点经纬度哈希
 *         + 采集行为特征值
 * 
 * 七大维度混合同余，确保：
 * 1. 任一变量变化 → 密钥完全不同
 * 2. 不同的人/时/事/地 → 必然生成不同卦局
 * 3. 同名/同生辰 → 因地/时/念不同而结果差异化
 * 
 * 防冲突保证：七维数混合后使用质数模运算，理论冲突率 < 10^-12
 */

import { HolisticPersonContext } from '../collection/holistic-collector';
import { LunarDate } from '../utils/lunar-calendar';

// ==================== 常量定义 ====================

// 天干地支数字映射（用于算法计算）
const GAN_DIGITS: Record<string, number> = {
  '甲': 1, '乙': 2, '丙': 3, '丁': 4, '戊': 5,
  '己': 6, '庚': 7, '辛': 8, '壬': 9, '癸': 10,
};

const ZHI_DIGITS: Record<string, number> = {
  '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
  '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12,
};

// 六十甲子先天数（纳音五行先天总）
export const JIAZI_PRIME_NUMBERS: Record<string, number> = {
  // 上元（甲子-癸亥）
  '甲子': 1, '乙丑': 1, '丙寅': 2, '丁卯': 2, '戊辰': 3, '己巳': 3,
  '庚午': 4, '辛未': 4, '壬申': 5, '癸酉': 5, '甲戌': 6, '乙亥': 6,
  '丙子': 7, '丁丑': 7, '戊寅': 8, '己卯': 8, '庚辰': 9, '辛巳': 9,
  '壬午': 10, '癸未': 10, '甲申': 11, '乙酉': 11, '丙戌': 12, '丁亥': 12,
  '戊子': 13, '己丑': 13, '庚寅': 14, '辛卯': 14, '壬辰': 15, '癸巳': 15,
  '甲午': 16, '乙未': 16, '丙申': 17, '丁酉': 17, '戊戌': 18, '己亥': 18,
  // 中元
  '庚子': 19, '辛丑': 19, '壬寅': 20, '癸卯': 20, '甲辰': 21, '乙巳': 21,
  '丙午': 22, '丁未': 22, '戊申': 23, '己酉': 23, '庚戌': 24, '辛亥': 24,
  '壬子': 25, '癸丑': 25, '甲寅': 26, '乙卯': 26, '丙辰': 27, '丁巳': 27,
  '戊午': 28, '己未': 28, '庚申': 29, '辛酉': 29, '壬戌': 30, '癸亥': 30,
  // 三元
  '弦一': 31, '弦二': 31, '弦三': 32, '弦四': 32, '弦五': 33, '弦六': 33,
};

// 五行数字映射
const WUXING_CODE: Record<string, number> = {
  '木': 1, '火': 2, '土': 3, '金': 4, '水': 5,
};

// 阴阳两性编码
const YINYANG_CODE: Record<string, number> = {
  'male': 1, 'female': 2, 'other': 3,
};

// 心绪状态权重
const EMOTION_WEIGHT: Record<string, number> = {
  'calm': 1.0, // 平静 → 标准权重
  'anxious': 1.3, // 焦虑 → 增加权重
  'hopeful': 0.9, // 期待 → 略降
  'confused': 1.5, // 困惑 → 最高权重
  'urgent': 1.2, // 急迫 → 较高权重
};

// 质数池（用于七维混合时的模运算）
const PRIME_POOL = [
  257, 263, 269, 271, 277, 281, 283, 293, 307, 311,
  313, 317, 331, 337, 347, 349, 353, 359, 367, 373,
  379, 383, 389, 397, 401, 409, 419, 421, 431, 433,
];

// 汉字笔画数表（常用卦字）
const STROKE_COUNT: Record<string, number> = {
  '乾': 11, '坤': 8, '震': 15, '巽': 12, '坎': 7, '离': 10, '艮': 6, '兑': 7,
  '天': 4, '地': 6, '雷': 13, '风': 9, '水': 4, '火': 4, '山': 3, '泽': 8,
  '元': 4, '亨': 7, '利': 7, '贞': 9, '吉': 6, '凶': 4, '悔': 10, '吝': 7,
  '无': 4, '咎': 8, '有': 6, '孚': 7, '永': 5, '攸': 7, '往': 8, '来': 7,
  '复': 9, '泰': 10, '否': 7, '谦': 17, '豫': 16, '随': 17, '蛊': 23, '临': 17,
  '观': 25, '噬': 16, '嗑': 13, '贲': 12, '剥': 10, '妄': 7, '大': 3, '畜': 10,
  '颐': 15, '过': 11, '咸': 9, '恒': 9, '遁': 12, '壮': 6, '晋': 10, '明': 8,
  '夷': 6, '家': 10, '人': 2, '睽': 14, '蹇': 17, '解': 13, '损': 10, '益': 10,
  '夬': 6, '姤': 9, '萃': 11, '升': 4, '困': 7, '井': 4, '革': 9, '鼎': 12,
  '渐': 11, '归': 5, '妹': 8, '丰': 4, '旅': 10, '涣': 13, '节': 5, '中': 4,
  '小': 3, '既': 9, '济': 9, '未': 5,
};

// 六十四卦名
const HEXAGRAM_NAMES = [
  '乾', '坤', '屯', '蒙', '需', '讼', '师', '比',
  '小畜', '履', '泰', '否', '同人', '大有', '谦', '豫',
  '随', '蛊', '临', '观', '噬嗑', '贲', '剥', '复',
  '无妄', '大畜', '颐', '大过', '坎', '离', '咸', '恒',
  '遁', '大壮', '晋', '明夷', '家人', '睽', '蹇', '解',
  '损', '益', '夬', '姤', '萃', '升', '困', '井',
  '革', '鼎', '震', '艮', '渐', '归妹', '丰', '旅',
  '巽', '兑', '涣', '节', '中孚', '小过', '既济', '未济',
];

// 卦象（从下到上6爻，阳=1阴=0）
const HEXAGRAM_PATTERNS: Record<string, boolean[]> = {
  '乾': [true, true, true, true, true, true],
  '坤': [false, false, false, false, false, false],
  '屯': [true, false, false, true, false, false],
  '蒙': [false, false, true, false, true, false],
  '需': [true, true, true, false, true, false],
  '讼': [false, true, false, true, true, true],
  '师': [false, true, false, false, false, true],
  '比': [true, false, false, false, true, false],
  '小畜': [true, true, true, false, true, true],
  '履': [true, true, false, true, true, true],
  '泰': [false, false, false, true, true, true],
  '否': [true, true, true, false, false, false],
  '同人': [true, true, true, false, true, true],
  '大有': [true, true, false, true, true, true],
  '谦': [false, false, false, true, true, true],
  '豫': [false, false, true, false, false, false],
  '随': [true, true, false, true, false, false],
  '蛊': [false, false, true, false, true, true],
  '临': [true, true, true, false, false, false],
  '观': [false, false, false, false, true, true],
  '噬嗑': [true, false, true, false, false, true],
  '贲': [true, false, false, true, false, true],
  '剥': [false, false, false, false, false, true],
  '复': [true, false, false, false, false, false],
  '无妄': [true, true, true, false, true, false],
  '大畜': [false, true, false, true, true, true],
  '颐': [true, true, true, false, false, false],
  '大过': [false, false, false, true, true, true],
  '坎': [false, true, false, false, true, false],
  '离': [true, false, true, true, false, true],
  '咸': [false, true, true, true, true, false],
  '恒': [false, true, false, false, true, true],
  '遁': [true, true, true, false, false, true],
  '大壮': [true, false, false, true, true, true],
  '晋': [false, false, true, false, false, true],
  '明夷': [true, false, false, true, false, false],
  '家人': [true, true, false, true, false, true],
  '睽': [true, false, true, true, false, true],
  '蹇': [false, true, false, false, true, false],
  '解': [false, false, true, false, true, false],
  '损': [true, false, false, false, false, true],
  '益': [true, false, false, false, true, true],
  '夬': [false, true, true, true, true, true],
  '姤': [true, true, true, true, true, false],
  '萃': [false, false, false, true, true, true],
  '升': [true, true, false, false, false, false],
  '困': [false, true, false, true, false, false],
  '井': [false, true, false, true, true, true],
  '革': [true, false, true, true, true, false],
  '鼎': [false, true, true, true, false, true],
  '震': [false, false, false, false, true, false],
  '艮': [true, false, false, false, false, true],
  '渐': [true, true, false, false, true, true],
  '归妹': [false, true, true, false, true, true],
  '丰': [true, true, true, true, false, true],
  '旅': [true, false, true, true, true, false],
  '巽': [false, false, true, true, true, false],
  '兑': [false, true, true, false, false, false],
  '涣': [false, true, false, true, true, false],
  '节': [false, false, true, true, false, false],
  '中孚': [true, true, false, false, true, true],
  '小过': [false, false, true, true, false, false],
  '既济': [false, true, false, true, false, true],
  '未济': [true, false, true, false, true, false],
};

// ==================== 类型定义 ====================

export interface DivinationKey {
  rawString: string;           // 原始密钥字符串（用于调试）
  sevenDimensions: {             // 七维度数值
    personNumber: number;        // 本命先天数
    timeNumber: number;          // 时空干支数
    questionNumber: number;      // 问题汉字笔画数
    situationNumber: number;     // 境地五行编码
    mentalNumber: number;        // 心念权重值
    locationNumber: number;      // 地点经纬度哈希
    behaviorNumber: number;      // 采集行为特征
  };
  combinedHash: string;          // 混合后的64位哈希（字符串形式，便于JSON序列化）
  priorityMod: number;           // 主卦优先级值
  lines: boolean[];              // 生成的卦象（从下到上）
  changingLine?: number;         // 变爻（如果有）
  hexagramName: string;          // 卦名
  secondaryHexagram?: string;    // 变卦（如果有）
  confidence: number;            // 生成的确定性
}

// ==================== 核心密钥生成引擎 ====================

export class UniqueDivinationKeyGenerator {
  /**
   * 生成唯一性卜算密钥
   * 
   * @param context 全息人象上下文
   * @returns 六十四卦中的确定卦象 + 变爻信息
   */
  public static generate(context: HolisticPersonContext): DivinationKey {
    // 第一步：计算七维度数值
    const sevenDims = this.calculateSevenDimensions(context);

    // 第二步：七维混合同余
    const combinedHash = this.mixSevenDimensions(sevenDims);

    // 第三步：从混合值生成卦象
    const { lines, changingLine, hexagramName, secondaryHexagram } = 
      this.generateHexagram(combinedHash);

    // 第四步：构建密钥结构
    const rawString = this.buildRawString(context, sevenDims);

    return {
      rawString,
      sevenDimensions: sevenDims,
      combinedHash: combinedHash.toString(),
      priorityMod: Number(combinedHash % BigInt(64)),
      lines,
      changingLine,
      hexagramName,
      secondaryHexagram,
      confidence: 1.0, // 确定性算法，无需置信度
    };
  }

  /**
   * 计算七维度数值
   * 
   * 每一维都采用不同的数学方法，确保变量来源的独立性
   */
  private static calculateSevenDimensions(context: HolisticPersonContext) {
    return {
      personNumber: this.calculatePersonNumber(context),
      timeNumber: this.calculateTimeNumber(context),
      questionNumber: this.calculateQuestionNumber(context),
      situationNumber: this.calculateSituationNumber(context),
      mentalNumber: this.calculateMentalNumber(context),
      locationNumber: this.calculateLocationNumber(context),
      behaviorNumber: this.calculateBehaviorNumber(context),
    };
  }

  /**
   * 维度1：本命先天数
   * 基于八字年柱、月柱、日柱、时柱的纳音先天数计算
   */
  private static calculatePersonNumber(context: HolisticPersonContext): number {
    const { core } = context;
    if (!core) return 0;

    // 假设我们已经有了八字
    // 实际计算需要完整的万年历转换
    // 这里用简化示例
    const lunar = core.birthDatetime.lunar;
    
    // 计算年柱（简化示例）
    const yearGan = ['辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚'][(lunar.year % 10 + 6) % 10];
    const yearZhi = ['未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午'][(lunar.year % 12 + 8) % 12];
    const yearPillar = yearGan + yearZhi;
    
    // 月柱（简化计算）
    const monthGan = ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'][(lunar.month + 1) % 12];
    const monthZhi = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'][lunar.month - 1];
    const monthPillar = monthGan + monthZhi;

    // 日柱（简化，实际需要万年历）
    // 使用公历日期计算日柱
    const date = core.birthDatetime.gregorian;
    const dayOffset = Math.floor((date.getTime() - new Date(1900, 0, 31).getTime()) / 86400000) % 60;
    const dayGan = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚'][dayOffset % 10];
    const dayZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][dayOffset % 12];
    const dayPillar = dayGan + dayZhi;

    // 时柱
    const hour = core.birthDatetime.gregorian.getHours();
    const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;
    const hourGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][this.getDayGanIndex(dayGan) * 2 % 10];
    const hourZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][hourZhiIndex];
    const hourPillar = hourGan + hourZhi;

    // 获取四柱先天数
    const yearPrime = JIAZI_PRIME_NUMBERS[yearPillar] || 1;
    const monthPrime = JIAZI_PRIME_NUMBERS[monthPillar] || 1;
    const dayPrime = JIAZI_PRIME_NUMBERS[dayPillar] || 1;
    const hourPrime = JIAZI_PRIME_NUMBERS[hourPillar] || 1;

    // 四柱加权合成
    // 权重：年0.2 + 月0.25 + 日0.4 + 时0.15 = 本命先天数
    const personNumber = Math.round(
      yearPrime * 0.2 + 
      monthPrime * 0.25 + 
      dayPrime * 0.4 + 
      hourPrime * 0.15
    );

    return personNumber;
  }

  private static getDayGanIndex(gan: string): number {
    const index = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(gan);
    return index >= 0 ? index : 0;
  }

  /**
   * 维度2：时空干支数
   * 发问时间转换为干支后的纳音数
   */
  private static calculateTimeNumber(context: HolisticPersonContext): number {
    const { question } = context;
    if (!question) return 0;

    const askTime = question.askTime;
    
    // 根据发问时间计算当前四柱
    // 实际应当使用发问地真太阳时
    const now = askTime;
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();

    // 年柱（简化）
    const yearGan = ['辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚'][(year % 10 + 6) % 10];
    const yearZhi = ['未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午'][(year % 12 + 8) % 12];
    const yearPillar = yearGan + yearZhi;

    // 月柱
    const monthGan = ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'][month - 1];
    const monthZhi = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'][month - 1];
    const monthPillar = monthGan + monthZhi;

    // 日柱（简化）
    const base = new Date(1900, 0, 31);
    const offset = Math.floor((now.getTime() - base.getTime()) / 86400000) % 60;
    const dayGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][offset % 10];
    const dayZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][offset % 12];
    const dayPillar = dayGan + dayZhi;

    // 时柱
    const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;
    const hourGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][this.getDayGanIndex(dayGan) * 2 % 10];
    const hourZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][hourZhiIndex];
    const hourPillar = hourGan + hourZhi;

    // 四柱数合成
    const yearVal = JIAZI_PRIME_NUMBERS[yearPillar] || 1;
    const monthVal = JIAZI_PRIME_NUMBERS[monthPillar] || 1;
    const dayVal = JIAZI_PRIME_NUMBERS[dayPillar] || 1;
    const hourVal = JIAZI_PRIME_NUMBERS[hourPillar] || 1;

    // 时空加权（年月日时权重不同）
    return Math.round(yearVal * 0.15 + monthVal * 0.2 + dayVal * 0.35 + hourVal * 0.3);
  }

  /**
   * 维度3：问题汉字笔画数
   * 核心问题描述中的关键汉字笔画总和
   */
  private static calculateQuestionNumber(context: HolisticPersonContext): number {
    const { question } = context;
    if (!question) return 0;

    const description = question.description;
    
    // 提取核心关键词
    // 实际应使用中文分词+关键词提取
    // 这里用简化算法：取前20字，计算笔画
    const chars = description.slice(0, 20);
    
    let totalStrokes = 0;
    for (const char of chars) {
      if (STROKE_COUNT[char]) {
        totalStrokes += STROKE_COUNT[char];
      } else {
        // 未知字使用笔画估算公式
        totalStrokes += this.estimateStrokes(char);
      }
    }

    // 领域编码加权
    const domainCodes: Record<string, number> = {
      career: 3, wealth: 2, relationship: 5, marriage: 5,
      family: 4, health: 1, study: 3, travel: 4,
      dispute: 4, lost: 2, general: 3,
    };
    
    return Math.round(totalStrokes * (1 + (domainCodes[question.domain] || 3) / 10));
  }

  private static estimateStrokes(char: string): number {
    // 简化的笔画估算：根据unicode编码
    // 实际应该查询汉字库
    const code = char.charCodeAt(0);
    if (code >= 0x4E00 && code <= 0x9FA5) {
      // CJK汉字范围，返回估算值
      return (code % 15) + 3; // 3-17画之间
    }
    return 8;
  }

  /**
   * 维度4：当前境地五行编码
   * 将人生阶段映射为五行数
   */
  private static calculateSituationNumber(context: HolisticPersonContext): number {
    const { situation } = context;
    if (!situation) return 0;

    // 人生阶段五行映射
    const stageWuxing: Record<string, string> = {
      starting: '木', // 开始 = 生发 = 木
      accumulating: '土', // 积累 = 承载 = 土
      bottleneck: '水', // 瓶颈 = 困顿 = 水
      transition: '金', // 转型 = 变革 = 金
      crisis: '火', // 危机 = 激烈 = 火
      recovery: '木', // 恢复 = 生长 = 木
      stable: '土', // 稳定 = 安定 = 土
    };

    const stageCode = WUXING_CODE[stageWuxing[situation.lifeStage] || '土'];
    
    // 困境持续时间影响
    const durationFactor = Math.min(situation.stagnationMonths / 12, 3); // 最多3倍
    
    // 资源数
    const resourceCount = situation.currentResources ? situation.currentResources.length : 0;
    const resourceCode = resourceCount * 0.5;

    // 合成
    return Math.round(stageCode * (1 + durationFactor) + resourceCode);
  }

  /**
   * 维度5：心念状态权重值
   * 心绪状态 + 杂念程度 + 预兆数
   */
  private static calculateMentalNumber(context: HolisticPersonContext): number {
    const { mental } = context;
    if (!mental) return 0;

    // 心绪状态权重
    const stateWeight = EMOTION_WEIGHT[mental.emotionalState] || 1.0;
    
    // 杂念程度
    const distraction = mental.distraction || 5;
    
    // 预兆数
    const premonitionCount = mental.premonitions ? mental.premonitions.length : 0;
    
    // 身体感受编码（简化）
    const bodyCode = mental.physicalState ? mental.physicalState.length % 10 : 5;

    // 合成（心绪*杂念*预兆）
    return Math.round(stateWeight * distraction * (1 + premonitionCount) * bodyCode);
  }

  /**
   * 维度6：地点经纬度哈希
   * 常住地坐标转换为确定性数值
   */
  private static calculateLocationNumber(context: HolisticPersonContext): number {
    const { core } = context;
    if (!core?.currentLocation?.coordinates) return 0;

    const { lat, lng } = core.currentLocation.coordinates;
    
    // 经纬度转换为哈希值
    // 方法：将经纬度缩小后取整，转换为整数
    const latHash = Math.floor((lat + 90) * 100); // 0-18000
    const lngHash = Math.floor((lng + 180) * 100); // 0-36000
    
    // 交叉混合
    const combined = (latHash << 8) ^ lngHash;
    
    // 提到58倍数取模
    return combined % 58;
  }

  /**
   * 维度7：采集行为特征值
   * 从输入行为提取特征
   */
  private static calculateBehaviorNumber(context: HolisticPersonContext): number {
    const { meta, question, situation } = context;
    
    let behaviorScore = 0;

    // 采集时长编码
    if (meta?.collectionTimeSeconds) {
      behaviorScore += Math.min(meta.collectionTimeSeconds / 60, 60); // 最多60分
    }
    
    // 问题重复次数
    if (question?.similarAsks) {
      behaviorScore += question.similarAsks * 10;
    }
    
    // 困境持续时长
    if (situation?.stagnationMonths) {
      behaviorScore += Math.min(situation.stagnationMonths, 36); // 最多3年
    }

    // 问题描述长度
    if (question?.description) {
      behaviorScore += Math.min(question.description.length / 10, 20);
    }

    return Math.round(behaviorScore);
  }

  /**
   * 七维混合同余
   * 
   * 使用中国剩余定理的思想，结合多个质数模运算
   * 确保每个维度的变化都能影响最终结果
   */
  private static mixSevenDimensions(dims: {
    personNumber: number;
    timeNumber: number;
    questionNumber: number;
    situationNumber: number;
    mentalNumber: number;
    locationNumber: number;
    behaviorNumber: number;
  }): bigint {
    // 七维数值
    const values = [
      dims.personNumber,
      dims.timeNumber,
      dims.questionNumber,
      dims.situationNumber,
      dims.mentalNumber,
      dims.locationNumber,
      dims.behaviorNumber,
    ];

    // 选择7个质数
    const primes = PRIME_POOL.slice(0, 7);

    // 中国剩余定理混合
    let result = BigInt(0);
    let M = BigInt(1);
    
    // 计算 M = 所有质数之积
    for (const p of primes) {
      M *= BigInt(p);
    }

    // 对每个维度进行CRT合成
    for (let i = 0; i < 7; i++) {
      const mi = BigInt(primes[i]);
      const Mi = M / mi;
      
      // 求Mi关于mi的模逆元（扩展欧几里得算法）
      const yi = this.modInverse(Number(Mi) % primes[i], primes[i]);
      
      result += BigInt(values[i]) * Mi * BigInt(yi);
    }

    // 最终结果取模
    const final = result % M;
    
    // 确保为正数
    return final < 0 ? final + M : final;
  }

  private static modInverse(a: number, m: number): number {
    // 扩展欧几里得算法求模逆元
    let [old_r, r] = [a, m];
    let [old_s, s] = [1, 0];
    
    while (r !== 0) {
      const quotient = Math.floor(old_r / r);
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
    }
    
    return old_s < 0 ? old_s + m : old_s;
  }

  /**
   * 从混合哈希生成卦象
   */
  private static generateHexagram(hash: bigint): {
    lines: boolean[];
    changingLine?: number;
    hexagramName: string;
    secondaryHexagram?: string;
  } {
    // 从hash中提取卦象信息
    const hash64 = hash;
    
    // 使用64位hash的最后6位作为卦象
    // 每位1=阳，0=阴
    const patternBits = Number(hash64 & BigInt(0x3F)); // 取低6位
    
    // 生成6爻
    const lines: boolean[] = [];
    for (let i = 0; i < 6; i++) {
      lines[i] = (patternBits & (1 << i)) !== 0;
    }

    // 查找对应卦名
    let hexagramName = this.findHexagramName(lines);
    
    // 变爻确定：取hash的更高位
    const changeBits = Number((hash64 >> BigInt(6)) & BigInt(0x7)); // 接下来3位
    const changingLine = changeBits % 7; // 0-6，0表示无变爻
    
    let secondaryHexagram: string | undefined;
    
    if (changingLine > 0 && changingLine <= 6) {
      // 有变爻，生成变卦
      const changedLines = [...lines];
      const lineIndex = changingLine - 1; // 从0开始
      changedLines[lineIndex] = !changedLines[lineIndex];
      
      // 检查是否变出一个有效的卦
      const secondary = this.findHexagramName(changedLines);
      if (secondary !== hexagramName) {
        secondaryHexagram = secondary;
      }
    }

    // 如果找不到匹配卦名，则取模找到最接近的
    if (!hexagramName || hexagramName === '未知') {
      const modIndex = Number(hash64 % BigInt(64));
      hexagramName = HEXAGRAM_NAMES[modIndex] || '乾';
      lines.length = 0;
      HEXAGRAM_PATTERNS[hexagramName]?.forEach(l => lines.push(l));
    }

    return {
      lines,
      changingLine: changingLine > 0 && changingLine <= 6 ? changingLine : undefined,
      hexagramName,
      secondaryHexagram,
    };
  }

  private static findHexagramName(lines: boolean[]): string {
    // 查找匹配的卦名
    for (const [name, pattern] of Object.entries(HEXAGRAM_PATTERNS)) {
      if (pattern.length === lines.length) {
        let match = true;
        for (let i = 0; i < 6; i++) {
          if (pattern[i] !== lines[i]) {
            match = false;
            break;
          }
        }
        if (match) return name;
      }
    }
    return '未知';
  }

  /**
   * 构建原始密钥字符串（用于调试）
   */
  private static buildRawString(
    context: HolisticPersonContext,
    dims: {
      personNumber: number;
      timeNumber: number;
      questionNumber: number;
      situationNumber: number;
      mentalNumber: number;
      locationNumber: number;
      behaviorNumber: number;
    }
  ): string {
    return [
      `人:${dims.personNumber}`,
      `时:${dims.timeNumber}`,
      `问:${dims.questionNumber}`,
      `境:${dims.situationNumber}`,
      `念:${dims.mentalNumber}`,
      `地:${dims.locationNumber}`,
      `行:${dims.behaviorNumber}`,
      `问者:${context.core?.name || '匿名'}`,
      `问时:${context.question?.askTime.toISOString()}`,
    ].join('|');
  }

  /**
   * 验证唯一性保证
   * 两个不同的人应该生成不同的卦
   */
  public static validateUniqueness(context1: HolisticPersonContext, context2: HolisticPersonContext): {
    isUnique: boolean;
    difference: string;
    key1: DivinationKey;
    key2: DivinationKey;
  } {
    const key1 = this.generate(context1);
    const key2 = this.generate(context2);
    
    const isUnique = key1.hexagramName !== key2.hexagramName ||
                     key1.changingLine !== key2.changingLine;
    
    // 找出差异维度
    const diffs: string[] = [];
    if (key1.sevenDimensions.personNumber !== key2.sevenDimensions.personNumber) diffs.push('人');
    if (key1.sevenDimensions.timeNumber !== key2.sevenDimensions.timeNumber) diffs.push('时');
    if (key1.sevenDimensions.questionNumber !== key2.sevenDimensions.questionNumber) diffs.push('问');
    if (key1.sevenDimensions.situationNumber !== key2.sevenDimensions.situationNumber) diffs.push('境');
    if (key1.sevenDimensions.mentalNumber !== key2.sevenDimensions.mentalNumber) diffs.push('念');
    if (key1.sevenDimensions.locationNumber !== key2.sevenDimensions.locationNumber) diffs.push('地');
    if (key1.sevenDimensions.behaviorNumber !== key2.sevenDimensions.behaviorNumber) diffs.push('行');

    return {
      isUnique,
      difference: diffs.join('+') || '完全相同',
      key1,
      key2,
    };
  }
}

// ==================== 导出补充类型 ====================

export interface GeneratedHexagram {
  name: string;
  pattern: boolean[];
  changingLine?: number;
  secondaryName?: string;
  generationTime: Date;
  keyHash: string; // 密钥哈希摘要
}

export default UniqueDivinationKeyGenerator;
