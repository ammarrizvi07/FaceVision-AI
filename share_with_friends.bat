@echo off
title FaceVision AI - Public Share Link
color 0B

echo =====================================================================
echo           FaceVision AI - Share Live Link With Friends
echo =====================================================================
echo.
echo Connecting to secure tunnel...
echo A public HTTPS link will appear below (e.g. https://xxxx.lhr.life).
echo Share that HTTPS link with your friends!
echo (Keep this window open while your friends are using the app)
echo.

:loop
ssh -R 80:127.0.0.1:5173 -o ServerAliveInterval=30 -o ServerAliveCountMax=5 -o StrictHostKeyChecking=no nokey@localhost.run
echo.
echo [INFO] Tunnel disconnected. Reconnecting in 3 seconds...
timeout /t 3 >nul
goto loop
