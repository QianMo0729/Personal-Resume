param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8765
)

$ErrorActionPreference = 'Stop'
$demoDirectory = $PSScriptRoot
$projectDirectory = [System.IO.Path]::GetFullPath((Join-Path $demoDirectory '..\..'))
$healthUrl = "http://127.0.0.1:$Port/__blueprint_demo_health"
$demoUrl = "http://127.0.0.1:$Port/demos/blueprint-campus/"

function Get-DemoHealth {
    try {
        return Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2 -ErrorAction Stop
    }
    catch {
        return $null
    }
}

$existing = Get-DemoHealth
if ($existing -and $existing.name -eq 'blueprint-campus-demo' -and $existing.root -eq $projectDirectory) {
    Write-Host "Demo is already running (PID $($existing.pid))."
    Write-Host $demoUrl
    return
}

$listener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if ($listener) {
    throw "Port $Port is occupied by another service. Choose a free port: .\Start-Demo.ps1 -Port 8766"
}

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { $null }
if (-not $nodePath) {
    $bundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (Test-Path -LiteralPath $bundledNode -PathType Leaf) {
        $nodePath = $bundledNode
    }
}
if (-not $nodePath) {
    throw 'Node.js was not found. Install Node.js, then run this script again.'
}

$runtimeDirectory = Join-Path $demoDirectory 'source-data\runtime'
New-Item -ItemType Directory -Force -Path $runtimeDirectory | Out-Null
$stdoutPath = Join-Path $runtimeDirectory "server-$Port.log"
$stderrPath = Join-Path $runtimeDirectory "server-$Port.error.log"
$serverPath = Join-Path $demoDirectory 'server.mjs'
$argumentString = '"{0}" --port {1}' -f $serverPath, $Port
$demoProcess = Start-Process -FilePath $nodePath -ArgumentList $argumentString -WorkingDirectory $projectDirectory -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru

for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    $health = Get-DemoHealth
    if ($health -and $health.name -eq 'blueprint-campus-demo' -and $health.root -eq $projectDirectory) {
        Write-Host "Campus demo started in background (PID $($health.pid))."
        Write-Host $demoUrl
        return
    }
    $demoProcess.Refresh()
    if ($demoProcess.HasExited) {
        $errorDetails = if (Test-Path -LiteralPath $stderrPath) { Get-Content -LiteralPath $stderrPath -Raw } else { '' }
        throw "Demo server exited before it was ready. $errorDetails"
    }
}
throw "Demo server did not become ready. Check $stderrPath"
