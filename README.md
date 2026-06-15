# Snake Game — Spring Boot + React

## Estructura

```
snake-game/
├── backend/   — Spring Boot 3 · Java 21 · H2 (dev) / PostgreSQL (prod)
└── frontend/  — React 18 · Vite · CSS Modules
```

## Arrancar en desarrollo

### Backend
```bash
cd backend
./mvnw spring-boot:run
# API disponible en http://localhost:8080/api/scores
# Consola H2: http://localhost:8080/h2-console
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App disponible en http://localhost:5173
```

## API REST

| Método | Ruta          | Descripción               |
|--------|---------------|---------------------------|
| GET    | /api/scores   | Top 10 puntuaciones       |
| POST   | /api/scores   | Guardar nueva puntuación  |

### POST /api/scores — body
```json
{ "playerName": "Victor", "score": 12, "level": 3 }
```

## Pasar a producción

1. En `application.properties`, cambia la datasource a PostgreSQL
2. Actualiza `CorsConfig.java` con el dominio real del frontend
3. `./mvnw package` genera el `.jar` ejecutable
4. `npm run build` genera el `dist/` para servir estático
