@echo off
REM Build script for production release (Windows)
REM Usage: build-release.bat [profile]
REM Profiles: release (default), release-small, release-perf

setlocal

set PROFILE=%1
if "%PROFILE%"=="" set PROFILE=release

echo.
echo 🚀 Building consciousness-engine for production...
echo Profile: %PROFILE%
echo.

REM Clean previous builds
echo 🧹 Cleaning previous builds...
cargo clean
if exist pkg rmdir /s /q pkg

REM Build with wasm-pack
echo 🔨 Building WASM module...
if "%PROFILE%"=="release-small" (
    wasm-pack build --target nodejs --%PROFILE%
) else if "%PROFILE%"=="release-perf" (
    wasm-pack build --target nodejs --release
) else (
    wasm-pack build --target nodejs --release
)

REM Display binary size
echo.
echo 📊 Binary size:
dir pkg\*.wasm | find ".wasm"

REM Run tests
echo.
echo 🧪 Running tests...
cargo test --release

REM Verify package
echo.
echo ✅ Package contents:
dir pkg

echo.
echo 🎉 Build complete! Package ready in pkg/
