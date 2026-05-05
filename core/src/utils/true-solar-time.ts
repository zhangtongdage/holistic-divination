/**
 * 真太阳时计算
 * 
 * 根据出生地经度修正地方时 → 真太阳时
 * 中国标准时间基于东经120°，每偏差1°修正4分钟
 * 
 * 参考：
 * - 《四库全书·术数类》
 * - 天文算法标准
 */

// 中国主要城市经度表（近似值）
const CITY_LONGITUDE: Record<string, number> = {
  // 直辖市
  '北京': 116.4, '上海': 121.5, '天津': 117.2, '重庆': 106.5,
  // 省会城市
  '哈尔滨': 126.6, '长春': 125.3, '沈阳': 123.4, '石家庄': 114.5,
  '太原': 112.5, '呼和浩特': 111.7, '济南': 117.0, '郑州': 113.7,
  '南京': 118.8, '合肥': 117.3, '杭州': 120.2, '南昌': 115.9,
  '福州': 119.3, '台北': 121.5, '长沙': 113.0, '武汉': 114.3,
  '广州': 113.3, '南宁': 108.3, '海口': 110.3, '成都': 104.1,
  '贵阳': 106.7, '昆明': 102.7, '拉萨': 91.1, '西安': 108.9,
  '兰州': 103.8, '西宁': 101.8, '银川': 106.3, '乌鲁木齐': 87.6,
  '香港': 114.2, '澳门': 113.5,
  // 其他城市
  '大连': 121.6, '青岛': 120.4, '厦门': 118.1, '深圳': 114.1,
  '苏州': 120.6, '无锡': 120.3, '宁波': 121.5, '温州': 120.7,
  '珠海': 113.6, '东莞': 113.8, '佛山': 113.1, '惠州': 114.4,
  '常州': 119.9, '徐州': 117.2, '扬州': 119.4, '绍兴': 120.6,
  '嘉兴': 120.8, '台州': 121.4, '金华': 119.6, '泉州': 118.6,
  '漳州': 117.6, '烟台': 121.4, '潍坊': 119.1, '洛阳': 112.4,
  '开封': 114.3, '信阳': 114.1, '宜昌': 111.3, '荆州': 112.2,
  '襄阳': 112.1, '岳阳': 113.1, '湘潭': 112.9, '株洲': 113.1,
  '九江': 116.0, '赣州': 114.9, '桂林': 110.3, '柳州': 109.4,
  '遵义': 106.9, '大理': 100.2, '丽江': 100.2, '敦煌': 94.7,
};

// 省份名→省会经度（简化处理）
const PROVINCE_LONGITUDE: Record<string, number> = {
  '河南': 113.7, '河北': 114.5, '山东': 117.0, '山西': 112.5,
  '江苏': 118.8, '浙江': 120.2, '安徽': 117.3, '江西': 115.9,
  '福建': 119.3, '广东': 113.3, '广西': 108.3, '海南': 110.3,
  '四川': 104.1, '贵州': 106.7, '云南': 102.7, '湖南': 113.0,
  '湖北': 114.3, '陕西': 108.9, '甘肃': 103.8, '青海': 101.8,
  '黑龙江': 126.6, '吉林': 125.3, '辽宁': 123.4,
  '新疆': 87.6, '西藏': 91.1, '内蒙古': 111.7, '宁夏': 106.3,
  '台湾': 121.5,
};

const STANDARD_LONGITUDE = 120; // 中国标准子午线（北京时间）

/**
 * 根据地名查找经度
 */
export function lookupLongitude(location: string): number | null {
  if (!location) return null;
  
  // 精确匹配城市名
  for (const [city, lon] of Object.entries(CITY_LONGITUDE)) {
    if (location.includes(city)) return lon;
  }
  
  // 匹配省份名
  for (const [prov, lon] of Object.entries(PROVINCE_LONGITUDE)) {
    if (location.includes(prov)) return lon;
  }
  
  return null;
}

/**
 * 计算均时差（Equation of Time）
 * 太阳时与平太阳时的差值，单位：分钟
 */
function equationOfTime(dayOfYear: number): number {
  // 简化的均时差公式（精度约±15秒）
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

/**
 * 计算一年中的第几天
 */
function dayOfYear(year: number, month: number, day: number): number {
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let total = 0;
  for (let i = 1; i < month; i++) {
    total += daysInMonth[i];
  }
  total += day;
  // 闰年修正
  if (month > 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
    total += 1;
  }
  return total;
}

/**
 * 计算真太阳时
 * 
 * @param standardHour - 北京时间小时（0-23）
 * @param standardMinute - 北京时间分钟（0-59）
 * @param longitude - 出生地经度（东经）
 * @param year - 出生年
 * @param month - 出生月
 * @param day - 出生日
 * @returns 真太阳时的小时和分钟
 */
export function calculateTrueSolarTime(
  standardHour: number,
  standardMinute: number,
  longitude: number,
  year: number,
  month: number,
  day: number
): { hour: number; minute: number; isEarlyMorning: boolean } {
  // 1. 经度修正：每度差4分钟，东经大于120°则加，小于则减
  const longitudeDiff = longitude - STANDARD_LONGITUDE;
  const longitudeCorrection = longitudeDiff * 4; // 分钟

  // 2. 均时差修正
  const doy = dayOfYear(year, month, day);
  const eot = equationOfTime(doy);

  // 3. 合并修正
  const totalMinutes = standardHour * 60 + standardMinute + longitudeCorrection + eot;
  
  // 4. 处理跨日
  let adjustedMinutes = totalMinutes;
  let isEarlyMorning = false;
  
  if (adjustedMinutes < 0) {
    adjustedMinutes += 24 * 60;
    isEarlyMorning = true;
  } else if (adjustedMinutes >= 24 * 60) {
    adjustedMinutes -= 24 * 60;
  }

  const hour = Math.floor(adjustedMinutes / 60) % 24;
  const minute = Math.floor(adjustedMinutes % 60);

  return { hour, minute, isEarlyMorning };
}

/**
 * 根据真太阳时确定时辰
 * 23:00-01:00=子时, 01:00-03:00=丑时...
 */
export function getShichenFromTime(hour: number, minute: number): string {
  const totalMinutes = hour * 60 + minute;
  
  if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) return '子';
  if (totalMinutes >= 1 * 60 && totalMinutes < 3 * 60) return '丑';
  if (totalMinutes >= 3 * 60 && totalMinutes < 5 * 60) return '寅';
  if (totalMinutes >= 5 * 60 && totalMinutes < 7 * 60) return '卯';
  if (totalMinutes >= 7 * 60 && totalMinutes < 9 * 60) return '辰';
  if (totalMinutes >= 9 * 60 && totalMinutes < 11 * 60) return '巳';
  if (totalMinutes >= 11 * 60 && totalMinutes < 13 * 60) return '午';
  if (totalMinutes >= 13 * 60 && totalMinutes < 15 * 60) return '未';
  if (totalMinutes >= 15 * 60 && totalMinutes < 17 * 60) return '申';
  if (totalMinutes >= 17 * 60 && totalMinutes < 19 * 60) return '酉';
  if (totalMinutes >= 19 * 60 && totalMinutes < 21 * 60) return '戌';
  return '亥';
}
