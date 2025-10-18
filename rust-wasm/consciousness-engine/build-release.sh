#!/bin/bash
# Build script for production release
# Usage: ./build-release.sh [profile]
# Profiles: release (default), release-small, release-perf

set -e

PROFILE="${1:-release}"
echo "🚀 Building consciousness-engine for production..."
echo "Profile: $PROFILE"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cargo clean
rm -rf pkg/

# Build with wasm-pack
echo "🔨 Building WASM module..."
if [ "$PROFILE" = "release-small" ]; then
    wasm-pack build --target nodejs --$PROFILE
elif [ "$PROFILE" = "release-perf" ]; then
    wasm-pack build --target nodejs --release
else
    wasm-pack build --target nodejs --release
fi

# Display binary size
echo ""
echo "📊 Binary size:"
ls -lh pkg/*.wasm | awk '{print "  " $9 ": " $5}'

# Run tests
echo ""
echo "🧪 Running tests..."
cargo test --release

# Verify package
echo ""
echo "✅ Package contents:"
ls -la pkg/

echo ""
echo "🎉 Build complete! Package ready in pkg/"
