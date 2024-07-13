use std::collections::HashSet;

#[repr(i16)]
#[derive(Clone, Copy, PartialEq)]
pub enum Role {
    User = 0,
    Admin = 1,
}

impl Role {
    pub fn by_id(num: i16) -> Role {
        match num {
            1 => Role::Admin,
            _ => Role::User,
        }
    }

    pub fn permissions(&self) -> HashSet<Permission> {
        match self {
            Role::Admin => {
                let mut permissions = HashSet::new();
                permissions.insert(Permission::CreateUser);
                permissions
            }
            Role::User => {
                let permissions = HashSet::new();
                permissions
            }
        }
    }

    pub fn has_permission(&self, permission: Permission) -> bool {
        self.permissions().contains(&permission)
    }

    pub fn has_permissions(&self, permissions: Vec<Permission>) -> bool {
        permissions
            .iter()
            .all(|permission| self.has_permission(*permission))
    }
}

#[repr(i16)]
#[derive(Clone, Copy, PartialEq, Hash, Eq)]
pub enum Permission {
    CreateUser,
}
