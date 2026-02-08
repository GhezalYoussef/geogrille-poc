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

## 3) Start Frontend (Angular + Leaflet)

```bash
cd geogrille-front
npm install
npm start
```

Frontend runs on: http://localhost:4200

## 4) Quick test flow
1. Open http://localhost:4200
2. Register then Login
3. Click "Ajouter sur la carte" then click on map to create a grille
4. Move/zoom map to see markers loaded by bbox search
