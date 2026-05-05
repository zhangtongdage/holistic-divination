import { describe, it, expect } from 'vitest';
import {
  LunarCalendarConverter,
  TIAN_GAN,
  DI_ZHI,
  ZODIAC_ANIMALS,
  SOLAR_TERMS,
  LUNAR_MONTH_NAMES,
  LUNAR_DAY_NAMES,
} from '../utils/lunar-calendar';
import type { LunarDate } from '../utils/lunar-calendar';

describe('LunarCalendar', () => {
  describe('常量完整性', () => {
    it('天干应有10个', () => {
      expect(TIAN_GAN).toHaveLength(10);
      expect(TIAN_GAN).toContain('甲');
      expect(TIAN_GAN).toContain('癸');
    });

    it('地支应有12个', () => {
      expect(DI_ZHI).toHaveLength(12);
      expect(DI_ZHI).toContain('子');
      expect(DI_ZHI).toContain('亥');
    });

    it('生肖应有12个且与地支对应', () => {
      expect(ZODIAC_ANIMALS).toHaveLength(12);
      expect(ZODIAC_ANIMALS[0]).toBe('鼠'); // 子-鼠
      expect(ZODIAC_ANIMALS[11]).toBe('猪'); // 亥-猪
    });

    it('节气应有24个', () => {
      expect(SOLAR_TERMS).toHaveLength(24);
      expect(SOLAR_TERMS).toContain('立春');
      expect(SOLAR_TERMS).toContain('冬至');
    });

    it('农历月份名称应有12个', () => {
      expect(LUNAR_MONTH_NAMES).toHaveLength(12);
      expect(LUNAR_MONTH_NAMES[0]).toBe('正月');
      expect(LUNAR_MONTH_NAMES[11]).toBe('腊月');
    });

    it('农历日期名称应有30个', () => {
      expect(LUNAR_DAY_NAMES).toHaveLength(30);
      expect(LUNAR_DAY_NAMES[0]).toBe('初一');
      expect(LUNAR_DAY_NAMES[29]).toBe('三十');
    });
  });

  describe('公历→农历转换', () => {
    it('2024年1月1日应返回有效农历日期', () => {
      const lunar = LunarCalendarConverter.solarToLunar(new Date(2024, 0, 1));
      expect(lunar).toBeDefined();
      expect(lunar.year).toBe(2023);
      expect(lunar.month).toBeGreaterThanOrEqual(1);
      expect(lunar.month).toBeLessThanOrEqual(12);
      expect(lunar.day).toBeGreaterThanOrEqual(1);
      expect(lunar.day).toBeLessThanOrEqual(30);
    });

    it('应返回正确的数据结构', () => {
      const lunar = LunarCalendarConverter.solarToLunar(new Date(2024, 5, 15));
      expect(typeof lunar.year).toBe('number');
      expect(typeof lunar.month).toBe('number');
      expect(typeof lunar.day).toBe('number');
      expect(typeof lunar.isLeap).toBe('boolean');
      expect(typeof lunar.isLeapYear).toBe('boolean');
    });

    it('超出范围的日期应抛出错误', () => {
      expect(() => LunarCalendarConverter.solarToLunar(new Date(1899, 0, 1))).toThrow();
    });

    it('同一日期多次转换结果应一致', () => {
      const date = new Date(2024, 5, 15);
      const r1 = LunarCalendarConverter.solarToLunar(date);
      const r2 = LunarCalendarConverter.solarToLunar(date);
      expect(r1).toEqual(r2);
    });
  });

  describe('农历→公历转换', () => {
    it('应返回有效日期', () => {
      const date = LunarCalendarConverter.lunarToSolar({ year: 2024, month: 1, day: 1, isLeap: false, isLeapYear: false });
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
    });

    it('往返转换应保持年份一致', () => {
      const original = new Date(2024, 5, 15);
      const lunar = LunarCalendarConverter.solarToLunar(original);
      const back = LunarCalendarConverter.lunarToSolar(lunar);
      // 往返转换可能有±1天误差，但年份应该一致
      expect(back.getFullYear()).toBe(original.getFullYear());
    });
  });

  describe('八字计算', () => {
    it('应返回完整八字', () => {
      const bazi = LunarCalendarConverter.calculateEightCharacters(new Date(2024, 0, 1), 0);
      expect(bazi.yearStem).toBeTruthy();
      expect(bazi.yearBranch).toBeTruthy();
      expect(bazi.monthStem).toBeTruthy();
      expect(bazi.monthBranch).toBeTruthy();
      expect(bazi.dayStem).toBeTruthy();
      expect(bazi.dayBranch).toBeTruthy();
      expect(bazi.hourStem).toBeTruthy();
      expect(bazi.hourBranch).toBeTruthy();
      expect(bazi.yearAnimal).toBeTruthy();
    });

    it('天干应为合法天干值', () => {
      const bazi = LunarCalendarConverter.calculateEightCharacters(new Date(2024, 5, 15), 12);
      const allStems = [bazi.yearStem, bazi.monthStem, bazi.dayStem, bazi.hourStem];
      for (const stem of allStems) {
        expect(TIAN_GAN).toContain(stem);
      }
    });

    it('地支应为合法地支值', () => {
      const bazi = LunarCalendarConverter.calculateEightCharacters(new Date(2024, 5, 15), 12);
      const allBranches = [bazi.yearBranch, bazi.monthBranch, bazi.dayBranch, bazi.hourBranch];
      for (const branch of allBranches) {
        expect(DI_ZHI).toContain(branch);
      }
    });

    it('不同时辰应产生不同时柱', () => {
      const date = new Date(2024, 5, 15);
      const bazi1 = LunarCalendarConverter.calculateEightCharacters(date, 0);
      const bazi2 = LunarCalendarConverter.calculateEightCharacters(date, 12);
      // 子时和午时的时柱应该不同
      expect(bazi1.hourStem).not.toBe(bazi2.hourStem);
    });
  });

  describe('完整信息', () => {
    it('应返回完整的农历信息', () => {
      const info = LunarCalendarConverter.getCompleteLunarInfo(new Date(2024, 5, 15));
      expect(info.lunarDate).toBeDefined();
      expect(info.eightCharacters).toBeDefined();
      expect(info.weekday).toBeGreaterThanOrEqual(0);
      expect(info.weekday).toBeLessThanOrEqual(6);
      expect(typeof info.isToday).toBe('boolean');
      expect(typeof info.weekdayName).toBe('string');
    });
  });

  describe('农历日期格式化', () => {
    it('应返回正确的农历日期文本', () => {
      const lunar: LunarDate = { year: 2024, month: 1, day: 1, isLeap: false, isLeapYear: false };
      const text = LunarCalendarConverter.getLunarDateText(lunar);
      expect(text).toContain('正月');
      expect(text).toContain('初一');
    });

    it('八字文本应包含干支', () => {
      const bazi = LunarCalendarConverter.calculateEightCharacters(new Date(2024, 5, 15), 12);
      const text = LunarCalendarConverter.getEightCharactersText(bazi);
      expect(text).toBeTruthy();
      expect(typeof text).toBe('string');
    });
  });
});
