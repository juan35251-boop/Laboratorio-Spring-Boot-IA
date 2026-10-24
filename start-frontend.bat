@echo off
echo ===================================================
echo INICIANDO CLIENTE FRONTEND (REACT VITE - PUERTO 3000)
echo ===================================================
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
cd frontend
npm run dev
pause
