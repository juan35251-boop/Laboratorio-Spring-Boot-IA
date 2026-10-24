@echo off
title Servidor Backend - Spring Boot (Puerto 8080)
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
set "PATH=%JAVA_HOME%\bin;C:\tools\apache-maven-3.9.10\bin;%PATH%"
echo ============================================================
echo   BANCO TdeA - INICIANDO SERVIDOR BACKEND (SPRING BOOT)
echo ============================================================
echo Java Version:
java -version
echo.
cd /d "%~dp0backend"

if not exist "target\bank-transfer-service-0.0.1-SNAPSHOT.jar" (
    echo Empaquetando jar ejecutable de Spring Boot...
    call mvn package -DskipTests
)

echo.
echo Iniciando servicio Spring Boot en http://localhost:8080 ...
echo Swagger UI disponible en: http://localhost:8080/swagger-ui.html
echo Consola H2 disponible en: http://localhost:8080/h2-console
echo.
java -jar target\bank-transfer-service-0.0.1-SNAPSHOT.jar
pause
