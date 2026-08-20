@echo off
setlocal

set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend

if not exist "%ROOT%.env" (
  if exist "%ROOT%.env.example" (
    copy "%ROOT%.env.example" "%ROOT%.env" >nul
    echo Created .env from .env.example
  )
)

echo === Cleaning up stale server processes ===

for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":8000 .*LISTENING"') do (
  echo   Killing stale backend process PID %%p on port 8000
  taskkill /F /PID %%p >nul 2>&1
)

for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":3000 .*LISTENING"') do (
  echo   Killing stale frontend process PID %%p on port 3000
  taskkill /F /PID %%p >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo Starting Flood Forensics servers...

if not exist "%BACKEND%\.venv\Scripts\python.exe" (
  echo Creating backend virtual environment...
  python -m venv "%BACKEND%\.venv"
)

echo Installing backend requirements...
"%BACKEND%\.venv\Scripts\python.exe" -m pip install -r "%BACKEND%\requirements.txt"

echo Starting backend on http://localhost:8000 ...
start "Flood Forensics - Backend" cmd /k "cd /d %BACKEND% && .venv\Scripts\activate && python run.py"

echo Installing frontend dependencies...
pushd "%FRONTEND%"
call npm install
popd

echo Starting frontend on http://localhost:3000 ...
start "Flood Forensics - Frontend" cmd /k "cd /d %FRONTEND% && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Backend:  http://localhost:8000/docs
echo Frontend: http://localhost:3000
endlocal