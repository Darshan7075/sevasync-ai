@echo off
echo 🛡️ SEVASYNC-AI TACTICAL SYNC INITIATED...
git add .
if "%~1"=="" (
    git commit -m "Tactical Update: Command Center Synchronization"
) else (
    git commit -m "%~1"
)
echo 🚀 UPLOADING TO MISSION CONTROL (GITHUB)...
git push origin main
echo ✅ SYNC COMPLETE. Vercel deployment triggered.
pause
