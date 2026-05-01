/** 典籍条目类型 */
export interface ClassicEntry {
  title: string;           // 典籍名
  chapter?: string;        // 章节
  quote: string;           // 原文
  translation: string;     // 白话翻译
  relevance: number;       // 相关度（1-10）
  tags: string[];          // 标签
}

/** 典籍分类 */
export interface ClassicCategory {
  name: string;
  description: string;
  entries: ClassicEntry[];
}

/** 典籍库 */
export interface ClassicLibrary {
  categories: ClassicCategory[];
  getByTitle(title: string): ClassicEntry[];
  getByTag(tag: string): ClassicEntry[];
  search(keyword: string): ClassicEntry[];
}