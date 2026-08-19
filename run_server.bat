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

echo Starting Flood Forensics servers...

if not exist "%BACKEND%\.venv\Scripts\python.exe" (
  echo Creating backend virtual environment...
  python -m venv "%BACKEND%\.venv"
)

echo Installing backend requirements...
"%BACKEND%\.venv\Scripts\python.exe" -m pip install -r "%BACKEND%\requirements.txt"

echo Starting backend on http://localhost:8000 ...
start "Flood Forensics - Backend" cmd /k "cd /d %BACKEND% && .venv\Scripts\activate && uvicorn app.main:app --port 8000"

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
