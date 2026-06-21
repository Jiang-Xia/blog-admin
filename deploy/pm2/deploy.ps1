# =============================================================================
# blog-admin Windows 本地部署入口（静态站点，无 PM2）
# 用法：npm run deploy
#
# 流程：[1] Vite build → [2] 打 tar(dist) → [3] 上传 → [4] 远程解压
# env：读根目录 .env.production（build 时打进 JS，不打进 tar）
# =============================================================================

param(
  [string]$EnvFileName = 'deploy.local.env'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'ssh-lib.ps1')
Initialize-DeployConsoleEncoding

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$EnvFile = Join-Path $PSScriptRoot $EnvFileName
$PackDir = Join-Path $PSScriptRoot '.pack'
$RemoteScript = Join-Path $PSScriptRoot 'remote-deploy.sh'

if (-not (Test-Path $EnvFile)) {
  throw "Missing $EnvFile — copy deploy.local.env.example to deploy.local.env"
}

$cfg = @{}
Get-Content $EnvFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $parts = $_ -split '=', 2
  if ($parts.Length -eq 2) {
    $cfg[$parts[0].Trim()] = $parts[1].Trim()
  }
}

$DeployHost = $cfg['DEPLOY_HOST']
$DeployUser = $cfg['DEPLOY_USER']
$DeployPort = if ($cfg['DEPLOY_PORT']) { $cfg['DEPLOY_PORT'] } else { '22' }
$DeployPassword = $cfg['DEPLOY_PASSWORD']
$RemoteDir = $cfg['DEPLOY_REMOTE_DIR']
$HostKey = $cfg['DEPLOY_HOSTKEY']
$TarName = if ($cfg['DEPLOY_TAR_NAME']) { $cfg['DEPLOY_TAR_NAME'] } else { 'blog-admin.tar.gz' }
Assert-SafeTarName $TarName

if (-not $DeployHost -or -not $DeployUser -or -not $RemoteDir) {
  throw 'deploy.local.env needs DEPLOY_HOST, DEPLOY_USER, DEPLOY_REMOTE_DIR'
}

$envProd = Join-Path $Root '.env.production'
if (-not (Test-Path $envProd)) {
  throw 'Missing .env.production in project root'
}

function Find-Executable {
  param([string]$Name)
  $paths = @(
    $Name,
    "$env:ProgramFiles\PuTTY\$Name.exe",
    "${env:ProgramFiles(x86)}\PuTTY\$Name.exe"
  )
  foreach ($p in $paths) {
    if (Test-Path $p) { return $p }
    $cmd = Get-Command $p -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
  }
  return $null
}

$Plink = Find-Executable -Name 'plink'
$Pscp = Find-Executable -Name 'pscp'
$usePlink = $DeployPassword -and $Plink -and $Pscp

$plinkArgs = @('-batch', '-P', $DeployPort)
if ($HostKey) { $plinkArgs += @('-hostkey', $HostKey) }
if ($usePlink) { $plinkArgs += @('-pw', $DeployPassword) }

$pscpArgs = @('-batch', '-P', $DeployPort)
if ($HostKey) { $pscpArgs += @('-hostkey', $HostKey) }
if ($usePlink) { $pscpArgs += @('-pw', $DeployPassword) }

function Invoke-Remote {
  param([string]$Command)
  if ($usePlink) {
    & $Plink @plinkArgs "$DeployUser@$DeployHost" $Command
    if ($LASTEXITCODE -ne 0) { throw 'plink failed' }
  } else {
    ssh -p $DeployPort -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$DeployUser@$DeployHost" $Command
    if ($LASTEXITCODE -ne 0) { throw 'ssh failed' }
  }
}

function Copy-ToRemote {
  param([string]$LocalPath, [string]$RemotePath)
  if ($usePlink) {
    & $Pscp @pscpArgs $LocalPath "$DeployUser@$DeployHost`:$RemotePath"
    if ($LASTEXITCODE -ne 0) { throw "pscp failed: $LocalPath" }
  } else {
    scp -P $DeployPort -o BatchMode=yes -o StrictHostKeyChecking=accept-new $LocalPath "$DeployUser@$DeployHost`:$RemotePath"
    if ($LASTEXITCODE -ne 0) { throw 'scp failed' }
  }
}

Write-Host "==> Remote static dir: $RemoteDir"
Write-Host "==> Build env: .env.production (project root)"

# [1/4] 本地 Vite 生产构建
Write-Host '==> [1/4] Build'
Push-Location $Root
npm ci --ignore-scripts   # 跳过 husky postinstall
npm run build
Pop-Location

if (-not (Test-Path (Join-Path $Root 'dist/index.html'))) {
  throw 'Build failed: dist/index.html not found'
}

# [2/4] 仅打包 dist 目录内容（tar 根即 index.html）
Write-Host '==> [2/4] Pack tar (dist only)'
if (-not (Test-Path $PackDir)) { New-Item -ItemType Directory -Path $PackDir | Out-Null }
$tarLocal = Join-Path $PackDir $TarName
if (Test-Path $tarLocal) { Remove-Item -Force $tarLocal }
Push-Location (Join-Path $Root 'dist')
tar -czf $tarLocal .
Pop-Location
$tarSize = [math]::Round((Get-Item $tarLocal).Length / 1MB, 2)
Write-Host "==> Tar: $tarLocal ($tarSize MB)"

# [3/4] 上传
Write-Host '==> [3/4] Upload'
$remoteTar = "/tmp/$TarName"
Copy-ToRemote $tarLocal $remoteTar
Copy-ToRemote (Join-Path $PSScriptRoot 'release-lib.sh') '/tmp/release-lib.sh'
Copy-ToRemote $RemoteScript '/tmp/remote-deploy.sh'

# [4/4] 远程：备份 → 新 release → 切 current
Write-Host '==> [4/4] Remote: release -> switch current'
$eRemoteDir = Escape-ShellSingleQuoted $RemoteDir
$eRemoteTar = Escape-ShellSingleQuoted $remoteTar
$remoteCmd = "chmod +x /tmp/remote-deploy.sh && DEPLOY_REMOTE_DIR='$eRemoteDir' DEPLOY_TAR_PATH='$eRemoteTar' bash /tmp/remote-deploy.sh"
Invoke-Remote $remoteCmd

Write-Host '==> Verify'
Invoke-Remote "test -f '$eRemoteDir/current/index.html' && echo 'index.html OK'"

Write-Host '==> Deploy finished - https://admin.jiang-xia.top/'
