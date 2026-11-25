# Dot-source to enable project-local tools in the current shell only.
$codexToolRoot = Join-Path $PSScriptRoot '..\.codex-tools'
$codexToolPaths = @(
    (Join-Path $codexToolRoot 'venv\Scripts'),
    (Join-Path $codexToolRoot 'node_modules\.bin'),
    (Join-Path $codexToolRoot 'node_modules\@ffmpeg-installer\win32-x64'),
    (Join-Path $codexToolRoot 'node_modules\@ffprobe-installer\win32-x64')
)
$env:PATH = ($codexToolPaths -join [IO.Path]::PathSeparator) + [IO.Path]::PathSeparator + $env:PATH
$env:PYTHONUTF8 = '1'
$env:AGENT_BROWSER_SOCKET_DIR = Join-Path $codexToolRoot 'agent-browser-sessions'
New-Item -ItemType Directory -Path $env:AGENT_BROWSER_SOCKET_DIR -Force | Out-Null
