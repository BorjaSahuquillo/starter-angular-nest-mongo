# Cursor Rules for Angular Development

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Angular PRIMENG Component Priority

- \*\*ALWAYS prioritize PrimeNG components over custom HTML elements
- **Use PrimeNG components for**:
  - Layout: `p-card`, `p-sidebar`, `p-toolbar`
  - Forms: `p-inputText`, `p-dropdown`, `p-multiSelect`, `p-checkbox`, `p-calendar`
  - Navigation: `p-tabView`, `p-menu`, `p-paginator`, `p-breadcrumb`
  - Data display: `p-table`, `p-dataView`, `p-listbox`, `p-chip`
  - Feedback: `p-dialog`, `p-toast`, `p-progressBar`, `p-message`
  - Buttons: `p-button`, `p-splitButton`, `p-speedDial`
  - Overlays: `p-overlayPanel`, `p-confirmDialog`, `p-sidebar`
- **Only use custom HTML** when PrimeNG doesn't provide the needed component
- **Follow PrimeNG design principles** for consistent UI/UX
- **Import PrimeNG components directly** when needed in templates or components
- **NO shared modules or index files** - import directly from 'primeng/component-name'
- **Import components directly** in the imports array of each standalone component

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- **ALWAYS separate HTML and SCSS in different files** - Never use inline templates or styles
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- DO NOT use `ngStyle`, use `style` bindings instead
- **File naming convention**: Use `.component.ts`, `.directive.ts`, `.pipe.ts`, `.service.ts` suffixes

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- **ALWAYS use external HTML files** - Never inline templates in components
- **Template files should be named**: `component-name.component.html`

## Template Structure and CSS Classes

- **Use semantic and descriptive CSS class names** following BEM-like methodology
- **Examples of good class naming**:
  - `header-container`, `header-title`, `header-body`
  - `content-wrapper`, `content-main`, `content-sidebar`
  - `button-primary`, `button-secondary`, `button-icon`
  - `form-container`, `form-group`, `form-label`, `form-input`
  - `card-header`, `card-body`, `card-footer`, `card-actions`
- **Keep HTML clean and readable** with meaningful class names
- **Avoid generic classes** like `container`, `wrapper`, `item` - be specific

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
- **File naming convention**: Use `.service.ts` suffix
- **Service files should be named**: `service-name.service.ts`

## Common pitfalls

- Control flow (`@if`):
  - You cannot use `as` expressions in `@else if (...)`. E.g. invalid code: `@else if (bla(); as x)`.

## File Structure and Naming

- **Components**: `component-name.component.ts`, `component-name.component.html`, `component-name.component.scss`
- **Directives**: `directive-name.directive.ts`
- **Pipes**: `pipe-name.pipe.ts`
- **Services**: `service-name.service.ts`
- **Guards**: `guard-name.guard.ts`
- **Interceptors**: `interceptor-name.interceptor.ts`
- **Models/Interfaces**: `model-name.model.ts`, `interface-name.interface.ts`
- **Constants**: `constants.ts` or `app.constants.ts`
- **Enums**: `enum-name.enum.ts`

## PrimeNG + Tailwind CSS Integration Guidelines

- **Use PrimeNG for**:
  - Component functionality and behavior
  - Pre-built UI components with consistent design
  - Form validation and complex interactions
  - Data visualization and tables
- **Use Tailwind CSS for**:
  - Grid layouts: `grid`, `grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-3`
  - Spacing: `p-4`, `m-2`, `px-6`, `py-3`, `gap-4`, `space-y-4`
  - Basic positioning: `flex`, `items-center`, `justify-between`
  - Responsive breakpoints: `md:`, `lg:`, `xl:`
  - Custom layouts and positioning that PrimeNG doesn't provide
- **DO NOT use Tailwind for**:
  - Colors (use PrimeNG theme variables or custom CSS)
  - Typography (use PrimeNG typography classes or custom CSS)
  - Complex animations (use PrimeNG animations or custom CSS)
  - Component-specific styling (use PrimeNG props or custom CSS)
- **Keep HTML clean** - don't overload with too many Tailwind classes
- **Combine PrimeNG components with Tailwind utilities** for optimal layout and spacing
- **Use PrimeNG theme customization** for consistent color schemes and design tokens

# Angular Development Rules – Repository / Service / Pages Pattern

## 🎯 Objective

Develop scalable Angular applications using a **Repository–Service–Pages** architecture, ensuring separation of concerns, maintainability, and clean code.

---

## 📂 Project Structure

```
src/
 ├── app/
 │    ├── core/                   # Core infrastructure layer
 │    │    ├── repositories/      # Data access layer (API calls, HTTP requests)
 │    │    │    ├── auth.repository.ts
 │    │    │    ├── user.repository.ts
 │    │    │    └── index.ts
 │    │    ├── dtos/              # Data Transfer Objects (API communication)
 │    │    │    ├── auth.dto.ts
 │    │    │    ├── user.dto.ts
 │    │    │    └── index.ts
 │    │    └── interceptors/      # HTTP interceptors
 │    │
 │    ├── services/               # Business logic layer (state handling, orchestration)
 │    │    ├── auth.service.ts
 │    │    ├── user.service.ts
 │    │    └── index.ts
 │    ├── guards/                 # Route guards
 │    │    ├── auth.guard.ts
 │    │    └── index.ts
 │    ├── models/                 # Domain models (business logic)
 │    │    ├── user.model.ts
 │    │    ├── auth-tokens.model.ts
 │    │    └── index.ts
 │    ├── utils/                  # Helper functions and constants
 │    │    ├── auth.config.ts
 │    │    └── index.ts
 │    ├── components/             # Componentes generales reutilizables
 │    ├── pipes/                  # Pipes generales reutilizables
 │    ├── directives/             # Directivas generales reutilizables
 │    ├── pages/                  # App pages (one folder per page)
 │    │    ├── login/
 │    │    │    ├── login.component.ts
 │    │    │    ├── login.component.html
 │    │    │    └── login.component.scss
 │    │    ├── users/
 │    │    │    ├── components/   # Dumb UI components (standalone)
 │    │    │    ├── containers/   # Smart components (standalone, connect to services)
 │    │    │    ├── users.routes.ts
 │    │    │    └── index.ts
 │    │    └── products/
 │    │         ├── components/   # Dumb UI components (standalone)
 │    │         ├── containers/   # Smart components (standalone, connect to services)
 │    │         ├── products.routes.ts
 │    │         └── index.ts
```

---

## 📦 Layer Responsibilities

### **Repository Layer** (`core/repositories/`)

- Handles **data access** and communication with APIs.
- Contains only HTTP calls and basic request/response mapping.
- No business logic.

```ts
@Injectable({ providedIn: "root" })
export class UserRepository {
  constructor(private http: HttpClient) {}
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>("/api/users");
  }
}
```

### **Service Layer** (`core/services/`)

- Contains **business logic** and orchestrates repository calls.
- Handles transformations, caching, and state.

```ts
@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private userRepository: UserRepository) {}
  getActiveUsers(): Observable<User[]> {
    return this.userRepository
      .getUsers()
      .pipe(map((users) => users.filter((user) => user.active)));
  }
}
```

### **Pages Layer** (`pages/`)

- **Smart Components** (Containers):
  - Located in `containers/`.
  - Connect to services, handle state, and pass data to dumb components.
- **Dumb Components** (Presentational):
  - Located in `components/`.
  - Only receive `@Input()` and emit `@Output()` events.
  - No direct service calls.

---

## 🛠 Code Style

- Enable **strict mode** in `tsconfig.json`.
- Use **OnPush** change detection by default.
- **ALL components MUST be standalone** - no NgModules allowed.
- Use **RxJS** for async data.
- Keep components small and focused — max 300 lines.
- **Import components directly** in the `imports` array of each component.
- **Use routes.ts files** for routing configuration.

---

## 🚦 Naming Conventions

- Components: `PascalCase` (`UserListComponent`).
- Services & Repositories: `PascalCase` (`UserService`, `UserRepository`).
- Models & Enums: `PascalCase` (`User`, `UserRole`).
- Folders: `kebab-case` (`user-profile`).

---

## ✅ Summary of Rules

1. **Repositories** = API data fetching only.
2. **Services** = Business logic.
3. **Pages** = Smart components + dumb components (all standalone).
4. Components never call repositories directly.
5. Follow naming and folder structure strictly.
6. **ALL components are standalone** - no NgModules.
7. **Use routes.ts files** instead of routing modules.
8. **Import components directly** in the components that need them.

---

## 🧪 Angular Testing Rules

- Use **Jasmine + Karma** for unit testing
- Test all standalone components with `TestBed.configureTestingModule`
- Mock services using `jasmine.createSpyObj`
- Test signals with `signal()` and `computed()`
- Use `ComponentFixture` for component testing
- Test reactive forms with `FormBuilder`
- Test Primeng components with proper test utilities
- Use `fakeAsync` and `tick()` for async operations

---

## 🚀 Performance Rules

- Use `OnPush` change detection strategy by default
- Implement `trackBy` functions for `@for` loops
- Use `async` pipe to avoid manual subscription management
- Lazy load feature routes and components
- Use `NgOptimizedImage` for all images
- Implement virtual scrolling for large lists
- Use `runOutsideAngular` for heavy computations
- Implement proper `OnDestroy` cleanup

---

## 🚨 Error Handling Rules

- Implement global error interceptor
- Use `catchError` operator in RxJS streams
- Show user-friendly error messages via Primeng toasts.
- Log errors appropriately with proper error levels
- Handle HTTP errors gracefully with retry logic
- Implement fallback UI for error states
- Use `ErrorBoundary` pattern for component errors

---

## ♿ Accessibility Rules

- Use semantic HTML elements (`<nav>`, `<main>`, `<section>`)
- Implement ARIA labels and roles properly
- Ensure keyboard navigation works for all interactive elements
- Provide alt text for all images
- Test with screen readers and accessibility tools
- Follow WCAG 2.1 AA guidelines
- Use proper heading hierarchy (h1, h2, h3)
- Ensure sufficient color contrast ratios

## When I ask for help:

1. Follow these rules strictly
2. Generate modern Angular 20 code
3. Use Angular PrimeNG components appropriately
4. Keep the existing project structure
5. Provide clear explanations for your solutions
6. **ALL Angular development is contained within `/front-app` directory**
7. **Never modify files outside `/front-app` unless specifically requested**
8. **Backend (NestJS) is in `/back-app` and should remain untouched**
9. **Focus all Angular work in the frontend application scope**

# NestJS + TypeORM Development Rules for Cursor

## 🎯 Objective

Build scalable and maintainable backend applications using **NestJS** and **TypeORM**, following clean architecture principles.

---

## 📂 Project Structure

```
src/
 ├── common/               # Shared utilities, filters, interceptors, decorators
 ├── config/               # Configuration files (env, constants, logger)
 ├── database/             # Database connection, migrations, seeds
 ├── modules/
 │    └── example/         # Feature example
 │         ├── example.module.ts
 │         ├── example.controller.ts
 │         ├── example.service.ts
 │         ├── example.entity.ts
 │         ├── dto/
 │         └── tests/
 ├── app.module.ts
 └── main.ts
```

---

## 🛠 Code Style & Architecture

- **TypeScript strict mode** ON.
- Naming conventions:
  - **PascalCase** for classes/enums.
  - **camelCase** for variables/functions.
  - **UPPER_SNAKE_CASE** for constants.
- No `any` type — always define DTOs and interfaces.
- **Controllers**:
  - Only handle routing and request validation.
  - No business logic.
- **Services**:
  - Contain all business logic.
  - Stateless, injected via constructor.
- **Entities**:
  - Use `@Entity()` from TypeORM.
  - Keep them clean — no business logic inside.
- **DTOs**:
  - Located in `/dto` folder inside the module.
  - Use `class-validator` + `class-transformer`.
  - Separate input DTOs and output DTOs.

---

## 🗄 Database Rules (TypeORM)

- Default database: **PostgreSQL**.
- Entities:
  - Use `@PrimaryGeneratedColumn('uuid')` for IDs.
  - Use `snake_case` for DB column names.
  - Always define `created_at` and `updated_at` columns with `@UpdateDateColumn` and `@CreateDateColumn`.
- Migrations:
  ```bash
  npm run typeorm migration:generate src/database/migrations/<name>
  npm run typeorm migration:run
  ```
- Never use `synchronize: true` in production.

---

## 📄 API Rules

- All controllers must:
  - Use DTOs for request bodies.
  - Use Swagger decorators: `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`.
- Always paginate large queries.
- Error handling:
  - Use `HttpException` with clear messages.
  - Implement global exception filter.

---

## 🧪 Testing

- Use **Jest**.
- Unit test services.
- E2E test important routes with `supertest`.
- Mock database calls in unit tests.
- Use in-memory DB for e2e tests.

---

## 📜 Example Module Creation Command

```bash
nest g module modules/example
nest g controller modules/example --flat
nest g service modules/example --flat
```

---

## 🔧 Angular CLI Usage Rules

- **ALWAYS use Angular CLI** for generating components, services, and other Angular artifacts
- **Use these commands for page creation**:
  ```bash
  ng generate component pages/page-name --standalone --skip-tests
  ng generate service core/services/service-name --skip-tests
  ng generate interface core/models/model-name
  ```
- **Component generation flags**:
  - `--standalone`: Generate standalone components (required)
  - `--skip-tests`: Skip test file generation initially
  - `--inline-template=false`: Ensure HTML files are separate
  - `--inline-style=false`: Ensure SCSS files are separate
- **Always run CLI commands from the `/front-app` directory**
- **Follow naming conventions**: `page-name.component.ts`, `service-name.service.ts`

---

## 📦 Example Entity

```ts
@Entity("example")
export class ExampleEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
```

---

## ✅ Summary of Rules

1. Modular architecture (one folder per feature).
2. DTOs for all input/output data.
3. No business logic in controllers.
4. Strong typing — no `any`.
5. Always use migrations.

## 📁 Estructura de Directorios Frontend (Angular)

**Componentes, Pipes y Directivas generales** estarán a nivel raíz del front, al mismo nivel que `pages`:

```
src/app/
├── core/
│   ├── repositories/     # Data access layer
│   └── services/        # Business logic services
├── components/          # Componentes generales reutilizables
├── pipes/              # Pipes generales reutilizables
├── directives/         # Directivas generales reutilizables
├── pages/              # App pages (one folder per page)
│   ├── home/
│   │   ├── components/ # Dumb UI components (standalone)
│   │   ├── containers/ # Smart components (standalone, connect to services)
│   │   ├── home.routes.ts
│   │   └── index.ts
│   └── dashboard/
│       ├── components/
│       ├── containers/
│       └── dashboard.routes.ts
└── app.routes.ts       # Main routing
```

**NO hay directorio `shared`** - los componentes generales van directamente en la raíz de `app/`.

**NOTA**: Esta estructura es solo para el frontend (Angular). El backend (NestJS) mantiene su estructura modular original.

-Siempre inicia las frases con un "Vamos a darle caña Borja!".
