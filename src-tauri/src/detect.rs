use crate::catalog::CatalogEntry;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledState {
    pub id: String,
    pub installed: bool,
    pub current_version: Option<String>,
    pub binary_path: Option<String>,
    pub installed_at: Option<String>,
}

pub fn parse_version(output: &str) -> Option<String> {
    let re = regex::Regex::new(r"\d+\.\d+(?:\.\d+)*").unwrap();
    re.find(output).map(|m| m.as_str().to_string())
}

pub fn detect_cli(entry: &CatalogEntry) -> InstalledState {
    let path = match which::which(&entry.launch_cmd) {
        Ok(p) => p,
        Err(_) => return InstalledState {
            id: entry.id.clone(),
            installed: false,
            current_version: None,
            binary_path: None,
            installed_at: None,
        },
    };

    let mut version_cmd = std::process::Command::new(&path);
    version_cmd.arg("--version");
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        version_cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }
    let version = version_cmd
        .output()
        .ok()
        .and_then(|o| {
            let stdout = String::from_utf8_lossy(&o.stdout).to_string();
            let stderr = String::from_utf8_lossy(&o.stderr).to_string();
            parse_version(&stdout).or_else(|| parse_version(&stderr))
        });

    let installed_at = std::fs::metadata(&path)
        .ok()
        .and_then(|m| m.modified().ok())
        .map(|t| {
            let secs = t
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);
            time_to_date(secs)
        });

    InstalledState {
        id: entry.id.clone(),
        installed: true,
        current_version: version,
        binary_path: Some(path.to_string_lossy().to_string()),
        installed_at,
    }
}

fn time_to_date(unix_secs: u64) -> String {
    let days = unix_secs / 86400;
    let (y, m, d) = days_to_ymd(days);
    format!("{:04}-{:02}-{:02}", y, m, d)
}

fn days_to_ymd(mut days: u64) -> (u64, u64, u64) {
    let mut year = 1970u64;
    loop {
        let dy = if is_leap(year) { 366 } else { 365 };
        if days < dy { break; }
        days -= dy;
        year += 1;
    }
    let months = if is_leap(year) {
        [31,29,31,30,31,30,31,31,30,31,30,31]
    } else {
        [31,28,31,30,31,30,31,31,30,31,30,31]
    };
    let mut month = 1u64;
    for &dm in &months {
        if days < dm { break; }
        days -= dm;
        month += 1;
    }
    (year, month, days + 1)
}

fn is_leap(y: u64) -> bool { y % 4 == 0 && (y % 100 != 0 || y % 400 == 0) }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_version_standard_semver() {
        assert_eq!(parse_version("claude 1.0.45"), Some("1.0.45".into()));
    }

    #[test]
    fn parse_version_with_prefix() {
        assert_eq!(parse_version("Codex CLI v0.8.1\n"), Some("0.8.1".into()));
    }

    #[test]
    fn parse_version_no_match() {
        assert_eq!(parse_version("no version here"), None);
    }

    #[test]
    fn parse_version_prefers_first_match() {
        assert_eq!(parse_version("app 2.1.0 (build 100)"), Some("2.1.0".into()));
    }
}
