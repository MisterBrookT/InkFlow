// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
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

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_notes,
            save_notes,
            load_notebooks,
            save_notebooks
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
