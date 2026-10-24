@echo off
title Banco TdeA - Detener Sistema
color 0C

echo ===================================================================
echo     BANCO TdeA - DETENIENDO TODOS LOS SERVICIOS (BACKEND Y FRONTEND)
echo ===================================================================
echo.

echo Deteniendo procesos de Spring Boot (Java) y React (Node)...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM node.exe 2>nul

echo.
echo ===================================================================
echo   SISTEMA DETENIDO CORRECTAMENTE.
echo   Los puertos 8080 y 3000 han sido liberados.
echo ===================================================================
echo.
pause
