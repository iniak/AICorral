use anyhow::Context;
use super::{PackageManager, Operation, run_streamed};

pub struct BrewManager;

impl PackageManager for BrewManager {
    fn name(&self) -> &'static str { "brew" }

    fn is_available(&self) -> bool {
        which::which("brew").is_ok()
    }

    fn latest_version(&self, package: &str) -> anyhow::Result<String> {
        let settings = crate::settings::load();
        let formula = package.split('/').last().unwrap_or(package);
        let url = format!("https://formulae.brew.sh/api/formula/{}.json", formula);
        let resp: serde_json::Value = settings.http_client()?
            .get(&url)
            .send()
            .context("failed to reach Homebrew API")?
            .json()
            .context("invalid Homebrew response")?;
        let version = resp["versions"]["stable"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("no stable version in Homebrew response"))?
            .to_string();
        Ok(version)
    }

    fn run_operation(&self, op: Operation, package: &str, on_line: &dyn Fn(String)) -> anyhow::Result<()> {
        let settings = crate::settings::load();
        let mut cmd = std::process::Command::new("brew");
        match op {
            Operation::Install   => cmd.args(["install", package]),
            Operation::Upgrade   => cmd.args(["upgrade", package]),
            Operation::Uninstall => cmd.args(["uninstall", package]),
        };
        settings.apply_proxy_env(&mut cmd);
        run_streamed(cmd, on_line)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn brew_manager_name() {
        assert_eq!(BrewManager.name(), "brew");
    }

    #[test]
    fn brew_not_available_on_windows() {
        #[cfg(target_os = "windows")]
        assert!(!BrewManager.is_available());
    }
}
