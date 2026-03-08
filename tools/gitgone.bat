@echo off
REM gitgone - simple helper to add, commit and push current branch (Windows)
REM Usage: tools\gitgone.bat "Commit message"

REM ensure we are inside a git repo
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo Not a git repository. Run this from your project root.
  exit /b 1
)

setlocal enabledelayedexpansion
if "%~1"=="" (
  set msg=update
) else (
  set msg=%*
)

echo Staging all changes...
git add -A

REM Check if there are any staged changes
git diff --cached --quiet
if not errorlevel 1 (
  echo No changes to commit.
  exit /b 0
)

echo Committing with message: "%msg%"
git commit -m "%msg%"
if errorlevel 1 (
  echo Commit failed.
  exit /b 1
)

REM Get current branch
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%b
echo Pushing branch %BRANCH% to origin...
git push origin %BRANCH%
if errorlevel 1 (
  echo Push failed. Please check remote and authentication.
  exit /b 1
)

echo Done.
endlocal
