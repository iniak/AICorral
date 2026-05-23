use std::collections::HashMap;
use tauri::{AppHandle, Emitter};
use crate::catalog::{self, CatalogEntry, CatalogSource};
use crate::detect::{self, InstalledState};
use crate::pm::{PackageManager, NpmManager, PipManager, BrewManager};

#[tauri::command]
pub fn list_catalog() -> Result<Vec<CatalogEntry>, String> {
    catalog::load_catalog().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn detect_installed() -> Result<Vec<InstalledState>, String> {
    let entries = catalog::load_catalog().map_err(|e| e.to_string())?;
    let states = tokio::task::spawn_blocking(move || {
        entries.iter().map(|e| detect::detect_cli(e)).collect::<Vec<_>>()
    })
    .await
    .map_err(|e| e.to_string())?;
    Ok(states)
}

pub fn manager_for_source(source: &CatalogSource) -> Option<Box<dyn PackageManager>> {
    match source.manager.as_str() {
        "npm"  => Some(Box::new(NpmManager)),
        "pip"  => Some(Box::new(PipManager)),
        "brew" => Some(Box::new(BrewManager)),
        _      => None,
    }
}

fn current_os() -> &'static str {
    if cfg!(target_os = "windows") { "windows" }
    else if cfg!(target_os = "macos") { "macos" }
    else { "linux" }
}

#[tauri::command]
pub async fn check_latest(ids: Vec<String>) -> Result<HashMap<String, String>, String> {
    let entries = catalog::load_catalog().map_err(|e| e.to_string())?;
    let os = current_os();

    let results = tokio::task::spawn_blocking(move || {
        let mut map = HashMap::new();
        for entry in entries.iter().filter(|e| ids.contains(&e.id)) {
            let source = entry.sources.iter()
                .find(|s| s.os.iter().any(|o| o == os));
            if let Some(src) = source {
                if let Some(mgr) = manager_for_source(src) {
                    if let Ok(v) = mgr.latest_version(&src.package) {
                        map.insert(entry.id.clone(), v);
                    }
                }
            }
        }
        map
    })
    .await
    .map_err(|e| e.to_string())?;

    Ok(results)
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgressEvent {
    pub id: String,
    pub line: String,
    pub phase: String,
}

fn run_cli_op(
    app: AppHandle,
    id: String,
    op: crate::pm::Operation,
) -> anyhow::Result<()> {
    let entries = catalog::load_catalog()?;
    let os = current_os();
    let entry = entries.into_iter().find(|e| e.id == id)
        .ok_or_else(|| anyhow::anyhow!("CLI not found: {}", id))?;
    let source = entry.sources.iter()
        .find(|s| s.os.iter().any(|o| o == os))
        .ok_or_else(|| anyhow::anyhow!("No source for this OS"))?;
    let mgr = manager_for_source(source)
        .ok_or_else(|| anyhow::anyhow!("Unknown manager: {}", source.manager))?;

    let app_clone = app.clone();
    let id_clone = id.clone();
    let result = mgr.run_operation(op, &source.package, &move |line| {
        let _ = app_clone.emit("op-progress", ProgressEvent {
            id: id_clone.clone(),
            line,
            phase: "running".into(),
        });
    });

    if let Err(err) = result {
        let message = err.to_string();
        let _ = app.emit("op-progress", ProgressEvent {
            id,
            line: message,
            phase: "error".into(),
        });
        return Err(err);
    }

    app.emit("op-progress", ProgressEvent {
        id,
        line: String::new(),
        phase: "done".into(),
    })?;
    Ok(())
}

#[tauri::command]
pub async fn install_cli(id: String, app: AppHandle) -> Result<(), String> {
    tokio::task::spawn_blocking(move || run_cli_op(app, id, crate::pm::Operation::Install))
        .await.map_err(|e| e.to_string())?.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn upgrade_cli(id: String, app: AppHandle) -> Result<(), String> {
    tokio::task::spawn_blocking(move || run_cli_op(app, id, crate::pm::Operation::Upgrade))
        .await.map_err(|e| e.to_string())?.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn uninstall_cli(id: String, app: AppHandle) -> Result<(), String> {
    tokio::task::spawn_blocking(move || run_cli_op(app, id, crate::pm::Operation::Uninstall))
        .await.map_err(|e| e.to_string())?.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn launch_cli(id: String) -> Result<(), String> {
    let entries = catalog::load_catalog().map_err(|e| e.to_string())?;
    let entry = entries.into_iter().find(|e| e.id == id)
        .ok_or_else(|| format!("CLI not found: {}", id))?;
    crate::launch::launch(&entry.launch_cmd).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn run_doctor() -> Result<Vec<crate::doctor::DoctorCheck>, String> {
    tokio::task::spawn_blocking(crate::doctor::run_doctor)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_settings() -> crate::settings::Settings {
    crate::settings::load()
}

#[tauri::command]
pub fn set_settings(settings: crate::settings::Settings) -> Result<(), String> {
    crate::settings::save(&settings).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use crate::catalog::CatalogSource;
    use super::manager_for_source;

    #[test]
    fn npm_source_gives_npm_manager() {
        let src = CatalogSource {
            manager: "npm".into(),
            package: "@foo/bar".into(),
            os: vec!["windows".into(), "macos".into(), "linux".into()],
        };
        let mgr = manager_for_source(&src);
        assert!(mgr.is_some());
        assert_eq!(mgr.unwrap().name(), "npm");
    }

    #[test]
    fn unknown_manager_returns_none() {
        let src = CatalogSource {
            manager: "chocolatey".into(),
            package: "foo".into(),
            os: vec!["windows".into()],
        };
        assert!(manager_for_source(&src).is_none());
    }
}
