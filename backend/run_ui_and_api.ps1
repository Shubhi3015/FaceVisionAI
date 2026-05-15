param(
    [string]$UiPath = "C:\Users\shubh\Downloads\skin (2)\skin\skin",
    [string]$UiBuildDirName = "dist",
    [string]$PythonVenv = ".venv310",
    [int]$Port = 8000
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

if (-not (Test-Path $UiPath)) {
    Throw "UI path '$UiPath' does not exist. Pass a valid frontend path when calling this script."
}

$resolvedUiPath = Resolve-Path $UiPath
$buildPath = Join-Path $resolvedUiPath $UiBuildDirName
$env:UI_BUILD_DIR = $buildPath

Write-Host "Building UI from $resolvedUiPath"
Push-Location $resolvedUiPath
npm run build
Pop-Location

$pythonExe = Join-Path $scriptDir "$PythonVenv\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
    $fallbacks = @(".venv310", ".venv", "venv")
    foreach ($candidateVenv in $fallbacks) {
        $candidate = Join-Path $scriptDir "$candidateVenv\Scripts\python.exe"
        if (Test-Path $candidate) {
            $pythonExe = $candidate
            break
        }
    }
}

if (-not (Test-Path $pythonExe)) {
    Throw "Could not find a Python executable in .venv310, .venv, or venv. Create a working virtual environment before running this script."
}

Write-Host "Starting API with UI_BUILD_DIR=$buildPath"
Write-Host "Using Python executable: $pythonExe"
Push-Location $scriptDir
& $pythonExe -m uvicorn api:app --app-dir $scriptDir --host 0.0.0.0 --port $Port
Pop-Location
