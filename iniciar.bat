@echo off
echo.
echo === 3DPrintLab - Iniciando servidor ===
echo.
cd /d "%~dp0server"
if not exist node_modules (
    echo Instalando dependencias...
    npm install
    echo.
)
echo Abri en tu navegador: http://localhost:3001
echo Admin: http://localhost:3001/admin/
echo.
echo Presiona Ctrl+C para detener.
echo.
node index.js
pause
