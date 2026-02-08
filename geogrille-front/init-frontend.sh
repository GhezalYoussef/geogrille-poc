#!/usr/bin/env bash
set -euo pipefail

# This script generates an Angular app with Leaflet and drops in the POC map/auth code.
# Prereqs: Node.js 18+ and npm installed.

APP_DIR="geogrille-front-app"

if [ -d "$APP_DIR" ]; then
  echo "Directory $APP_DIR already exists. Delete it or choose another name."
  exit 1
fi

npx -y @angular/cli@17 new "$APP_DIR" --routing --style=scss --skip-git

cd "$APP_DIR"

npm i leaflet

# Add Leaflet CSS to angular.json
node - <<'NODE'
const fs = require('fs');
const path = 'angular.json';
const json = JSON.parse(fs.readFileSync(path,'utf8'));
const projName = Object.keys(json.projects)[0];
const styles = json.projects[projName].architect.build.options.styles || [];
if (!styles.includes('node_modules/leaflet/dist/leaflet.css')) {
  styles.push('node_modules/leaflet/dist/leaflet.css');
}
json.projects[projName].architect.build.options.styles = styles;
fs.writeFileSync(path, JSON.stringify(json, null, 2));
NODE

# Copy in app files from ../template
cp -R ../template/src/* src/

# Add interceptor provider and HttpClient/FormsModule to app.module.ts (Angular CLI v17 still supports NgModule output)
# If your generated project is standalone-based, you can wire providers in app.config.ts instead.
echo "✅ Front generated. Run: npm start"
