param(
  [string]$Owner = "evionadc",
  [string]$Repo = "project_discover_os",
  [string]$Token = $env:GITHUB_TOKEN
)

if (-not $Token) {
  Write-Error "Defina GITHUB_TOKEN com permissões repo/admin antes de rodar."; exit 1
}

$headers = @{ Authorization = "token $Token"; Accept = "application/vnd.github+json" }

function ProtectBranch([string]$branch) {
  $url = "https://api.github.com/repos/$Owner/$Repo/branches/$branch/protection"
  $body = @{
    required_status_checks = @{ strict = $true; contexts = @("CI") }
    enforce_admins = $true
    required_pull_request_reviews = @{
      dismiss_stale_reviews = $true
      require_code_owner_reviews = $false
      required_approving_review_count = 1
    }
    restrictions = $null
    allow_force_pushes = $false
    allow_deletions = $false
    required_linear_history = $true
    block_creations = $false
  } | ConvertTo-Json

  Invoke-RestMethod -Method Put -Uri $url -Headers $headers -Body $body
  Write-Host "Proteção aplicada em $branch"
}

ProtectBranch "main"
ProtectBranch "develop"
