//! Data serialization utilities for WASM interface

use wasm_bindgen::prelude::*;
use crate::types::error::ConsciousnessError;
use crate::Result;

/// Serialize data to JavaScript value
pub fn serialize_to_js<T: serde::Serialize>(data: &T) -> Result<JsValue> {
    serde_wasm_bindgen::to_value(data)
        .map_err(|e| ConsciousnessError::SerializationError {
            message: e.to_string(),
        })
}

/// Deserialize data from JavaScript value
pub fn deserialize_from_js<T: for<'de> serde::Deserialize<'de>>(js_value: &JsValue) -> Result<T> {
    serde_wasm_bindgen::from_value(js_value.clone())
        .map_err(|e| ConsciousnessError::SerializationError {
            message: e.to_string(),
        })
}