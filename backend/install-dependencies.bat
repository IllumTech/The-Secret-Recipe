@echo off
echo Installing dependencies for all Lambda functions...
echo.

echo Installing Products function dependencies...
cd functions\products
call npm install
cd ..\..
echo.

echo Installing Orders function dependencies...
cd functions\orders
call npm install
cd ..\..
echo.

echo Installing AI Generator function dependencies...
cd functions\ai-generator
call npm install
cd ..\..
echo.

echo All dependencies installed successfully!
pause
