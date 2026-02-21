// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Note {
    id: String,
    title: String,
    content: String,
    #[serde(rename = "notebookId")]
    notebook_id: String,
    tags: Vec<String>,
    status: String,
    pinned: bool,
    #[serde(rename = "createdAt")]
    created_at: i64,
    #[serde(rename = "updatedAt")]
    updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct Notebook {
    id: String,
    name: String,
    color: String,
}

fn get_data_dir() -> PathBuf {
    let home = dirs::home_dir().expect("Failed to get home directory");
    home.join(".inkflow").join("data")
}

fn get_notes_path() -> PathBuf {
    get_data_dir().join("notes.json")
}

fn get_notebooks_path() -> PathBuf {
    get_data_dir().join("notebooks.json")
}

fn get_sync_dir() -> PathBuf {
    get_data_dir().join("sync")
}

fn ensure_data_dir() {
    let dir = get_data_dir();
    if !dir.exists() {
        fs::create_dir_all(&dir).expect("Failed to create data directory");
    }
}

#[tauri::command]
fn load_notes() -> Result<String, String> {
    ensure_data_dir();
    let path = get_notes_path();
    if !path.exists() {
        return Err("Notes file not found".to_string());
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_notes(notes_json: String) -> Result<(), String> {
    ensure_data_dir();
    let path = get_notes_path();
    fs::write(&path, notes_json).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_notebooks() -> Result<String, String> {
    ensure_data_dir();
    let path = get_notebooks_path();
    if !path.exists() {
        return Err("Notebooks file not found".to_string());
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_notebooks(notebooks_json: String) -> Result<(), String> {
    ensure_data_dir();
    let path = get_notebooks_path();
    fs::write(&path, notebooks_json).map_err(|e| e.to_string())
}

// Export notes as markdown files for GitHub sync
#[tauri::command]
fn export_notes_as_markdown(notes_json: String) -> Result<String, String> {
    let notes: Vec<Note> = serde_json::from_str(&notes_json).map_err(|e| e.to_string())?;
    let sync_dir = get_sync_dir();
    fs::create_dir_all(&sync_dir).map_err(|e| e.to_string())?;
    
    // Clear existing files
    if sync_dir.exists() {
        for entry in fs::read_dir(&sync_dir).map_err(|e| e.to_string())? {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.extension().map_or(false, |ext| ext == "md") {
                    fs::remove_file(&path).ok();
                }
            }
        }
    }
    
    // Export each note
    for note in notes {
        let filename = format!("{}.md", sanitize_filename(&note.title));
        let filepath = sync_dir.join(&filename);
        let frontmatter = format!(
            "---\nid: {}\nnotebook: {}\nstatus: {}\npinned: {}\ntags: {}\ncreated: {}\nupdated: {}\n---\n\n",
            note.id,
            note.notebook_id,
            note.status,
            note.pinned,
            note.tags.join(", "),
            note.created_at,
            note.updated_at
        );
        let content = format!("{}# {}\n\n{}", frontmatter, note.title, note.content);
        fs::write(&filepath, content).map_err(|e| e.to_string())?;
    }
    
    Ok(sync_dir.to_string_lossy().to_string())
}

// Git operations for GitHub sync
#[tauri::command]
fn git_status(repo_path: String) -> Result<String, String> {
    let output = Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn git_add_all(repo_path: String) -> Result<String, String> {
    let output = Command::new("git")
        .args(["add", "."])
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;
    
    if output.status.success() {
        Ok("Files staged".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn git_commit(repo_path: String, message: String) -> Result<String, String> {
    let output = Command::new("git")
        .args(["commit", "-m", &message])
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        // Check if it's "nothing to commit"
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        if stderr.contains("nothing to commit") {
            Ok("Nothing to commit".to_string())
        } else {
            Err(stderr)
        }
    }
}

#[tauri::command]
fn git_push(repo_path: String) -> Result<String, String> {
    let output = Command::new("git")
        .args(["push"])
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;
    
    if output.status.success() {
        Ok("Pushed successfully".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn git_pull(repo_path: String) -> Result<String, String> {
    let output = Command::new("git")
        .args(["pull"])
        .current_dir(&repo_path)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .take(100)
        .collect()
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_notes,
            save_notes,
            load_notebooks,
            save_notebooks,
            export_notes_as_markdown,
            git_status,
            git_add_all,
            git_commit,
            git_push,
            git_pull
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
