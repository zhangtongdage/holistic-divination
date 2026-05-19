/**
 * 全息人本信息采集模块
 * 
 * 设计理念：
 * "先立人，后立卦" - 人象是绝对核心，没有完整人象不生成卦局
 * 
 * 分层采集：
 * 1. 必填核心 → 2. 可选补充
 * 每一层都增加信息维度，但绝不增加负担感
 */

import { LunarDate } from '../utils/lunar-calendar';

// ==================== 类型定义 ====================

export enum CollectionPhase {
  CORE_PERSON = 'core_person',      // 基础人象（必填）
  CORE_QUESTION = 'core_question',  // 核心问事（必填）
  CORE_SITUATION = 'core_situation', // 当前境地（必填）
  OPT_MENTAL = 'opt_mental',        // 发问状态（可选）
  OPT_PERSON = 'opt_person',        // 补充人象（可选）
  OPT_EXPECTATION = 'opt_expectation', // 主观预期（可选）
}

export enum CollectionUrgency {
  REQUIRED = 'required',
  RECOMMENDED = 'recommended',
  OPTIONAL = 'optional',
}

export interface CollectionField<T = unknown> {
  key: string;
  label: string;
  description: string;
  urgency: CollectionUrgency;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'datetime' | 'location' | 'textarea' | 'hidden';
  options?: { value: string; label: string; description?: string }[];
  validation?: ValidationRule[];
  defaultValue?: T;
  placeholder?: string;
  helpText?: string;
  autoFill?: () => T | Promise<T>;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean | Promise<boolean>;
}

export interface CollectionSection {
  phase: CollectionPhase;
  title: string;
  subtitle: string;
  description: string;
  fields: CollectionField[];
  estimatedTime: number; // 估计完成时间（秒）
  skipable: boolean;
  skipReason?: string;
}

export interface CollectionProgress {
  currentPhase: CollectionPhase;
  completedPhases: CollectionPhase[];
  skippedPhases: CollectionPhase[];
  completionRate: number; // 0-1
  isCoreComplete: boolean;
  canGenerate: boolean;
}

// ==================== 全息人象模型 ====================

export interface HolisticPersonContext {
  // === 必填核心 ===
  
  // 基础人象
  core: {
    name: string;              // 姓名（可以是化名）
    birthDatetime: {           // 出生时间
      gregorian: Date;         // 公历
      lunar: LunarDate;        // 农历（自动转换）
      timezone: string;        // 时区
      isExact: boolean;        // 是否为精确时间
      isDaylightSaving: boolean; // 是否夏令时
    };
    gender: 'male' | 'female' | 'other';
    currentLocation: {         // 常住地
      province: string;
      city: string;
      coordinates?: { lat: number; lng: number };
    };
    residenceDuration: number; // 在常住地居住年数
  };
  
  // 核心问事
  question: {
    domain: QuestionDomain;    // 问题领域
    description: string;     // 具体问题描述
    urgency: 'urgent' | 'normal' | 'planning'; // 急迫程度
    askTime: Date;           // 发问时间
    similarAsks: number;     // 此问题重复问卦次数
    // TODO: 此字段在接口中定义但从未在表单中收集，需实现收集或删除
    previousAttempts?: string[]; // 之前尝试的解决方法
  };
  
  // 当前境地
  situation: {
    lifeStage: LifeStage;      // 所处人生阶段
    coreDilemma: string;       // 核心困境/诉求
    stagnationMonths: number;  // 此困境持续月数
    currentResources: string[]; // 可用资源（人脉/资金/知识等）
    majorChanges: boolean;    // 近期是否有重大变化
    changeDetails?: string;     // 变化详情
  };

  // === 可选补充 ===
  
  // 发问状态
  mental?: {
    emotionalState: EmotionalState; // 心绪状态
    premonitions: string[];      // 近期预兆/外应
    physicalState: string;       // 身体感受
    distraction: number;         // 杂念程度（0-10）
    // TODO: 此字段需程序自动捕获（非用户输入），当前未实现
    typingPattern?: {            // 输入行为分析
      avgPauseMs: number;        // 平均停顿时长
      corrections: number;       // 修改次数
    };
  };
  
  // 补充人象
  supplementary?: {
    // TODO: 此字段在接口中定义但从未在表单中收集，需实现收集或删除
    faceHandFeatures?: string;   // 面相手相特征
    keyLifeEvents?: LifeEvent[]; // 过往关键节点
    relatedPersons?: PersonReference[]; // 相关人物
    occupation?: string;         // 职业
    financialStatus?: 'poor' | 'average' | 'comfortable' | 'wealthy';
  };
  
  // 主观预期
  expectation?: {
    desiredOutcome: string;      // 期望结果
    minimalAcceptable: string;   // 可接受最低结果
    actionPlan?: string;         // 打算采取的行动
    riskTolerance: 'low' | 'medium' | 'high'; // 风险承受度
    timeHorizon: 'short' | 'medium' | 'long'; // 期望周期
  };

  // 元数据
  meta: {
    startTime: Date;
    lastUpdated: Date;
    collectionTimeSeconds: number;
    dataSource: ('manual' | 'auto' | 'inferred')[];
    version: string;
  };
}

// 枚举类型
export type QuestionDomain = 
  | 'career'        // 事业
  | 'wealth'        // 财运
  | 'relationship'  // 情感
  | 'marriage'      // 婚姻
  | 'health'        // 健康
  | 'study'         // 学业
  | 'family'        // 家庭
  | 'travel'        // 远行
  | 'dispute'       // 争讼
  | 'lost'          // 失物
  | 'general';      // 其他

export type LifeStage =
  | 'starting'      // 起步期
  | 'accumulating'  // 积累期  
  | 'bottleneck'    // 瓶颈期
  | 'transition'    // 转型期
  | 'crisis'        // 危机期
  | 'recovery'      // 恢复期
  | 'stable';       // 稳定期

export type EmotionalState =
  | 'calm'          // 平静
  | 'anxious'       // 焦虑
  | 'hopeful'       // 期待
  | 'confused'      // 困惑
  | 'urgent';       // 急迫

export interface LifeEvent {
  year: number;
  event: string;
  impact: 'positive' | 'negative' | 'neutral';
  isTurningPoint: boolean;
}

export interface PersonReference {
  relation: string;   // 关系
  name?: string;    // 名字
  birthYear?: number; // 出生年（可选）
  relevance: string; // 与当前问题的相关性
}

// ==================== 采集配置 ====================

export const COLLECTION_SCHEMA: CollectionSection[] = [
  {
    phase: CollectionPhase.CORE_PERSON,
    title: '基础人象',
    subtitle: '千人千面的起点',
    description: '您的出生时间是生成个性化卦局的第一重基石',
    estimatedTime: 60,
    skipable: false,
    fields: [
      {
        key: 'name',
        label: '姓名',
        description: '请输入您的姓名，可用化名',
        urgency: CollectionUrgency.REQUIRED,
        type: 'text',
        placeholder: '真实姓名或化名均可',
        validation: [{ type: 'required', message: '姓名不能为空' }],
      },
      {
        key: 'gender',
        label: '性别',
        description: '用于八字解读',
        urgency: CollectionUrgency.REQUIRED,
        type: 'select',
        options: [
          { value: 'male', label: '男' },
          { value: 'female', label: '女' },
          { value: 'other', label: '其他' },
        ],
        validation: [{ type: 'required', message: '请选择性别' }],
      },
      {
        key: 'birthDate',
        label: '出生年月日',
        description: '以公历为准，系统自动换算为农历',
        urgency: CollectionUrgency.REQUIRED,
        type: 'text',
        placeholder: '请选择日期（点击右侧日历图标）',
        validation: [
          { type: 'required', message: '出生日期不能为空' },
        ],
      },
      {
        key: 'birthDateCalendar',
        label: '',
        description: '',
        urgency: CollectionUrgency.REQUIRED,
        type: 'datetime',
      },
      {
        key: 'birthHour',
        label: '出生时辰',
        description: '上午、中午、下午、晚上等，精确到小时',
        urgency: CollectionUrgency.REQUIRED,
        type: 'select',
        options: [
          { value: '23-01', label: '子时', description: '23:00-01:00' },
          { value: '01-03', label: '丑时', description: '01:00-03:00' },
          { value: '03-05', label: '寅时', description: '03:00-05:00' },
          { value: '05-07', label: '卯时', description: '05:00-07:00' },
          { value: '07-09', label: '辰时', description: '07:00-09:00' },
          { value: '09-11', label: '巳时', description: '09:00-11:00' },
          { value: '11-13', label: '午时', description: '11:00-13:00' },
          { value: '13-15', label: '未时', description: '13:00-15:00' },
          { value: '15-17', label: '申时', description: '15:00-17:00' },
          { value: '17-19', label: '酉时', description: '17:00-19:00' },
          { value: '19-21', label: '戌时', description: '19:00-21:00' },
          { value: '21-23', label: '亥时', description: '21:00-23:00' },
        ],
        validation: [{ type: 'required', message: '请选择出生时辰' }],
      },
      {
        key: 'birthPlace',
        label: '出生地点',
        description: '用于确定真太阳时，影响时辰精确度。越精确越好（精确到村镇级别可修正真太阳时偏差）',
        urgency: CollectionUrgency.RECOMMENDED,
        type: 'text',
        placeholder: '例如：安徽省合肥市肥东县梁园镇',
        validation: [{ type: 'required', message: '请选择出生地点' }],
        helpText: '精确到省/市/县/镇/村，会影响时辰计算和五行方位',
      },
      {
        key: 'currentLocation',
        label: '常住地',
        description: '您目前长期居住的地方，精确到区/县级别',
        urgency: CollectionUrgency.REQUIRED,
        type: 'text',
        placeholder: '例如：浙江省杭州市西湖区',
        validation: [{ type: 'required', message: '请选择常住地' }],
        helpText: '用于判断地利方位，影响卦象取象',
      },
      {
        key: 'residenceYears',
        label: '在此居住年数',
        description: '在此居住的年数',
        urgency: CollectionUrgency.RECOMMENDED,
        type: 'number',
        placeholder: '数字即可',
      },
    ],
  },
  {
    phase: CollectionPhase.CORE_QUESTION,
    title: '核心问事',
    subtitle: '明确了问题，才能得到答案',
    description: '卜筮之端，在于问心。请深思熟虑后再提问',
    estimatedTime: 45,
    skipable: false,
    fields: [
      {
        key: 'domain',
        label: '问题领域',
        description: '选择最符合您当前问题的领域',
        urgency: CollectionUrgency.REQUIRED,
        type: 'select',
        options: [
          { value: 'career', label: '事业', description: '工作、创业、跳槽、升职等' },
          { value: 'wealth', label: '财运', description: '投资、理财、债务、收入等' },
          { value: 'relationship', label: '情感', description: '恋爱、分手、复合、追求者等' },
          { value: 'family', label: '家庭', description: '父母、子女、兄弟姐妹等' },
          { value: 'health', label: '健康', description: '疾病、康复、养生等' },
          { value: 'study', label: '学业', description: '考试、升学、留学等' },
          { value: 'travel', label: '远行', description: '出行、搬家、异地发展等' },
          { value: 'dispute', label: '争讼', description: '官司、纠纷、矛盾调解等' },
          { value: 'lost', label: '失物', description: '寻找丢失物品、人或机会' },
          { value: 'general', label: '其他', description: '不便归类的问题' },
        ],
        validation: [{ type: 'required', message: '请选择问题领域' }],
      },
      {
        key: 'description',
        label: '问题描述',
        description: '请详细描述您想问的问题',
        urgency: CollectionUrgency.REQUIRED,
        type: 'textarea',
        placeholder: '例如：最近在考虑换工作，有几个offer，想了解哪个更适合我的发展...',
        validation: [
          { type: 'required', message: '问题描述不能为空' },
          { type: 'min', value: 10, message: '描述过短，请至少10个字' },
        ],
      },
      {
        key: 'urgency',
        label: '急迫程度',
        description: '这事情需要多快决定？',
        urgency: CollectionUrgency.RECOMMENDED,
        type: 'select',
        options: [
          { value: 'urgent', label: '紧急', description: '本周内必须决定' },
          { value: 'normal', label: '正常', description: '本月内需要决定' },
          { value: 'planning', label: '规划', description: '长期规划，不急于这一时' },
        ],
        defaultValue: 'normal',
      },
      {
        key: 'similarAsks',
        label: '此卦问过几次',
        description: '同一问题重复问卦会影响结果准确性',
        urgency: CollectionUrgency.RECOMMENDED,
        type: 'number',
        placeholder: '0 表示第一次',
        defaultValue: 0,
        helpText: '建议同一问题三天内不问两卦',
      },
    ],
  },
  {
    phase: CollectionPhase.CORE_SITUATION,
    title: '当前境地',
    subtitle: '您在人生的哪个位置',
    description: '了解您的处境，才能给出贴合实际的建议',
    estimatedTime: 45,
    skipable: false,
    fields: [
      {
        key: 'lifeStage',
        label: '人生阶段',
        description: '您觉得自己目前处于哪个阶段',
        urgency: CollectionUrgency.REQUIRED,
        type: 'select',
        options: [
          { value: 'starting', label: '起步期', description: '刚开始，正在打基础' },
          { value: 'accumulating', label: '积累期', description: '正在努力，还没看到成果' },
          { value: 'bottleneck', label: '瓶颈期', description: '卡住了，不知道怎么办' },
          { value: 'transition', label: '转型期', description: '准备转换方向或身份' },
          { value: 'crisis', label: '危机期', description: '面临重大挑战或变故' },
          { value: 'recovery', label: '恢复期', description: '从低谷中恢复中' },
          { value: 'stable', label: '稳定期', description: '一切平稳，但可能有些疑虑' },
        ],
        validation: [{ type: 'required', message: '请选择人生阶段' }],
      },
      {
        key: 'coreDilemma',
        label: '核心困境',
        description: '用最简洁的话概括您现在最大的困扰',
        urgency: CollectionUrgency.REQUIRED,
        type: 'text',
        placeholder: '例如：不知道坚持还是放弃',
        validation: [{ type: 'required', message: '请描述核心困境' }],
      },
      {
        key: 'stagnationMonths',
        label: '这个困境持续多久了',
        description: '（月）',
        urgency: CollectionUrgency.RECOMMENDED,
        type: 'number',
        placeholder: '例如：3',
        defaultValue: 0,
        helpText: '帮您判断这是长期问题还是突发状况',
      },
      {
        key: 'currentResources',
        label: '当前资源',
        description: '您目前有哪些有利条件（可多选）',
        urgency: CollectionUrgency.RECOMMENDED,
        type: 'multiselect',
        options: [
          { value: 'money', label: '资金储备' },
          { value: 'network', label: '人脉资源' },
          { value: 'skills', label: '专业技能' },
          { value: 'time', label: '充足时间' },
          { value: 'health', label: '良好身体' },
          { value: 'family', label: '家庭支持' },
          { value: 'mentor', label: '导师指导' },
          { value: 'none', label: '暂时看不到明显优势' },
        ],
      },
      {
        key: 'majorChanges',
        label: '近期是否有重大变化',
        description: '如搬家、换工作、分手、疾病等',
        urgency: CollectionUrgency.RECOMMENDED,
        type: 'select',
        options: [
          { value: 'yes', label: '有' },
          { value: 'no', label: '没有' },
        ],
        defaultValue: 'no',
      },
      {
        key: 'changeDetails',
        label: '变化详情',
        description: '如有变化，请简述',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'textarea',
        placeholder: '最近发生了什么重要变化...',
        helpText: '只在选择"有"时显示',
      },
    ],
  },
  {
    phase: CollectionPhase.OPT_MENTAL,
    title: '发问状态',
    subtitle: '心诚则灵，念纯则明',
    description: '卜筮的本意是借助外力观照自身，而非寻求宿命',
    estimatedTime: 30,
    skipable: true,
    skipReason: '这些信息可提升解读精确度，但非必需',
    fields: [
      {
        key: 'emotionalState',
        label: '此刻心绪',
        description: '问卦时您的心情状态',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'select',
        options: [
          { value: 'calm', label: '平静', description: '头脑清醒，心态平和' },
          { value: 'anxious', label: '焦虑', description: '有些担忧，心里有压力' },
          { value: 'hopeful', label: '期待', description: '对结果抱有期望' },
          { value: 'confused', label: '困惑', description: '思路混乱，不知所措' },
          { value: 'urgent', label: '急迫', description: '急于知道答案' },
        ],
      },
      {
        key: 'premonitions',
        label: '近期预兆',
        description: '问卦前后有遇到什么特别的事吗（可多选）',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'multiselect',
        options: [
          { value: 'dream', label: '做了预示性的梦' },
          { value: 'number', label: '反复看到某个数字' },
          { value: 'animal', label: '遇到特殊动物（如黑猫、赤蛇等）' },
          { value: 'weather', label: '天气变化（突然的风/雨）' },
          { value: 'object', label: '意外看到某物（如镜子碎了等）' },
          { value: 'phrase', label: '听到某句话深以为然' },
          { value: 'none', label: '没有特别感觉' },
        ],
      },
      {
        key: 'physicalState',
        label: '身体感受',
        description: '现在的身体状态',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'textarea',
        placeholder: '例如：头疼、胸闷、手心发热...',
        helpText: '古人认为"心血来潮"是神明示时',
      },
      {
        key: 'distraction',
        label: '杂念程度',
        description: '问卦时您有多少其他想法（0-10）',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'number',
        placeholder: '5',
        helpText: '0=完全专注，10=思绪纷乱',
      },
    ],
  },
  {
    phase: CollectionPhase.OPT_PERSON,
    title: '补充人象',
    subtitle: '线索越多，画面越完整',
    description: '这些可选信息可让解读更贴合您的实际情况',
    estimatedTime: 40,
    skipable: true,
    skipReason: '非必须信息，但有帮助',
    fields: [
      {
        key: 'occupation',
        label: '职业',
        description: '您从事什么行业或职业',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'text',
        placeholder: '例如：互联网产品经理',
      },
      {
        key: 'financialStatus',
        label: '财务状况',
        description: '大致的经济水平',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'select',
        options: [
          { value: 'poor', label: '紧张' },
          { value: 'average', label: '一般' },
          { value: 'comfortable', label: '宽裕' },
          { value: 'wealthy', label: '富足' },
        ],
      },
      {
        key: 'keyLifeEvents',
        label: '人生关键节点',
        description: '请填写2-3个对您影响最大的时间节点',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'textarea',
        placeholder: '例如：\n2020年 - 换工作到北京\n2018年 - 结婚\n2015年 - 大学毕业',
        helpText: '用于分析您的人生节奏',
      },
      {
        key: 'relatedPersons',
        label: '相关人物',
        description: '与当前问题相关的人物（如恋人、同事、对手等）',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'textarea',
        placeholder: '例如：\n同事张某 - 竞争同一职位\n恋人李某 - 考虑结婚',
        helpText: '可帮助判断人事对应关系',
      },
    ],
  },
  {
    phase: CollectionPhase.OPT_EXPECTATION,
    title: '主观预期',
    subtitle: '您想要什么结果',
    description: '坦诚面对自己的期望，解读会更准确',
    estimatedTime: 20,
    skipable: true,
    skipReason: '心理预期常被忽略，但影响着主观解读',
    fields: [
      {
        key: 'desiredOutcome',
        label: '期望结果',
        description: '最理想的结果是什么',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'textarea',
        placeholder: '诚实面对自己...',
      },
      {
        key: 'minimalAcceptable',
        label: '可接受的最低结果',
        description: '您觉得什么样的结果也算"可以接受"',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'textarea',
        placeholder: '底线是什么...',
      },
      {
        key: 'actionPlan',
        label: '打算采取的行动',
        description: '目前有具体的行动计划吗',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'textarea',
        placeholder: '例如：下周去找领导谈谈...',
      },
      {
        key: 'riskTolerance',
        label: '风险承受度',
        description: '您愿意冒多大的风险',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'select',
        options: [
          { value: 'low', label: '保守', description: '宁愿等也不愿冒险' },
          { value: 'medium', label: '适中', description: '可以考虑冒险' },
          { value: 'high', label: '激进', description: '觉得风险就是机会' },
        ],
      },
      {
        key: 'timeHorizon',
        label: '期望周期',
        description: '您希望多久看到结果',
        urgency: CollectionUrgency.OPTIONAL,
        type: 'select',
        options: [
          { value: 'short', label: '短期', description: '1-3个月' },
          { value: 'medium', label: '中期', description: '半年到1年' },
          { value: 'long', label: '长期', description: '1年以上' },
        ],
      },
    ],
  },
];

// ==================== 采集器类 ====================

export class HolisticInfoCollector {
  private data: Partial<HolisticPersonContext> = { meta: undefined };
  private meta = {
    version: '1.0.0',
    startTime: new Date(),
    lastUpdated: new Date(),
    collectionTimeSeconds: 0,
    dataSource: [] as ('manual' | 'auto' | 'inferred')[],
  };

  constructor() {
    this.data.meta = { ...this.meta };
  }

  /**
   * 获取采集进度
   */
  public getProgress(): CollectionProgress {
    const corePhases = [
      CollectionPhase.CORE_PERSON,
      CollectionPhase.CORE_QUESTION,
      CollectionPhase.CORE_SITUATION,
    ];
    
    const completedPhases: CollectionPhase[] = [];
    const skippedPhases: CollectionPhase[] = [];

    // 检查核心层完成度
    if (this.data.core) completedPhases.push(CollectionPhase.CORE_PERSON);
    if (this.data.question) completedPhases.push(CollectionPhase.CORE_QUESTION);
    if (this.data.situation) completedPhases.push(CollectionPhase.CORE_SITUATION);

    // 检查可选层
    if (this.data.mental) completedPhases.push(CollectionPhase.OPT_MENTAL);
    if (this.data.supplementary) completedPhases.push(CollectionPhase.OPT_PERSON);
    if (this.data.expectation) completedPhases.push(CollectionPhase.OPT_EXPECTATION);

    const isCoreComplete = corePhases.every(p => completedPhases.includes(p));
    const canGenerate = !!(isCoreComplete && (this.data.question?.domain || true));

    const totalPhases = COLLECTION_SCHEMA.length;
    const completionRate = completedPhases.length / totalPhases;

    return {
      currentPhase: COLLECTION_SCHEMA.find(s => !completedPhases.includes(s.phase))?.phase 
        || completedPhases[completedPhases.length - 1],
      completedPhases,
      skippedPhases,
      completionRate,
      isCoreComplete,
      canGenerate,
    };
  }

  /**
   * 设置核心人象
   */
  public setCorePerson(data: HolisticPersonContext['core']): void {
    this.data.core = data;
    this.updateMeta();
  }

  /**
   * 设置核心问事
   */
  public setCoreQuestion(data: HolisticPersonContext['question']): void {
    this.data.question = data;
    this.updateMeta();
  }

  /**
   * 设置当前境地
   */
  public setCoreSituation(data: HolisticPersonContext['situation']): void {
    this.data.situation = data;
    this.updateMeta();
  }

  /**
   * 设置发问状态
   */
  public setMentalState(data: HolisticPersonContext['mental']): void {
    this.data.mental = data;
    this.updateMeta();
  }

  /**
   * 设置补充人象
   */
  public setSupplementary(data: HolisticPersonContext['supplementary']): void {
    this.data.supplementary = data;
    this.updateMeta();
  }

  /**
   * 设置主观预期
   */
  public setExpectation(data: HolisticPersonContext['expectation']): void {
    this.data.expectation = data;
    this.updateMeta();
  }

  /**
   * 获取完整上下文
   */
  public getContext(): Partial<HolisticPersonContext> {
    return { ...this.data };
  }

  /**
   * 验证是否可生成卜算
   */
  public validateForGeneration(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    if (!this.data.core) {
      missing.push('基础人象未填写');
    } else {
      if (!this.data.core.name) missing.push('姓名');
      if (!this.data.core.birthDatetime) missing.push('出生时间');
      if (!this.data.core.gender) missing.push('性别');
      if (!this.data.core.currentLocation) missing.push('常住地');
    }

    if (!this.data.question) {
      missing.push('核心问事未填写');
    } else {
      if (!this.data.question.domain) missing.push('问题领域');
      if (!this.data.question.description) missing.push('问题描述');
    }

    if (!this.data.situation) {
      missing.push('当前境地未填写');
    }

    return { valid: missing.length === 0, missing };
  }

  /**
   * 导出为卜算密钥输入
   */
  public exportForKeyGeneration(): {
    personHash: number;
    questionHash: number;
    situationHash: number;
    mentalHash: number;
  } {
    // 将人象数据转换为唯一性参数
    const core = this.data.core;
    const question = this.data.question;
    const situation = this.data.situation;
    const mental = this.data.mental;

    function stringHash(s: string): number {
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    }

    return {
      personHash: core ? stringHash(
        `${core.name}:${core.gender}:${core.birthDatetime?.gregorian.toISOString()}`
      ) : 0,
      questionHash: question ? stringHash(
        `${question.domain}:${question.description}:${question.askTime.toISOString()}`
      ) : 0,
      situationHash: situation ? stringHash(
        `${situation.lifeStage}:${situation.coreDilemma}:${situation.stagnationMonths}`
      ) : 0,
      mentalHash: mental ? stringHash(
        `${mental.emotionalState}:${mental.premonitions.join(',')}`
      ) : 0,
    };
  }

  /**
   * 序列化存储
   */
  public serialize(): string {
    return JSON.stringify(this.data);
  }

  /**
   * 反序列化恢复
   */
  public deserialize(json: string): void {
    this.data = JSON.parse(json);
    this.updateMeta();
  }

  private updateMeta(): void {
    if (this.data.meta) {
      this.data.meta.lastUpdated = new Date();
      this.data.meta.collectionTimeSeconds = Math.floor(
        (Date.now() - this.meta.startTime.getTime()) / 1000
      );
    }
  }
}

export default HolisticInfoCollector;
