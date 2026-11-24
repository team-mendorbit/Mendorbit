@echo off
title Mendorbit - Auto Blog Synchronizer
echo ===================================================
echo   Mendorbit Static Blog Auto-Indexer (0ms Engine)
echo ===================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\sync-blogs.ps1"
echo.
echo ===================================================
echo   Done! All blogs updated instantly.
echo ===================================================
pause
