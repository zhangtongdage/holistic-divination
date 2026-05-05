use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ==================== 类型定义 ====================

#[derive(Debug, Serialize, Deserialize)]
pub struct AIConfig {
    pub mode: String,
    pub api_provider: String,
    pub api_key: String,
    pub api_base_url: Option<String>,
    pub model_name: Option<String>,
    pub timeout: u32,
    pub retry_count: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserData {
    pub name: Option<String>,
    pub birth_date: Option<String>,
    pub birth_hour: Option<String>,
    pub birth_place: Option<String>,
    pub gender: Option<String>,
    pub history: Vec<DivinationRecord>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DivinationRecord {
    pub id: String,
    pub timestamp: String,
    pub question: String,
    pub hexagram: String,
    pub result: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LunarInfoRequest {
    pub year: i32,
    pub month: i32,
    pub day: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LunarInfoResponse {
    pub lunar_year: i32,
    pub lunar_month: i32,
    pub lunar_day: i32,
    pub is_leap: bool,
    pub eight_characters: String,
}

// ==================== 本地存储路径 ====================

use std::path::PathBuf;

fn get_data_dir() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    let path = PathBuf::from(home).join(".holistic-divination");
    std::fs::create_dir_all(&path).ok();
    path
}

// ==================== Tauri 命令 ====================

#[tauri::command]
pub fn save_ai_config(config: AIConfig) -> Result<(), String> {
    let path = get_data_dir().join("ai_config.json");
    let json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_ai_config() -> Result<Option<AIConfig>, String> {
    let path = get_data_dir().join("ai_config.json");
    if !path.exists() {
        return Ok(None);
    }
    let json = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let config: AIConfig = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    Ok(Some(config))
}

#[tauri::command]
pub fn save_user_data(data: UserData) -> Result<(), String> {
    let path = get_data_dir().join("user_data.json");
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_user_data() -> Result<Option<UserData>, String> {
    let path = get_data_dir().join("user_data.json");
    if !path.exists() {
        return Ok(None);
    }
    let json = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let data: UserData = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    Ok(Some(data))
}

#[tauri::command]
pub fn validate_api_key(provider: String, api_key: String) -> Result<bool, String> {
    // 验证API密钥格式（最小长度检查）
    if api_key.len() < 10 {
        return Err("API密钥长度不足".to_string());
    }
    Ok(true)
}

#[tauri::command]
pub fn run_divination(context: String) -> Result<String, String> {
    // 调用核心引擎进行占卜
    // 实际会调用 Node.js 侧的核心逻辑
    Ok(format!("{{\"status\":\"pending\",\"context\":{}}}", context))
}

#[tauri::command]
pub fn get_classics() -> Result<String, String> {
    // 返回典籍目录列表
    let result = serde_json::json!({
        "total": 227,
        "books": [
            {"name": "周易", "count": 74},
            {"name": "焦氏易林", "count": 26},
            {"name": "火珠林", "count": 16},
            {"name": "梅花易数", "count": 14},
            {"name": "增删卜易", "count": 6},
            {"name": "卜筮正宗", "count": 5},
            {"name": "六壬大全", "count": 5},
            {"name": "奇门遁甲", "count": 5},
            {"name": "渊海子平", "count": 19},
            {"name": "三命通会", "count": 3},
            {"name": "滴天髓", "count": 21},
            {"name": "葬书", "count": 3},
            {"name": "撼龙经", "count": 3},
            {"name": "麻衣神相", "count": 3},
            {"name": "月波洞中记", "count": 3},
            {"name": "太玄经", "count": 3},
            {"name": "皇极经世", "count": 3},
            {"name": "五行大义", "count": 3}
        ]
    });
    Ok(result.to_string())
}

#[tauri::command]
pub fn get_lunar_info(year: i32, month: i32, day: i32) -> Result<String, String> {
    // 农历转换（简洁版，核心转换在TypeScript侧）
    let result = serde_json::json!({
        "solar_date": format!("{}-{:02}-{:02}", year, month, day),
        "status": "请使用核心引擎的农历转换模块",
    });
    Ok(result.to_string())
}