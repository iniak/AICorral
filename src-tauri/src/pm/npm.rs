use anyhow::Context;
use super::{PackageManager, Operation, run_streamed};

pub struct NpmManager;

impl NpmManager {
    /// On Windows, .cmd files must be run through cmd.exe.
    fn npm_cmd() -> std::process::Command {
        if cfg!(target_os = "windows") {
            let mut c = std::process::Command::new("cmd");
            c.args(["/c", "npm"]);
            c
        } else {
            std::process::Command::new("npm")
        }
    }
}

impl PackageManager for NpmManager {
    fn name(&self) -> &'static str { "npm" }

    fn is_available(&self) -> bool {
        which::which("npm").is_ok()
    }

    fn latest_version(&self, package: &str) -> anyhow::Result<String> {
        let settings = crate::settings::load();
        let mut cmd = Self::npm_cmd();
        cmd.args(["view", package, "version", "--json"]);
        let registry = settings.npm_registry.trim();
        if !registry.is_empty() {
            cmd.args(["--registry", registry]);
        }
        settings.apply_proxy_env(&mut cmd);
        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        }
        let output = cmd.output().context("failed to run npm view")?;
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow::anyhow!("npm view failed for {}: {}", package, stderr.trim()));
        }
        let raw = String::from_utf8_lossy(&output.stdout);
        let version = raw.trim().trim_matches('"').to_string();
        Ok(version)
    }

    fn run_operation(&self, op: Operation, package: &str, on_line: &dyn Fn(String)) -> anyhow::Result<()> {
        let settings = crate::settings::load();
        let mut cmd = Self::npm_cmd();
        match op {
            Operation::Install   => cmd.args(["install", "-g", package]),
            Operation::Upgrade   => cmd.args(["install", "-g", &format!("{}@latest", package)]),
            Operation::Uninstall => cmd.args(["uninstall", "-g", package]),
        };
        let registry = settings.npm_registry.trim();
        if !registry.is_empty() {
            cmd.args(["--registry", registry]);
        }
        settings.apply_proxy_env(&mut cmd);
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
