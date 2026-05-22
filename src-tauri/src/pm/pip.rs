use anyhow::Context;
use super::{PackageManager, Operation, run_streamed};

pub struct PipManager;

impl PipManager {
    fn executable() -> &'static str {
        if which::which("pipx").is_ok() { "pipx" }
        else if which::which("pip3").is_ok() { "pip3" }
        else { "pip" }
    }
}

impl PackageManager for PipManager {
    fn name(&self) -> &'static str { "pip" }

    fn is_available(&self) -> bool {
        which::which("pipx").is_ok()
            || which::which("pip3").is_ok()
            || which::which("pip").is_ok()
    }

    fn latest_version(&self, package: &str) -> anyhow::Result<String> {
        let url = format!("https://pypi.org/pypi/{}/json", package);
        let resp: serde_json::Value = reqwest::blocking::get(&url)
            .context("failed to reach PyPI")?
            .json()
            .context("invalid PyPI response")?;
        let version = resp["info"]["version"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("no version in PyPI response"))?
            .to_string();
        Ok(version)
    }

    fn run_operation(&self, op: Operation, package: &str, on_line: &dyn Fn(String)) -> anyhow::Result<()> {
        let exe = Self::executable();
        let mut cmd = std::process::Command::new(exe);
        match op {
            Operation::Install   => { cmd.args(["install", package]); }
            Operation::Upgrade   => { cmd.args(["install", "--upgrade", package]); }
            Operation::Uninstall => {
                if exe == "pipx" {
                    cmd.args(["uninstall", package]);
                } else {
                    cmd.args(["uninstall", "-y", package]);
                }
            }
        }
        run_streamed(cmd, on_line)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pip_manager_name() {
        assert_eq!(PipManager.name(), "pip");
    }

    #[test]
    fn pip_executable_returns_string() {
        let exe = PipManager::executable();
        assert!(["pipx", "pip3", "pip"].contains(&exe));
    }
}
