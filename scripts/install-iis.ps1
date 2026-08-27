[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)] [string]$PublishPath,
    [string]$SiteName = "Default Web Site",
    [string]$ApplicationPath = "/",
    [string]$PhysicalPath = "C:\inetpub\wwwroot\CampaignStudio",
    [string]$AppPoolName = "CampaignStudio"
)

$ErrorActionPreference = "Stop"
Import-Module WebAdministration

if (-not (Get-WebGlobalModule -Name AspNetCoreModuleV2 -ErrorAction SilentlyContinue)) {
    throw "ASP.NET Core Module V2 is missing. Install the .NET 10 Hosting Bundle first."
}

if (-not (Test-Path "IIS:\AppPools\$AppPoolName")) {
    New-WebAppPool -Name $AppPoolName | Out-Null
}
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name managedRuntimeVersion -Value ""
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name processModel.identityType -Value ApplicationPoolIdentity

if ($PSCmdlet.ShouldProcess($PhysicalPath, "Copy Campaign Studio publish output")) {
    New-Item -ItemType Directory -Force -Path $PhysicalPath | Out-Null
    Copy-Item (Join-Path $PublishPath "*") $PhysicalPath -Recurse -Force
}

if ($ApplicationPath -eq "/") {
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name physicalPath -Value $PhysicalPath
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name applicationPool -Value $AppPoolName
} else {
    $name = $ApplicationPath.Trim("/")
    if (Get-WebApplication -Site $SiteName -Name $name -ErrorAction SilentlyContinue) {
        Set-ItemProperty "IIS:\Sites\$SiteName\$name" -Name physicalPath -Value $PhysicalPath
        Set-ItemProperty "IIS:\Sites\$SiteName\$name" -Name applicationPool -Value $AppPoolName
    } else {
        New-WebApplication -Site $SiteName -Name $name -PhysicalPath $PhysicalPath -ApplicationPool $AppPoolName | Out-Null
    }
}

Restart-WebAppPool -Name $AppPoolName
Write-Host "Campaign Studio installed at $SiteName$ApplicationPath using $AppPoolName."

