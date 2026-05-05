/**
 * 农历/公历转换算法
 * 基于《万年历》算法和天文计算方法
 * 支持1900-2100年转换
 */

// ==================== 基础常量 ====================

// 天干
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 十二生肖
export const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 农历月份名称
export const LUNAR_MONTH_NAMES = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月'
];

// 农历日期名称
export const LUNAR_DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

// 节气名称
export const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

// 1900-2100年农历数据（1900年1月31日为农历1900年正月初一）
// 格式：16进制，12位表示12个月，大月30天，小月29天
// 最高位表示闰月，其余位大小月
const LUNAR_INFO: number[] = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2, // 1900-1909
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977, // 1910-1919
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970, // 1920-1929
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950, // 1930-1939
  0x0d4a0,0x1d8a6,0x0d560,0x0fa40,0x02d96,0x04970,0x06544,0x0d4a0,0x0ea50,0x16a95, // 1940-1949
  0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c960,0x0d4a0,0x0d950,0x05520,0x0d544, // 1950-1959
  0x0b4a0,0x0b590,0x055a2,0x095d0,0x049d0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40, // 1960-1969
  0x0b696,0x02b60,0x052e4,0x0f216,0x06e95,0x05590,0x05760,0x15b5c,0x0d2a0,0x0e542, // 1970-1979
  0x0ea50,0x16aa0,0x1ad50,0x02b60,0x04d66,0x0d2a0,0x0ea50,0x054e6,0x055d0,0x1a5b4, // 1980-1989
  0x0a6e0,0x092e0,0x0d2e3,0x0c960,0x0d556,0x0b540,0x0b6a0,0x195a6,0x095b0,0x049b0, // 1990-1999
  0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,0x04af5,0x04970, // 2000-2009
  0x065b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,0x0c960,0x0d954, // 2010-2019
  0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,0x0a950,0x0b4a0, // 2020-2029
  0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,0x07954,0x06aa0, // 2030-2039
  0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,0x076a3, // 2040-2049
  0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,0x0b5a0,0x056d0, // 2050-2059
  0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ad60,0x14b63,0x09370, // 2060-2069
  0x049f8,0x04970,0x064b0,0x068a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,0x0a2e0,0x0d2e3, // 2070-2079
  0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,0x052d0,0x0a9b8, // 2080-2089
  0x0a950,0x0b4a0,0x06aa0,0x0ad50,0x055b2,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65, // 2090-2099
  0x0d530, // 2100
];

// ==================== 农历日期类型 ====================

export interface LunarDate {
  year: number;      // 农历年
  month: number;     // 农历月（1-12）
  day: number;       // 农历日
  isLeap: boolean;   // 是否闰月
  isLeapYear: boolean; // 当年是否有闰月
}

export interface EightCharacters {
  yearStem: string;   // 年干
  yearBranch: string; // 年支
  monthStem: string;  // 月干
  monthBranch: string; // 月支
  dayStem: string;    // 日干
  dayBranch: string;  // 日支
  hourStem: string;   // 时干
  hourBranch: string; // 时支
  yearAnimal: string; // 生肖
}

export interface CompleteLunarInfo {
  lunarDate: LunarDate;
  eightCharacters: EightCharacters;
  solarTerm?: string; // 当前节气
  isToday: boolean;
  weekday: number;
  weekdayName: string;
}

// ==================== 核心转换类 ====================

export class LunarCalendarConverter {
  
  /**
   * 公历转农历
   * @param date 公历日期
   * @returns 农历日期对象
   */
  public static solarToLunar(date: Date): LunarDate {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 基础检查
    if (year < 1900 || year > 2100) {
      throw new Error('只支持1900-2100年的转换');
    }
    
    // 计算从1900年1月1日到目标日期的天数
    const baseDate = new Date(1900, 0, 31); // 1900年1月31日为农历1900年正月初一
    const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
    
    // 逐年计算
    let lunarYear = 1900;
    let remainingDays = diffDays;
    let yearDays = 0;
    
    while (lunarYear <= 2100) {
      yearDays = this.getLunarYearDays(lunarYear);
      if (remainingDays < yearDays) {
        break;
      }
      remainingDays -= yearDays;
      lunarYear++;
    }
    
    if (lunarYear > 2100) {
      throw new Error('日期超出范围');
    }
    
    // 逐月计算
    const leapMonth = this.getLeapMonth(lunarYear);
    const isLeapYear = leapMonth > 0;
    let lunarMonth = 1;
    let isLeap = false;
    let monthDays = 0;
    
    while (lunarMonth <= 12) {
      // 检查是否闰月
      if (isLeapYear && leapMonth === lunarMonth && !isLeap && remainingDays >= 0) {
        monthDays = this.getLeapMonthDays(lunarYear);
        if (remainingDays < monthDays) {
          isLeap = true;
          break;
        }
        remainingDays -= monthDays;
      }
      
      monthDays = this.getMonthDays(lunarYear, lunarMonth);
      if (remainingDays < monthDays) {
        break;
      }
      remainingDays -= monthDays;
      lunarMonth++;
    }
    
    const lunarDay = remainingDays + 1;
    
    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeap,
      isLeapYear
    };
  }
  
  /**
   * 农历转公历
   * @param lunarDate 农历日期
   * @returns 公历日期
   */
  public static lunarToSolar(lunarDate: LunarDate): Date {
    const { year, month, day, isLeap } = lunarDate;
    
    if (year < 1900 || year > 2100) {
      throw new Error('只支持1900-2100年的转换');
    }
    
    // 计算从1900年到目标年之前的总天数
    let totalDays = 0;
    for (let y = 1900; y < year; y++) {
      totalDays += this.getLunarYearDays(y);
    }
    
    // 加上当年之前月份的天数
    const leapMonth = this.getLeapMonth(year);
    
    for (let m = 1; m < month; m++) {
      // 检查是否闰月
      if (leapMonth === m) {
        totalDays += this.getLeapMonthDays(year);
      }
      totalDays += this.getMonthDays(year, m);
    }
    
    // 如果目标月是闰月且之前已经过了闰月
    if (isLeap && leapMonth === month) {
      totalDays += this.getMonthDays(year, month);
    }
    
    // 加上当月天数
    totalDays += day - 1;
    
    // 基准日期为1900年1月31日
    const baseDate = new Date(1900, 0, 31);
    return new Date(baseDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
  }
  
  /**
   * 计算八字
   * @param date 公历日期
   * @param hour 时辰（0-23）
   * @returns 八字对象
   */
  public static calculateEightCharacters(date: Date, hour: number): EightCharacters {
    const lunarDate = this.solarToLunar(date);
    const year = lunarDate.year;
    const month = lunarDate.month;
    const day = date.getDate();
    
    // 年干支（以立春为界）
    const yearGanZhi = this.getYearGanZhi(year, date);
    
    // 月干支（以节气为界）
    const monthGanZhi = this.getMonthGanZhi(year, month, date);
    
    // 日干支（从公历计算）
    const dayGanZhi = this.getDayGanZhi(date);
    
    // 时干支
    const hourGanZhi = this.getHourGanZhi(dayGanZhi.stem, hour);
    
    // 生肖（年支对应）
    const zodiacIndex = DI_ZHI.indexOf(yearGanZhi.branch);
    
    return {
      yearStem: yearGanZhi.stem,
      yearBranch: yearGanZhi.branch,
      monthStem: monthGanZhi.stem,
      monthBranch: monthGanZhi.branch,
      dayStem: dayGanZhi.stem,
      dayBranch: dayGanZhi.branch,
      hourStem: hourGanZhi.stem,
      hourBranch: hourGanZhi.branch,
      yearAnimal: ZODIAC_ANIMALS[zodiacIndex]
    };
  }
  
  /**
   * 获取完整农历信息
   * @param date 公历日期
   * @returns 完整的农历信息
   */
  public static getCompleteLunarInfo(date: Date): CompleteLunarInfo {
    const lunarDate = this.solarToLunar(date);
    const hour = date.getHours();
    const eightChars = this.calculateEightCharacters(date, hour);
    
    // 星期
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = date.getDay();
    
    // 节气（简化版，实际需查表计算）
    const solarTerm = this.getSolarTerm(date);
    
    // 检查是否是今天
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    return {
      lunarDate,
      eightCharacters: eightChars,
      solarTerm,
      isToday,
      weekday,
      weekdayName: `星期${weekdays[weekday]}`
    };
  }
  
  // ==================== 私有辅助方法 ====================
  
  /**
   * 获取农历年的天数
   */
  private static getLunarYearDays(year: number): number {
    let sum = 348; // 12个月 × 29天
    const yearData = LUNAR_INFO[year - 1900];
    
    // 检查大月
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      if (yearData & i) sum++;
    }
    
    // 加上闰月天数
    sum += this.getLeapMonthDays(year);
    
    return sum;
  }
  
  /**
   * 获取某月的天数（29或30）
   */
  private static getMonthDays(year: number, month: number): number {
    const yearData = LUNAR_INFO[year - 1900];
    return (yearData & (0x10000 >> month)) ? 30 : 29;
  }
  
  /**
   * 获取闰月（0表示无闰月，1-12表示闰几月）
   */
  private static getLeapMonth(year: number): number {
    return LUNAR_INFO[year - 1900] & 0xf;
  }
  
  /**
   * 获取闰月天数
   */
  private static getLeapMonthDays(year: number): number {
    const leapMonth = this.getLeapMonth(year);
    if (leapMonth === 0) return 0;
    
    return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
  }
  
  /**
   * 获取年干支
   * 注意：以立春为界，立春前属于上一年
   */
  private static getYearGanZhi(year: number, date: Date): { stem: string; branch: string } {
    // 简化：以春节为界（精确版需查立春日期）
    let ganZhiYear = year - 1900 + 36; // 1900年为庚子年
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 如果还没过春节（大致2月4日前），减1
    if (month < 2 || (month === 2 && day < 4)) {
      ganZhiYear--;
    }
    
    return {
      stem: TIAN_GAN[ganZhiYear % 10],
      branch: DI_ZHI[ganZhiYear % 12]
    };
  }
  
  /**
   * 获取月干支
   * 正月建寅，依次顺推
   */
  private static getMonthGanZhi(year: number, month: number, date: Date): { stem: string; branch: string } {
    // 年干决定正月干
    const yearGanZhi = this.getYearGanZhi(year, date);
    const yearGanIndex = TIAN_GAN.indexOf(yearGanZhi.stem);
    
    // 甲己之年丙作首，乙庚之岁戊为头，丙辛之年寻庚起，丁壬壬位顺行流，戊癸何方发，甲寅之上好追求
    const monthGanStart = [2, 4, 6, 8, 0][yearGanIndex % 5]; // 丙戊庚壬甲
    
    // 正月建寅（month=1对应寅=2）
    const branchIndex = (month + 1) % 12; // 寅=2，卯=3...
    const ganIndex = (monthGanStart + month - 1) % 10;
    
    return {
      stem: TIAN_GAN[ganIndex],
      branch: DI_ZHI[branchIndex]
    };
  }
  
  /**
   * 获取日干支
   * 从已知日期推算
   */
  private static getDayGanZhi(date: Date): { stem: string; branch: string } {
    // 1900年1月1日为甲戌日（假设）
    const baseDate = new Date(1900, 0, 1);
    const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
    
    // 甲=0，戌=10
    const ganIndex = (10 + diffDays) % 10;
    const branchIndex = (10 + diffDays) % 12;
    
    return {
      stem: TIAN_GAN[ganIndex],
      branch: DI_ZHI[branchIndex]
    };
  }
  
  /**
   * 获取时干支
   * 日干决定时干起点
   */
  private static getHourGanZhi(dayStem: string, hour: number): { stem: string; branch: string } {
    const dayGanIndex = TIAN_GAN.indexOf(dayStem);
    
    // 时辰索引（0-11对应子到亥）
    const hourBranchIndex = Math.floor((hour + 1) % 24 / 2) % 12;
    
    // 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
    const hourGanStart = [0, 2, 4, 6, 8][dayGanIndex % 5]; // 甲丙戊庚壬
    const hourGanIndex = (hourGanStart + hourBranchIndex) % 10;
    
    return {
      stem: TIAN_GAN[hourGanIndex],
      branch: DI_ZHI[hourBranchIndex]
    };
  }
  
  /**
   * 获取节气（简化版）
   */
  private static getSolarTerm(date: Date): string | undefined {
    const month = date.getMonth();
    const day = date.getDate();
    
    // 简化的节气日期（每月两个节气，大约3-9日或18-24日）
    const termDates: Record<number, [number, number]> = {
      0: [5, 20],   // 小寒、大寒
      1: [3, 18],   // 立春、雨水
      2: [5, 20],   // 惊蛰、春分
      3: [4, 19],   // 清明、谷雨
      4: [5, 20],   // 立夏、小满
      5: [5, 21],   // 芒种、夏至
      6: [7, 22],   // 小暑、大暑
      7: [7, 22],   // 立秋、处暑
      8: [7, 22],   // 白露、秋分
      9: [8, 23],   // 寒露、霜降
      10: [7, 22],  // 立冬、小雪
      11: [6, 21],  // 大雪、冬至
    };
    
    const [firstTerm, secondTerm] = termDates[month] || [0, 0];
    const termIndex = day === firstTerm ? month * 2 : day === secondTerm ? month * 2 + 1 : -1;
    
    return termIndex >= 0 ? SOLAR_TERMS[termIndex] : undefined;
  }
  
  /**
   * 获取农历日期文本表示
   */
  public static getLunarDateText(lunarDate: LunarDate): string {
    const yearText = `${lunarDate.year}年`;
    const leapText = lunarDate.isLeap ? '闰' : '';
    const monthText = LUNAR_MONTH_NAMES[lunarDate.month - 1];
    const dayText = LUNAR_DAY_NAMES[lunarDate.day - 1];
    
    return `${yearText}${leapText}${monthText}${dayText}`;
  }
  
  /**
   * 获取八字文本表示
   */
  public static getEightCharactersText(baZi: EightCharacters): string {
    return `${baZi.yearStem}${baZi.yearBranch} ${baZi.monthStem}${baZi.monthBranch} ` +
           `${baZi.dayStem}${baZi.dayBranch} ${baZi.hourStem}${baZi.hourBranch}`;
  }
}

// 默认导出
export default LunarCalendarConverter;
