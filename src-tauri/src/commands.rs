use std::collections::HashMap;
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
