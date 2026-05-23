use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogSource {
    pub manager: String,
    pub package: String,
    pub os: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogEntry {
    pub id: String,
    pub name: String,
    pub vendor: String,
    pub mono: String,
    pub hue: u16,
    pub description: String,
    pub tags: Vec<String>,
    pub launch_cmd: String,
    pub runtime: String,
    pub sources: Vec<CatalogSource>,
}

static CATALOG_JSON: &str = include_str!("../../catalog.json");

pub fn load_catalog() -> anyhow::Result<Vec<CatalogEntry>> {
    let entries: Vec<CatalogEntry> = serde_json::from_str(CATALOG_JSON)?;
    Ok(entries)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn catalog_loads_with_correct_count() {
        let entries = load_catalog().unwrap();
        assert_eq!(entries.len(), 29);
    }

    #[test]
    fn claude_code_entry_has_npm_source() {
        let entries = load_catalog().unwrap();
        let cc = entries.iter().find(|e| e.id == "claude-code").unwrap();
        assert_eq!(cc.sources[0].manager, "npm");
        assert_eq!(cc.sources[0].package, "@anthropic-ai/claude-code");
        assert!(cc.sources[0].os.contains(&"windows".to_string()));
    }

    #[test]
    fn goose_is_unavailable_on_windows() {
        let entries = load_catalog().unwrap();
        let goose = entries.iter().find(|e| e.id == "goose").unwrap();
        let has_windows = goose.sources.iter().any(|s| s.os.contains(&"windows".to_string()));
        assert!(!has_windows);
    }
}
