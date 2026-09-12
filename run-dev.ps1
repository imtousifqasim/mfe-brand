# MFE BRAND - Atelier Development Server (Local + Mobile IP)
Write-Host "====================================================================" -ForegroundColor Gold
Write-Host "                  MFE BRAND - HAUTE COUTURE" -ForegroundColor White
Write-Host "               Development Server (Local + Mobile)" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Gold

$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1).IPAddress
if (-not $localIp) { $localIp = "YOUR_IP_ADDRESS" }

Write-Host "`n[✓] Ready to connect:" -ForegroundColor Green
Write-Host "    💻 Computer Browser:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "    📱 Mobile Phone:      http://${localIp}:3000" -ForegroundColor Green
Write-Host "`n    [!] Note: Ensure your mobile phone is connected to the same Wi-Fi router." -ForegroundColor Gray
Write-Host "====================================================================`n" -ForegroundColor Gold

npm run dev:network
