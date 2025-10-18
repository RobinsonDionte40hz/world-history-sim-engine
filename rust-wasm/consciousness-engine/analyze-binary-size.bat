@echo off
REM Binary Size Analysis Script for WASM Consciousness Engine (Windows)
REM Requires: twiggy (cargo install twiggy)

setlocal enabledelayedexpansion

echo ============================
echo  WASM Binary Size Analysis
echo ============================
echo.

REM Check if twiggy is installed
where twiggy >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] twiggy not found. Installing...
    cargo install twiggy
    echo [OK] twiggy installed
    echo.
)

set WASM_FILE=..\pkg\consciousness_engine_bg.wasm

if not exist "%WASM_FILE%" (
    echo [WARNING] WASM file not found. Building...
    cd ..
    call wasm-pack build --target nodejs --release
    cd consciousness-engine
    echo [OK] Build complete
    echo.
)

REM Get file size
for %%A in ("%WASM_FILE%") do set FILE_SIZE=%%~zA
set /a FILE_SIZE_KB=%FILE_SIZE% / 1024

echo [INFO] Total Binary Size: %FILE_SIZE_KB% KB (%FILE_SIZE% bytes)
echo.

REM Analyze top functions
echo ======================================
echo  Top 20 Functions by Size
echo ======================================
twiggy top -n 20 "%WASM_FILE%"
echo.

REM Analyze dominators
echo ======================================
echo  Top 10 Dominators
echo ======================================
twiggy dominators -n 10 "%WASM_FILE%"
echo.

REM Generate detailed report
set REPORT_FILE=binary-size-report.txt
echo [INFO] Generating detailed report...

(
    echo WASM Binary Size Analysis Report
    echo =================================
    echo Generated: %date% %time%
    echo File: %WASM_FILE%
    echo Size: %FILE_SIZE_KB% KB ^(%FILE_SIZE% bytes^)
    echo.
    echo Top 50 Functions by Size:
    echo =========================
    twiggy top -n 50 "%WASM_FILE%"
    echo.
    echo Top 20 Dominators:
    echo ==================
    twiggy dominators -n 20 "%WASM_FILE%"
) > "%REPORT_FILE%"

echo [OK] Report saved to: %REPORT_FILE%
echo.

echo ======================================
echo  Optimization Opportunities
echo ======================================
echo   * Standard library functions
echo     -^> Consider custom implementations
echo.
echo   * Panic-related code
echo     -^> Use panic = 'abort' in profile
echo.
echo   * Formatting code
echo     -^> Minimize format! and println!
echo.
echo   * String operations
echo     -^> Use ^&str instead of String
echo.

echo [TARGET] ^<300 KB (currently %FILE_SIZE_KB% KB)

if %FILE_SIZE_KB% LSS 300 (
    echo [OK] Target achieved!
) else (
    set /a REDUCTION_NEEDED=%FILE_SIZE_KB% - 300
    echo [INFO] Need to reduce by: !REDUCTION_NEEDED! KB
)

echo.
echo Done! Use 'cargo bloat' for additional analysis.
echo.
pause
