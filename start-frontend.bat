@echo off
title Cliente Frontend - React Vite (Puerto 3000)
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
echo ============================================================
echo   BANCO TdeA - INICIANDO CLIENTE FRONTEND (REACT VITE)
echo ============================================================
echo Node version:
call node -v
echo NPM version:
call npm -v
echo.
cd /d "%~dp0frontend"
echo Ejecutando: npm run dev ...
echo La aplicacion web abrira en http://localhost:3000
echo.
call npm run dev
pause
