# CineVault — Movie Management Frontend

A fully structured frontend for a Spring Boot REST API movie management system.

---

## Project Structure

```
cinevault/
├── index.html          ← Single-page app entry point
├── css/
│   └── style.css       ← Full design system + all component styles
└── js/
    ├── api.js          ← ALL Spring Boot REST calls in one place
    ├── app.js          ← State manager, Router, Toast, Modal, helpers
    ├── browse.js       ← Browse page: movie grid, search, genre filter, detail panel, reviews
    ├── favourites.js   ← Favourites page: list + remove
    └── admin.js        ← Admin panel: movies CRUD, users CRUD, reviews moderation
```

---

## Spring Boot Integration

### Option A — Serve as Static Files (Recommended)

Copy the entire project into:

```
src/main/resources/static/
```

Spring Boot will serve `index.html` at `http://localhost:8080/` automatically.

No extra configuration needed — Spring Boot's default `ResourceHttpRequestHandler` picks it up.

### Option B — Thymeleaf Template

Rename `index.html` → `index.html` and move to:

```
src/main/resources/templates/index.html
```

Add a controller:

```java
@Controller
public class AppController {
    @GetMapping("/")
    public String index() { return "index"; }
}
```

---

## API Base URL

Edit **one line** in `js/api.js` to point at your backend:

```js
const BASE_URL = 'http://localhost:8080/api';
```

For production, set this to your deployed hostname.

---

## Expected Spring Boot REST Endpoints

### Auth
| Method | Endpoint             | Description           |
|--------|----------------------|-----------------------|
| POST   | /api/auth/login      | Login, returns JWT    |
| POST   | /api/auth/register   | Register new user     |
| GET    | /api/auth/me         | Get current user      |
| POST   | /api/auth/logout     | Invalidate token      |

### Movies
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/movies                 | List all (paginated)     |
| GET    | /api/movies/{id}            | Get one movie            |
| GET    | /api/movies/search?title=.. | Search movies            |
| GET    | /api/movies/genres          | List all genres          |
| POST   | /api/movies                 | Create movie (ADMIN)     |
| PUT    | /api/movies/{id}            | Update movie (ADMIN)     |
| DELETE | /api/movies/{id}            | Delete movie (ADMIN)     |

### Favourites
| Method | Endpoint                     | Description         |
|--------|------------------------------|---------------------|
| GET    | /api/favourites              | Get my favourites   |
| POST   | /api/favourites/{movieId}    | Add favourite       |
| DELETE | /api/favourites/{movieId}    | Remove favourite    |
| GET    | /api/favourites/{movieId}/check | Is it a favourite? |

### Reviews
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | /api/reviews/movie/{movieId}      | Reviews for a movie      |
| POST   | /api/reviews/{movieId}            | Submit review            |
| PUT    | /api/reviews/{reviewId}           | Update review            |
| DELETE | /api/reviews/{reviewId}           | Delete review (ADMIN)    |
| GET    | /api/reviews                      | All reviews (ADMIN)      |
| PATCH  | /api/reviews/{reviewId}/status    | Approve/reject (ADMIN)   |

### Users (Admin)
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| GET    | /api/users                  | List users (ADMIN)   |
| GET    | /api/users/{id}             | Get user             |
| POST   | /api/users                  | Create user (ADMIN)  |
| PUT    | /api/users/{id}             | Update user (ADMIN)  |
| DELETE | /api/users/{id}             | Delete user (ADMIN)  |
| PATCH  | /api/users/{id}/status      | Toggle status        |

### Admin
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/admin/stats      | Dashboard totals    |
| GET    | /api/admin/activity   | Recent activity log |

---

## JWT Authentication

The `api.js` layer automatically:
1. Reads the token from `localStorage` key `cinevault_token`
2. Sends it as `Authorization: Bearer <token>` on every request
3. Clears the token and shows a toast on `401 Unauthorized`

After a successful login:
```js
const res = await API.auth.login({ username, password });
API.setToken(res.token);
```

---

## Connecting Mock Data to Real API

Every page file has clearly commented lines showing where to swap mock data for real API calls:

```js
// Replace this:
const movies = MOCK_MOVIES;

// With this:
const data = await API.movies.getAll({ page: 0, size: 20 });
const movies = data?.content || data || [];
```

---

## Suggested Spring Boot Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
```

### Enable CORS for development

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:8080")
            .allowedMethods("GET","POST","PUT","DELETE","PATCH");
    }
}
```
