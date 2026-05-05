/**
 * 多轮卜算测试 — 不同问题、不同人象
 * 运行方式: npx tsx scripts/multi-round-test.ts
 */
import { LunarCalendarConverter } from '../core/src/utils/lunar-calendar';
import { UniqueDivinationKeyGenerator } from '../core/src/engine/key-generator';
import { SixLayerFusionEngine } from '../core/src/engine/six-layer-engine';
import type { HolisticPersonContext } from '../core/src/collection/holistic-collector';

// ==================== 测试用例定义 ====================
const TEST_CASES: Array<{
  name: string;
  context: HolisticPersonContext;
}> = [
  {
    name: '【测试1】事业 — 张三，1990年元旦出生，问跳槽',
    context: {
      core: {
        name: '张三',
        birthDatetime: {
          gregorian: new Date(1990, 0, 1, 8, 30),
          lunar: { year: 1989, month: 12, day: 5, isLeap: false },
          timezone: 'Asia/Shanghai',
          isExact: true,
          isDaylightSaving: false,
        },
        gender: 'male',
        currentLocation: { province: '北京', city: '北京' },
        residenceDuration: 6,
      },
      question: {
        domain: 'career',
        description: '目前在公司做项目经理3年，收到另一家公司offer，薪资涨30%。该不该跳槽？',
        urgency: 'urgent',
        askTime: new Date('2026-05-05T18:48:00'),
        similarAsks: 1,
      },
      situation: {
        lifeStage: 'bottleneck',
        coreDilemma: '原地踏步3年无晋升，新机会有风险但薪资诱惑大',
        stagnationMonths: 18,
        currentResources: ['项目经理经验', 'PMP证书', '行业人脉'],
        majorChanges: true,
        changeDetails: '刚收到新公司正式offer',
      },
      supplementary: {
        occupation: '项目经理',
        financialStatus: 'average' as const,
      },
      expectation: {
        desiredOutcome: '找到职业上升通道',
        minimalAcceptable: '薪资不降、发展空间更大',
        riskTolerance: 'medium' as const,
        timeHorizon: 'short' as const,
      },
      mental: {
        emotionalState: 'anxious',
        physicalState: '近期失眠',
        distraction: 6,
      },
    },
  },
  {
    name: '【测试2】财运 — 李四，1985年夏出生，问投资',
    context: {
      core: {
        name: '李四',
        birthDatetime: {
          gregorian: new Date(1985, 5, 15, 14, 0),
          lunar: { year: 1985, month: 5, day: 28, isLeap: false },
          timezone: 'Asia/Shanghai',
          isExact: true,
          isDaylightSaving: false,
        },
        gender: 'male',
        currentLocation: { province: '广东', city: '深圳' },
        residenceDuration: 10,
      },
      question: {
        domain: 'wealth',
        description: '手头有10万闲钱，想投ETF基金，最近股市震荡，该进场还是等？',
        urgency: 'normal',
        askTime: new Date('2026-05-05T18:48:00'),
        similarAsks: 0,
      },
      situation: {
        lifeStage: 'accumulating',
        coreDilemma: '怕错过行情又怕被套',
        stagnationMonths: 2,
        currentResources: ['10万闲钱', '2年投资经验', '风控意识'],
        majorChanges: false,
      },
      supplementary: {
        occupation: '程序员',
        financialStatus: 'comfortable' as const,
      },
      mental: {
        emotionalState: 'confused',
        distraction: 7,
      },
    },
  },
  {
    name: '【测试3】感情 — 王芳，1995年春出生，问恋情',
    context: {
      core: {
        name: '王芳',
        birthDatetime: {
          gregorian: new Date(1995, 3, 20, 6, 15),
          lunar: { year: 1995, month: 3, day: 21, isLeap: false },
          timezone: 'Asia/Shanghai',
          isExact: true,
          isDaylightSaving: false,
        },
        gender: 'female',
        currentLocation: { province: '浙江', city: '杭州' },
        residenceDuration: 4,
      },
      question: {
        domain: 'relationship',
        description: '和男朋友交往2年，最近频繁吵架，他在考虑去上海发展。我们的感情还有未来吗？',
        urgency: 'urgent',
        askTime: new Date('2026-05-05T18:48:00'),
        similarAsks: 2,
      },
      situation: {
        lifeStage: 'accumulating',
        coreDilemma: '异地抉择和感情维系的矛盾',
        stagnationMonths: 3,
        currentResources: ['2年感情基础', '双方父母支持', '异地经验'],
        majorChanges: true,
        changeDetails: '男友即将赴沪工作',
      },
      mental: {
        emotionalState: 'anxious',
        physicalState: '胸闷气短',
        distraction: 8,
        premonitions: ['昨晚梦见老房子倒塌'],
      },
    },
  },
  {
    name: '【测试4】健康 — 赵强，1975年秋出生，问身体',
    context: {
      core: {
        name: '赵强',
        birthDatetime: {
          gregorian: new Date(1975, 8, 8, 10, 0),
          lunar: { year: 1975, month: 8, day: 3, isLeap: false },
          timezone: 'Asia/Shanghai',
          isExact: true,
          isDaylightSaving: false,
        },
        gender: 'male',
        currentLocation: { province: '四川', city: '成都' },
        residenceDuration: 20,
      },
      question: {
        domain: 'health',
        description: '最近体检发现肝指标异常，医生说要复查。身体会不会有大问题？',
        urgency: 'urgent',
        askTime: new Date('2026-05-05T18:48:00'),
        similarAsks: 0,
      },
      situation: {
        lifeStage: 'stable',
        coreDilemma: '体检异常结果带来的心理压力',
        stagnationMonths: 1,
        currentResources: ['医保', '三甲医院资源'],
        majorChanges: false,
      },
      supplementary: {
        occupation: '教师',
        financialStatus: 'average' as const,
      },
      mental: {
        emotionalState: 'anxious',
        physicalState: '右胁隐痛',
        distraction: 9,
      },
    },
  },
  {
    name: '【测试5】学业 — 刘小明，2000年冬出生，问考研',
    context: {
      core: {
        name: '刘小明',
        birthDatetime: {
          gregorian: new Date(2000, 11, 31, 23, 45),
          lunar: { year: 2000, month: 12, day: 5, isLeap: false },
          timezone: 'Asia/Shanghai',
          isExact: true,
          isDaylightSaving: false,
        },
        gender: 'male',
        currentLocation: { province: '湖北', city: '武汉' },
        residenceDuration: 3,
      },
      question: {
        domain: 'study',
        description: '跨专业考研计算机，目标是985，复习了半年但感觉数学太难。能考上吗？',
        urgency: 'normal',
        askTime: new Date('2026-05-05T18:48:00'),
        similarAsks: 0,
      },
      situation: {
        lifeStage: 'starting',
        coreDilemma: '跨考压力大，数学基础薄弱',
        stagnationMonths: 4,
        currentResources: ['半年复习笔记', '考研网课', '图书馆位置'],
        majorChanges: false,
      },
      supplementary: {
        occupation: '本科生',
        financialStatus: 'poor' as const,
      },
      mental: {
        emotionalState: 'confused',
        physicalState: '肩颈酸痛',
        distraction: 5,
      },
    },
  },
];

// ==================== 主测试逻辑 ====================
async function runTest(index: number, testCase: typeof TEST_CASES[0]) {
  const sep = '═'.repeat(72);
  const thin = '─'.repeat(72);
  const engine = new SixLayerFusionEngine();
  const startTime = Date.now();
  
  console.log(`\n${sep}`);
  console.log(`  ${testCase.name}`);
  console.log(sep);
  
  const result = await engine.divinate(testCase.context);
  const elapsed = Date.now() - startTime;
  
  // === 核心信息 ===
  console.log(`\n⏱  耗时: ${elapsed}ms | 结果ID: ${result.id}`);
  console.log(`\n【密钥信息】`);
  console.log(`  本卦: 《${result.hexagram.primary}》`);
  console.log(`  变卦: ${result.hexagram.secondary ? '《' + result.hexagram.secondary + '》' : '无'}`);
  console.log(`  动爻: ${result.hexagram.changingLines.length > 0 ? result.hexagram.changingLines.join(', ') : '静爻'}`);
  console.log(`  爻象: ${result.hexagram.lines.map(l => l ? '━━━' : '━ ━').join(' ')}`);
  
  // === 公理层 ===
  const gl = result.layers.gongLi;
  console.log(`\n${thin}`);
  console.log(`【第一层：公理层】`);
  console.log(`  阴阳: ${gl.yinYang.overall} (${gl.yinYang.ratio[0]}阳:${gl.yinYang.ratio[1]}阴)`);
  console.log(`  五行: ${Object.entries(gl.fiveElements.counts).map(([k,v]) => `${k}:${v}`).join(' | ')}`);
  console.log(`  平衡: ${gl.fiveElements.balance}`);
  console.log(`  干支: ${gl.stemsBranches.year} ${gl.stemsBranches.month} ${gl.stemsBranches.day} ${gl.stemsBranches.hour}`);
  
  // === 体用层 ===
  const ty = result.layers.tiYong;
  console.log(`\n${thin}`);
  console.log(`【第二层：体用层】`);
  console.log(`  日主: ${ty.body.dayMaster} | 主导: ${ty.body.fiveElements.dominant} | 缺失: ${ty.body.fiveElements.deficiency}`);
  console.log(`  用神: ${ty.application.questionCategory} → ${ty.application.competition || '无竞争'}`);
  console.log(`  天时: ${ty.opportunity.timing}`);
  console.log(`  地利: ${ty.opportunity.location}`);
  console.log(`  人和: ${ty.opportunity.resonance}`);
  
  // === 机变层 ===
  const jb = result.layers.jiBian;
  console.log(`\n${thin}`);
  console.log(`【第三层：机变层】`);
  console.log(`  格局: ${jb.pattern}`);
  console.log(`  变爻: ${jb.changingLines.length > 0 ? jb.changingLines.join(',') : '无'}`);
  console.log(`  变卦: ${jb.changingHexagram || '无'}`);
  console.log(`  稳定: ${jb.variables.stable.join(', ')}`);
  console.log(`  变数: ${jb.variables.changing.join(', ') || '无'}`);
  console.log(`  关键: ${jb.variables.critical}`);
  
  // === 取象层 ===
  const qx = result.layers.quXiang;
  console.log(`\n${thin}`);
  console.log(`【第四层：取象层】`);
  console.log(`  主象: ${qx.primarySymbol}`);
  console.log(`  辅象: ${qx.secondarySymbols.join(', ')}`);
  console.log(`  自然: ${qx.images.nature}`);
  console.log(`  人事: ${qx.images.human}`);
  console.log(`  器物: ${qx.images.object}`);
  console.log(`  方位: ${qx.images.place}`);
  if (qx.externalSigns?.length) console.log(`  外应: ${qx.externalSigns.join(', ')}`);
  
  // === 义理层 ===
  const yl = result.layers.yiLi;
  console.log(`\n${thin}`);
  console.log(`【第五层：义理层】`);
  console.log(`  ★ 吉凶: ${yl.auspiciousness}`);
  console.log(`  趋势: ${yl.trendDescription}`);
  console.log(`  应期: ${yl.timeFrame.deadline}`);
  console.log(`  建议: ${yl.advice.action}`);
  console.log(`  时机: ${yl.advice.timing}`);
  console.log(`  注意: ${yl.advice.caution}`);
  console.log(`  概率:`);
  for (const pr of yl.timeFrame.probabilityRanges) {
    console.log(`    ${pr.period} (${Math.round(pr.probability*100)}%): ${pr.condition}`);
  }
  
  // === 典籍引用 ===
  console.log(`\n${thin}`);
  console.log(`【典籍引用】(${result.citations.length}条)`);
  for (const c of result.citations) {
    console.log(`  📜 ${c.title}·${c.chapter || ''}`);
    console.log(`     原文: ${c.quote}`);
    console.log(`     白话: ${c.translation}`);
    console.log(`     相关度: ${c.relevance}`);
  }
  
  // === 结论 ===
  const co = result.conclusion;
  console.log(`\n${thin}`);
  console.log(`【第六层：占断结论】`);
  console.log(`  ★ 总断: ${co.verdict}`);
  console.log(`  关键词: ${co.keywords.join(' | ')}`);
  console.log(`  近期: ${co.timeline.near}`);
  console.log(`  中期: ${co.timeline.medium}`);
  console.log(`  远期: ${co.timeline.far}`);
  console.log(`  有利: ${co.actions.favorable.join(', ')}`);
  console.log(`  忌讳: ${co.actions.avoid.join(', ')}`);
  console.log(`  方位: ${co.directionAdvice}`);
  console.log(`  颜色: ${co.colorAdvice}`);
  console.log(`  心理: ${co.mentalAdvice}`);
  
  // === 权重 ===
  const w = result.weightExplanation;
  console.log(`\n${thin}`);
  console.log(`【权重分配】`);
  console.log(`  ${w.description}`);
  
  // === 冲突 ===
  if (result.systemConflicts.length > 0) {
    console.log(`\n${thin}`);
    console.log(`【系统冲突】(${result.systemConflicts.length}条)`);
    for (const sc of result.systemConflicts) {
      console.log(`  ⚠ ${sc.conflictType}: ${sc.warning}`);
      console.log(`    解决: ${sc.resolution}`);
    }
  }
  
  // === 免责 ===
  console.log(`\n${thin}`);
  console.log(result.disclaimer);
  
  return result;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║               全 息 卜 算 系 统 — 多 轮 测 试                               ║');
  console.log('║        同一人问不同事 × 同一事问不同人 × 不同时间维度对比                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  
  const results: any[] = [];
  for (let i = 0; i < TEST_CASES.length; i++) {
    const result = await runTest(i + 1, TEST_CASES[i]);
    results.push({ ...TEST_CASES[i], result });
  }
  
  // ==================== 横向对比表 ====================
  console.log('\n' + '╔' + '═'.repeat(72) + '╗');
  console.log('║                    横 向 对 比 总 表');
  console.log('╚' + '═'.repeat(72) + '╝');
  
  console.log(`\n${'测试'.padEnd(8)}${'本卦'.padEnd(8)}${'变爻'.padEnd(8)}${'吉凶'.padEnd(8)}${'用神'.padEnd(8)}${'格局'.padEnd(14)}${'应期'}`);
  console.log('─'.repeat(72));
  for (const r of results) {
    const line = [
      r.name.slice(1, 5).padEnd(8),
      r.result.hexagram.primary.padEnd(8),
      (r.result.hexagram.changingLines.join(',') || '无').padEnd(8),
      r.result.conclusion.verdict.padEnd(8),
      r.result.layers.tiYong.application.competition?.slice(0,4).padEnd(8) || '—'.padEnd(8),
      r.result.layers.jiBian.pattern.slice(0, 14).padEnd(14),
      r.result.layers.yiLi.timeFrame.deadline,
    ].join('');
    console.log(line);
  }
  
  // ==================== 变化分析 ====================
  console.log(`\n${'═'.repeat(72)}`);
  console.log('【多轮结果变化分析】');
  console.log('─'.repeat(72));
  
  const hexagrams = results.map(r => r.result.hexagram.primary);
  const uniqueHex = [...new Set(hexagrams)];
  console.log(`  卦象分布: ${uniqueHex.map(h => `${h}(${hexagrams.filter(x=>x===h).length}次)`).join(' ')}`);
  console.log(`  卦象变化: ${hexagrams.length > 1 && uniqueHex.length > 1 ? '✅ 不同问题得到不同卦象' : '⚠ 全部相同卦象'}`);
  
  const fortunes = results.map(r => r.result.conclusion.verdict);
  const fortuneColors = fortunes.map(f => {
    if (['大吉','吉'].includes(f)) return '🟢';
    if (['小吉','平'].includes(f)) return '🟡';
    return '🔴';
  });
  console.log(`  吉凶分布: ${results.map((r, i) => `${fortuneColors[i]}${r.name.slice(1,5)}:${r.result.conclusion.verdict}`).join('  ')}`);
  
  const domains = results.map(r => r.context.question.domain);
  const domainGods = results.map(r => r.result.layers.tiYong.application.questionCategory);
  console.log(`  问题域:   ${domains.join(' → ')}`);
  console.log(`  用神:     ${domainGods.join(' → ')}`);
  
  const changingCounts = results.map(r => r.result.hexagram.changingLines.length);
  console.log(`  动爻数:   ${changingCounts.join(', ')} (最大变化=${Math.max(...changingCounts)}爻)`);
  
  const conflictCounts = results.map(r => r.result.systemConflicts.length);
  console.log(`  冲突数:   ${conflictCounts.join(', ')} (系统自检发现的矛盾)`);
  
  // 方位建议对比
  const directions = results.map(r => r.result.conclusion.directionAdvice);
  const uniqueDirs = [...new Set(directions)];
  console.log(`  方位建议差异: ${uniqueDirs.length}种不同建议`);
  
  // 颜色建议对比
  const colors = results.map(r => r.result.conclusion.colorAdvice);
  const uniqueColors = [...new Set(colors)];
  console.log(`  颜色建议差异: ${uniqueColors.length}种不同建议`);
  
  console.log(`\n${'═'.repeat(72)}`);
  console.log('测试完成 ✅');
}

main().catch(console.error);
