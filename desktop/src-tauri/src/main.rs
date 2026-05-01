mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::save_ai_config,
            commands::load_ai_config,
            commands::save_user_data,
            commands::load_user_data,
            commands::validate_api_key,
            commands::run_divination,
            commands::get_classics,
            commands::get_lunar_info,
        ])
        .run(tauri::generate_context!())
        .expect("启动应用失败");
}