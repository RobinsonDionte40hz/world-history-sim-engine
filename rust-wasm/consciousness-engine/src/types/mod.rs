//! Core type definitions for the consciousness engine

pub mod character;
pub mod consciousness;
pub mod memory;
pub mod interaction;
pub mod events;
pub mod decision;
pub mod error;

pub use character::*;
pub use consciousness::*;
pub use memory::*;
pub use interaction::*;
pub use events::*;
pub use decision::*;
pub use error::*;