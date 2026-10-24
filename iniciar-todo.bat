@echo off
title Banco TdeA - Lanzador General del Sistema
color 0A

echo ===================================================================
echo     BANCO TdeA - INICIANDO SISTEMA COMPLETO DE TRANSFERENCIAS
echo ===================================================================
echo.

set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
set "NODE_PATH=%LOCALAPPDATA%\Programs\nodejs"
set "PATH=%JAVA_HOME%\bin;C:\tools\apache-maven-3.9.10\bin;%NODE_PATH%;%PATH%"

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/3] Iniciando Servidor Backend (Spring Boot en puerto 8080)...
start "Backend - Spring Boot (Puerto 8080)" cmd /c "title Backend Spring Boot && cd /d "%ROOT_DIR%backend" && java -jar target\bank-transfer-service-0.0.1-SNAPSHOT.jar"

echo [2/3] Esperando que el servicio Backend este listo...
timeout /t 8 /nobreak >nul

echo [3/3] Iniciando Cliente Frontend (React Vite en puerto 3000)...
start "Frontend - React (Puerto 3000)" cmd /c "title Frontend React && cd /d "%ROOT_DIR%frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo Abriendo la aplicacion en tu navegador...
start http://localhost:3000

echo.
echo ===================================================================
echo   SISTEMA INICIADO CON EXITO!
echo   - Frontend Web:          http://localhost:3000
echo   - Backend Swagger UI:    http://localhost:8080/swagger-ui.html
echo   - Consola H2 DB:         http://localhost:8080/h2-console
echo ===================================================================
echo.
pause
