# Run from an elevated PowerShell session on the IIS host.
$ErrorActionPreference = "Stop"
$secureKey = Read-Host "OpenAI API key" -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
    $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    [Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $plainKey, "Machine")
} finally {
    if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
    $plainKey = $null
}
Write-Host "OPENAI_API_KEY is configured at machine scope. Restart the CampaignStudio app pool."

