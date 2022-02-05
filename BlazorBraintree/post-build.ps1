param([string]$ProjectDir, [string]$ProjectPath);

$currentDateVersion = get-date -format yyyy.MM.dd.HHmm;
$currentDateFile = get-date -format yyyyMMdd;
$gitShortHash = git rev-parse --short HEAD #"." $gitShortHash+
$gitBranch = git branch --show-current
$csproj = Get-Content $ProjectPath
$find = "<Version>(.|\n)*?</Version>";
$replace = "<Version>" + $currentDateVersion + "</Version>";
$csprojUpdated = $csproj -replace $find, $replace
Set-Content -Path $ProjectPath -Value $csprojUpdated
$find = "<FileVersion>(.|\n)*?</FileVersion>";
$replace = "<FileVersion>" + $currentDateVersion +"."+$gitBranch+"."+ $gitShortHash + "</FileVersion>";
$csprojUpdated2 = $csprojUpdated -replace $find, $replace
Set-Content -Path $ProjectPath -Value $csprojUpdated2