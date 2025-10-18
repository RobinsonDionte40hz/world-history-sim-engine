#!/bin/bash

# Binary Size Analysis Script for WASM Consciousness Engine
# Requires: twiggy (cargo install twiggy)

set -e

echo "🔍 WASM Binary Size Analysis"
echo "=============================="
echo ""

# Check if twiggy is installed
if ! command -v twiggy &> /dev/null; then
    echo "❌ twiggy not found. Installing..."
    cargo install twiggy
    echo "✅ twiggy installed"
    echo ""
fi

WASM_FILE="../pkg/consciousness_engine_bg.wasm"

if [ ! -f "$WASM_FILE" ]; then
    echo "⚠️  WASM file not found. Building..."
    cd ..
    wasm-pack build --target nodejs --release
    cd consciousness-engine
    echo "✅ Build complete"
    echo ""
fi

# Get file size
FILE_SIZE=$(stat -f%z "$WASM_FILE" 2>/dev/null || stat -c%s "$WASM_FILE" 2>/dev/null)
FILE_SIZE_KB=$((FILE_SIZE / 1024))

echo "📦 Total Binary Size: ${FILE_SIZE_KB} KB (${FILE_SIZE} bytes)"
echo ""

# Analyze top functions by size
echo "📊 Top 20 Functions by Size:"
echo "----------------------------"
twiggy top -n 20 "$WASM_FILE"
echo ""

# Analyze dominators (what keeps large things in binary)
echo "🔗 Top 10 Dominators:"
echo "---------------------"
twiggy dominators -n 10 "$WASM_FILE"
echo ""

# Analyze by section
echo "📂 Size by Section:"
echo "-------------------"
twiggy top -n 20 --format json "$WASM_FILE" | jq -r '.items[] | "\(.name): \(.size) bytes"' | head -20
echo ""

# Generate detailed report
REPORT_FILE="binary-size-report.txt"
echo "📝 Generating detailed report..."

{
    echo "WASM Binary Size Analysis Report"
    echo "================================="
    echo "Generated: $(date)"
    echo "File: $WASM_FILE"
    echo "Size: ${FILE_SIZE_KB} KB (${FILE_SIZE} bytes)"
    echo ""
    echo "Top 50 Functions by Size:"
    echo "========================="
    twiggy top -n 50 "$WASM_FILE"
    echo ""
    echo "Top 20 Dominators:"
    echo "=================="
    twiggy dominators -n 20 "$WASM_FILE"
    echo ""
    echo "Code vs Data:"
    echo "============="
    twiggy top -n 100 "$WASM_FILE" | grep -E "(code|data)" || echo "No code/data breakdown available"
} > "$REPORT_FILE"

echo "✅ Report saved to: $REPORT_FILE"
echo ""

# Optimization suggestions
echo "💡 Optimization Opportunities:"
echo "------------------------------"

# Check for large standard library functions
STDLIB_SIZE=$(twiggy top -n 100 "$WASM_FILE" | grep -E "(std::|alloc::|core::)" | awk '{sum+=$1} END {print sum}')
if [ ! -z "$STDLIB_SIZE" ]; then
    echo "  • Standard library functions: ~${STDLIB_SIZE} bytes"
    echo "    → Consider replacing with custom implementations"
fi

# Check for panicking code
PANIC_SIZE=$(twiggy top -n 100 "$WASM_FILE" | grep -i "panic" | awk '{sum+=$1} END {print sum}')
if [ ! -z "$PANIC_SIZE" ]; then
    echo "  • Panic-related code: ~${PANIC_SIZE} bytes"
    echo "    → Use panic = 'abort' in Cargo.toml profile"
fi

# Check for formatting code
FORMAT_SIZE=$(twiggy top -n 100 "$WASM_FILE" | grep -E "(fmt::|format)" | awk '{sum+=$1} END {print sum}')
if [ ! -z "$FORMAT_SIZE" ]; then
    echo "  • Formatting code: ~${FORMAT_SIZE} bytes"
    echo "    → Minimize use of format! and println!"
fi

# Check for string operations
STRING_SIZE=$(twiggy top -n 100 "$WASM_FILE" | grep -E "(string|String)" | awk '{sum+=$1} END {print sum}')
if [ ! -z "$STRING_SIZE" ]; then
    echo "  • String operations: ~${STRING_SIZE} bytes"
    echo "    → Use &str instead of String where possible"
fi

echo ""
echo "🎯 Target: <300 KB (currently ${FILE_SIZE_KB} KB)"

if [ $FILE_SIZE_KB -lt 300 ]; then
    echo "✅ Target achieved!"
else
    REDUCTION_NEEDED=$((FILE_SIZE_KB - 300))
    echo "📉 Need to reduce by: ${REDUCTION_NEEDED} KB"
fi

echo ""
echo "Done! Use 'cargo bloat' for additional analysis."
