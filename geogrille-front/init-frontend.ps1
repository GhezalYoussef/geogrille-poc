\
# Generates Angular app + Leaflet and copies template code
# Prereqs: Node.js 18+ and npm installed.

$AppDir = "geogrille-front-app"

if (Test-Path $AppDir) {
  Write-Host "Directory $AppDir already exists. Delete it or choose another name."
  exit 1
}

npx -y @angular/cli@17 new $AppDir --routing --style=scss --skip-git
Set-Location $AppDir

npm i leaflet

node -e "const fs=require('fs');const p='angular.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));const n=Object.keys(j.projects)[0];const s=j.projects[n].architect.build.options.styles||[];if(!s.includes('node_modules/leaflet/dist/leaflet.css')) s.push('node_modules/leaflet/dist/leaflet.css');j.projects[n].architect.build.options.styles=s;fs.writeFileSync(p,JSON.stringify(j,null,2));"

Copy-Item -Recurse -Force ..\template\src\* .\src\

Write-Host "✅ Front generated. Run: npm start"
