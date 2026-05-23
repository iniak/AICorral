use anyhow::Context;
use super::{PackageManager, Operation, run_streamed};

pub struct PipManager;

impl PipManager {
    fn executable() -> &'static str {
        if which::which("pipx").is_ok() { "pipx" }
        else if which::which("pip3").is_ok() { "pip3" }
        else { "pip" }
    }

    fn add_index_args(cmd: &mut std::process::Command, exe: &str, index_url: &str) {
        let index_url = index_url.trim();
        if index_url.is_empty() {
            return;
        }
        if exe == "pipx" {
            cmd.args(["--pip-args", &format!("--index-url {}", index_url)]);
        } else {
            cmd.args(["--index-url", index_url]);
        }
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
        let settings = crate::settings::load();
        let url = format!("https://pypi.org/pypi/{}/json", package);
        let resp: serde_json::Value = settings.http_client()?
            .get(&url)
            .send()
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
        let settings = crate::settings::load();
        let exe = Self::executable();
        let mut cmd = std::process::Command::new(exe);
        match op {
            Operation::Install   => {
                cmd.args(["install", package]);
                Self::add_index_args(&mut cmd, exe, &settings.pip_index_url);
            }
            Operation::Upgrade   => {
                if exe == "pipx" {
                    cmd.args(["upgrade", package]);
                } else {
                    cmd.args(["install", "--upgrade", "--user", package]);
                }
                Self::add_index_args(&mut cmd, exe, &settings.pip_index_url);
            }
            Operation::Uninstall => {
                if exe == "pipx" {
                    cmd.args(["uninstall", package]);
                } else {
                    cmd.args(["uninstall", "-y", package]);
                }
            }
        }
        if exe != "pipx" && matches!(op, Operation::Install) {
            cmd.arg("--user");
        }
        settings.apply_proxy_env(&mut cmd);
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
