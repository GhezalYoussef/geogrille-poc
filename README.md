# GeoGrille POC (PostgreSQL + Spring Boot + Angular + Leaflet)

## 1) Start PostgreSQL
```bash
docker compose up -d
```

## 2) Start Backend (Spring Boot)
Open **geogrille-back** in IntelliJ as a Maven project, then run:

```bash
mvn spring-boot:run
```

Backend runs on: http://localhost:8080

## 3) Generate & Start Frontend (Angular + Leaflet)

The frontend is provided as a generator (to avoid shipping the huge Angular CLI output).

### On Windows (PowerShell)
```powershell
cd geogrille-front
./init-frontend.ps1
cd geogrille-front-app
npm start
```

### On macOS/Linux (bash)
```bash
cd geogrille-front
./init-frontend.sh
cd geogrille-front-app
npm start
```

Frontend runs on: http://localhost:4200

> IMPORTANT: After generation, wire the interceptor + FormsModule:
- If your project has `src/app/app.module.ts` (NgModule), copy the content of `src/app/app.module.poc.ts` into it.
- If your project is standalone-based (`app.config.ts`), add providers for `HTTP_INTERCEPTORS` and import `FormsModule`.

## 4) Quick test flow
1. Open http://localhost:4200
2. Register then Login
3. Click "Ajouter sur la carte" then click on map to create a grille
4. Move/zoom map to see markers loaded by bbox search
