pub fn terminal_command(cmd: &str) -> Option<(String, Vec<String>)> {
    if cfg!(target_os = "windows") {
        windows_terminal(cmd)
    } else if cfg!(target_os = "macos") {
        macos_terminal(cmd)
    } else {
        linux_terminal(cmd)
    }
}

fn windows_terminal(cmd: &str) -> Option<(String, Vec<String>)> {
    if which::which("wt").is_ok() {
        Some(("wt".into(), vec!["new-tab".into(), "cmd".into(), "/k".into(), cmd.to_string()]))
    } else {
        Some(("cmd".into(), vec!["/c".into(), "start".into(), "cmd".into(), "/k".into(), cmd.to_string()]))
    }
}

fn macos_terminal(cmd: &str) -> Option<(String, Vec<String>)> {
    let script = format!(
        r#"tell application "Terminal" to do script "{}""#,
        cmd.replace('"', r#"\""#)
    );
    Some(("osascript".into(), vec!["-e".into(), script]))
}

fn linux_terminal(cmd: &str) -> Option<(String, Vec<String>)> {
    for term in &["x-terminal-emulator", "gnome-terminal", "konsole", "xterm"] {
        if which::which(term).is_ok() {
            let args = if *term == "gnome-terminal" {
                vec!["--".into(), "bash".into(), "-c".into(), format!("{}; exec bash", cmd)]
            } else {
                vec!["-e".into(), cmd.to_string()]
            };
            return Some((term.to_string(), args));
        }
    }
    None
}

pub fn launch(cmd: &str) -> anyhow::Result<()> {
    let (program, args) = terminal_command(cmd)
        .ok_or_else(|| anyhow::anyhow!("No terminal emulator found"))?;
    std::process::Command::new(&program)
        .args(&args)
        .spawn()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn terminal_command_returns_some() {
        let result = terminal_command("echo hello");
        assert!(result.is_some());
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn windows_uses_cmd_or_wt() {
        let (prog, _) = terminal_command("claude").unwrap();
        assert!(prog == "wt" || prog == "cmd");
    }
}
