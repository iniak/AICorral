use anyhow::Context;
use super::{PackageManager, Operation, run_streamed};

pub struct NpmManager;

impl PackageManager for NpmManager {
    fn name(&self) -> &'static str { "npm" }

    fn is_available(&self) -> bool {
        which::which("npm").is_ok()
    }

    fn latest_version(&self, package: &str) -> anyhow::Result<String> {
        let output = std::process::Command::new("npm")
            .args(["view", package, "version", "--json"])
            .output()
            .context("failed to run npm view")?;
        if !output.status.success() {
            return Err(anyhow::anyhow!("npm view failed for {}", package));
        }
        let raw = String::from_utf8_lossy(&output.stdout);
        let version = raw.trim().trim_matches('"').to_string();
        Ok(version)
    }

    fn run_operation(&self, op: Operation, package: &str, on_line: &dyn Fn(String)) -> anyhow::Result<()> {
        let mut cmd = std::process::Command::new("npm");
        match op {
            Operation::Install   => cmd.args(["install", "-g", package]),
            Operation::Upgrade   => cmd.args(["install", "-g", &format!("{}@latest", package)]),
            Operation::Uninstall => cmd.args(["uninstall", "-g", package]),
        };
        run_streamed(cmd, on_line)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn npm_manager_name() {
        assert_eq!(NpmManager.name(), "npm");
    }

    #[test]
    fn npm_is_available_returns_bool() {
        let _ = NpmManager.is_available();
    }
}
