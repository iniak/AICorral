pub mod npm;
pub mod pip;
pub mod brew;

pub use npm::NpmManager;
pub use pip::PipManager;
pub use brew::BrewManager;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Operation {
    Install,
    Upgrade,
    Uninstall,
}

pub trait PackageManager: Send + Sync {
    fn name(&self) -> &'static str;
    fn is_available(&self) -> bool;
    fn latest_version(&self, package: &str) -> anyhow::Result<String>;
    fn run_operation(
        &self,
        op: Operation,
        package: &str,
        on_line: &dyn Fn(String),
    ) -> anyhow::Result<()>;
}

pub fn run_streamed(
    mut cmd: std::process::Command,
    on_line: &dyn Fn(String),
) -> anyhow::Result<()> {
    use std::io::{BufRead, BufReader};

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    let mut child = cmd
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()?;

    if let Some(stdout) = child.stdout.take() {
        for line in BufReader::new(stdout).lines().flatten() {
            on_line(line);
        }
    }
    if let Some(stderr) = child.stderr.take() {
        for line in BufReader::new(stderr).lines().flatten() {
            on_line(line);
        }
    }

    let status = child.wait()?;
    if status.success() {
        Ok(())
    } else {
        Err(anyhow::anyhow!("process exited with status {}", status))
    }
}
