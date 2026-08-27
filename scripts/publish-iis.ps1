[CmdletBinding()]
param(
    [string]$Runtime = "win-x64",
    [string]$Output = "$PSScriptRoot\..\artifacts\iis"
)

$ErrorActionPreference = "Stop"
$project = Join-Path $PSScriptRoot "..\src\CampaignStudio.Web\CampaignStudio.Web.csproj"

dotnet restore $project
dotnet test (Join-Path $PSScriptRoot "..\CampaignStudio.sln") --configuration Release --no-restore
dotnet publish $project --configuration Release --runtime $Runtime --self-contained false --output $Output

Write-Host "IIS publish output: $((Resolve-Path $Output).Path)"

