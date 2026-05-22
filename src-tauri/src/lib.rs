pub mod catalog;
pub mod pm;
pub mod detect;
pub mod commands;
pub mod launch;
pub mod doctor;
pub mod settings;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::list_catalog,
            commands::detect_installed,
            commands::check_latest,
            commands::install_cli,
            commands::upgrade_cli,
            commands::uninstall_cli,
            commands::launch_cli,
            commands::run_doctor,
            commands::get_settings,
            commands::set_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
