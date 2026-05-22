use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub npm_registry: String,
    pub pip_index_url: String,
    pub http_proxy: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            npm_registry: "https://registry.npmjs.org".into(),
            pip_index_url: "https://pypi.org/simple".into(),
            http_proxy: String::new(),
        }
    }
}

fn settings_path() -> PathBuf {
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("aicorral")
        .join("settings.json")
}

pub fn load() -> Settings {
    let path = settings_path();
    std::fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn save(settings: &Settings) -> anyhow::Result<()> {
    let path = settings_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let json = serde_json::to_string_pretty(settings)?;
    std::fs::write(&path, json)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_settings_have_npmjs_registry() {
        let s = Settings::default();
        assert_eq!(s.npm_registry, "https://registry.npmjs.org");
    }

    #[test]
    fn settings_roundtrip_json() {
        let s = Settings { npm_registry: "https://custom.registry".into(), ..Settings::default() };
        let json = serde_json::to_string(&s).unwrap();
        let back: Settings = serde_json::from_str(&json).unwrap();
        assert_eq!(back.npm_registry, "https://custom.registry");
    }
}
