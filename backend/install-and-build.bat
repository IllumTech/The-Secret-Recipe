@echo off
echo ========================================
echo La Receta Secreta - Backend Setup
echo ========================================
echo.

echo [1/4] Instalando dependencias de Products Function...
cd functions\products
if exist package.json (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al instalar dependencias de Products
        pause
        exit /b 1
    )
    echo OK - Products dependencies instaladas
) else (
    echo ERROR: No se encontro package.json en functions\products
    pause
    exit /b 1
)
cd ..\..
echo.

echo [2/4] Instalando dependencias de Orders Function...
cd functions\orders
if exist package.json (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al instalar dependencias de Orders
        pause
        exit /b 1
    )
    echo OK - Orders dependencies instaladas
) else (
    echo ERROR: No se encontro package.json en functions\orders
    pause
    exit /b 1
)
cd ..\..
echo.

echo [3/4] Instalando dependencias de AI Generator Function...
cd functions\ai-generator
if exist package.json (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al instalar dependencias de AI Generator
        pause
        exit /b 1
    )
    echo OK - AI Generator dependencies instaladas
) else (
    echo ERROR: No se encontro package.json en functions\ai-generator
    pause
    exit /b 1
)
cd ..\..
echo.

echo [4/4] Verificando instalacion de SAM CLI...
sam --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ATENCION: SAM CLI no esta instalado
    echo ========================================
    echo.
    echo Para instalar SAM CLI:
    echo 1. Descarga el instalador desde:
    echo    https://github.com/aws/aws-sam-cli/releases/latest/download/AWS_SAM_CLI_64_PY3.msi
    echo 2. Ejecuta el instalador
    echo 3. Cierra y abre una nueva terminal
    echo 4. Verifica con: sam --version
    echo.
    echo Despues de instalar SAM CLI, ejecuta:
    echo    sam build
    echo    sam deploy --guided
    echo.
) else (
    echo OK - SAM CLI esta instalado
    echo.
    echo ========================================
    echo Listo para hacer build y deploy
    echo ========================================
    echo.
    echo Siguiente paso:
    echo    sam build
    echo.
    echo Despues:
    echo    sam deploy --guided
    echo.
)

pause
