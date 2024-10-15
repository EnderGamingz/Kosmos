use serde::Serialize;
use ts_rs::TS;

#[derive(Serialize, TS)]
#[ts(export)]
pub struct ZipInformation {
    pub name: String,
    pub folders: Vec<ZipInformation>,
    pub files: Vec<String>,
}

impl ZipInformation {
    pub fn new(name: &str) -> Self {
        ZipInformation {
            name: name.to_string(),
            folders: Vec::new(),
            files: Vec::new(),
        }
    }

    pub fn add_path(&mut self, path_parts: &[&str]) {
        if path_parts.is_empty() {
            return;
        }

        if path_parts.len() == 1 {
            if path_parts[0].is_empty() {
                return;
            }
            self.files.push(path_parts[0].to_string());
        } else {
            let folder_name = path_parts[0];
            let folder = self.folders.iter_mut().find(|f| f.name == folder_name);

            let folder = match folder {
                Some(f) => f,
                None => {
                    self.folders.push(ZipInformation::new(folder_name));
                    self.folders.last_mut().unwrap()
                }
            };

            folder.add_path(&path_parts[1..]);
        }
    }
}