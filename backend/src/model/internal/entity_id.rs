use serde::de::{Error, Visitor};
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt::Formatter;


#[derive(Eq, PartialEq, Debug, Copy, Clone)]
pub struct EntityId(pub i64);

impl Serialize for EntityId {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.0.to_string())
    }
}

impl<'de> Deserialize<'de> for EntityId {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct IdVisitor;
        impl<'v> Visitor<'v> for IdVisitor {
            type Value = EntityId;

            fn expecting(&self, formatter: &mut Formatter) -> std::fmt::Result {
                write!(formatter, "expected string id")
            }

            fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
            where
                E: Error,
            {
                v.parse::<i64>()
                    .map_err(|_| E::custom("expected i64"))
                    .map(EntityId)
            }

            fn visit_borrowed_str<E>(self, v: &'v str) -> Result<Self::Value, E>
            where
                E: Error,
            {
                v.parse::<i64>()
                    .map_err(|_| E::custom("expected i64"))
                    .map(EntityId)
            }

            fn visit_string<E>(self, v: String) -> Result<Self::Value, E>
            where
                E: Error,
            {
                v.parse::<i64>()
                    .map_err(|_| E::custom("expected i64"))
                    .map(EntityId)
            }
        }

        deserializer.deserialize_any(IdVisitor)
    }
}

impl From<i64> for EntityId {
    fn from(value: i64) -> Self {
        Self(value)
    }
}

impl From<EntityId> for i64 {
    fn from(value: EntityId) -> Self {
        value.0
    }
}

pub struct OptionEntityId(pub Option<EntityId>);

impl From<Option<EntityId>> for OptionEntityId {
    fn from(value: Option<EntityId>) -> Self {
        OptionEntityId(value)
    }
}

impl From<OptionEntityId> for Option<i64> {
    fn from(value: OptionEntityId) -> Self {
        value.0.map(|v| v.0)
    }
}

impl <'de> Deserialize<'de> for OptionEntityId {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct IdVisitor;
        impl<'v> Visitor<'v> for IdVisitor {
            type Value = OptionEntityId;

            fn expecting(&self, formatter: &mut Formatter) -> std::fmt::Result {
                write!(formatter, "expected string id")
            }

            fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
            where
                E: Error,
            {
                v.parse::<i64>()
                    .map_err(|_| E::custom("expected i64"))
                    .map(|v| OptionEntityId(Some(EntityId(v))))
            }
        }

        deserializer.deserialize_any(IdVisitor)
    }
}
