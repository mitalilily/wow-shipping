. (Join-Path $PSScriptRoot 'Use-CodexTools.ps1')
$codexAgentBinary = Join-Path $PSScriptRoot '..\.codex-tools\node_modules\agent-browser\bin\agent-browser-win32-x64.exe'
& $codexAgentBinary @args
exit $LASTEXITCODE
