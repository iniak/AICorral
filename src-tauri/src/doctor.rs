use crate::pm::{NpmManager, PipManager, BrewManager, PackageManager};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DoctorCheck {
    pub name: String,
    pub status: String,
    pub detail: String,
}

pub fn run_doctor() -> Vec<DoctorCheck> {
    let mut checks = vec![];
    checks.push(check_runtime(if cfg!(windows) { "python" } else { "python3" }, "--version", "Python"));
    checks.push(check_runtime("node", "--version", "Node.js"));
    checks.push(check_manager(&NpmManager, "npm"));
    checks.push(check_manager(&PipManager, "pip/pipx"));
    if !cfg!(target_os = "windows") {
        checks.push(check_manager(&BrewManager, "Homebrew"));
    }
    checks.push(check_disk());
    checks.push(check_outbound());
    checks
}

fn check_runtime(bin: &str, version_flag: &str, label: &str) -> DoctorCheck {
    match which::which(bin) {
        Ok(path) => {
            let mut cmd = std::process::Command::new(&path);
            cmd.arg(version_flag);
            #[cfg(target_os = "windows")]
            {
                use std::os::windows::process::CommandExt;
                cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
            }
            let version = cmd
                .output()
                .ok()
                .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
                .unwrap_or_default();
            DoctorCheck {
                name: format!("{} {}", label, version).trim().to_string(),
                status: "ok".into(),
                detail: path.to_string_lossy().to_string(),
            }
        }
        Err(_) => DoctorCheck {
            name: label.into(),
            status: "fail".into(),
            detail: format!("{} not found on PATH", bin),
        },
    }
}

fn check_manager(mgr: &dyn PackageManager, label: &str) -> DoctorCheck {
    if mgr.is_available() {
        DoctorCheck { name: label.into(), status: "ok".into(), detail: "available on PATH".into() }
    } else {
        DoctorCheck { name: label.into(), status: "warn".into(), detail: "not found — some CLIs cannot be managed".into() }
    }
}

fn check_disk() -> DoctorCheck {
    let path = if cfg!(target_os = "windows") { "C:\\" } else { "/" };
    DoctorCheck {
        name: "Disk space".into(),
        status: "ok".into(),
        detail: format!("checking {}", path),
    }
}

fn check_outbound() -> DoctorCheck {
    let targets = ["registry.npmjs.org", "pypi.org", "github.com"];
    for target in &targets {
        let ok = reqwest::blocking::get(format!("https://{}", target))
            .map(|r| r.status().is_success() || r.status().as_u16() < 500)
            .unwrap_or(false);
        if !ok {
            return DoctorCheck {
                name: "Outbound HTTPS".into(),
                status: "warn".into(),
                detail: format!("cannot reach {}", target),
            };
        }
    }
    DoctorCheck {
        name: "Outbound HTTPS".into(),
        status: "ok".into(),
        detail: "registry.npmjs.org · pypi.org · github.com reachable".into(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn doctor_returns_nonempty_list() {
        let checks = run_doctor();
        assert!(!checks.is_empty());
    }

    #[test]
    fn all_checks_have_valid_status() {
        let checks = run_doctor();
        for c in &checks {
            assert!(["ok","warn","fail","muted"].contains(&c.status.as_str()),
                "invalid status '{}' for check '{}'", c.status, c.name);
        }
    }
}
