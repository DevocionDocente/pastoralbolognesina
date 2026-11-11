# AGENTS.md

Guidelines for any agent or developer working on **Pastoral Bolognesina**. Read this before writing code.

- Requirements: `docs/especificacion.pdf` (source: `docs/especificacion.tex`)
- Milestone plan: `docs/hitos.pdf` (source: `docs/hitos.tex`)

## Product

Web system where the pastoral area registers activities (photos, videos, YouTube links, PDF/DOCX/XLSX/PPTX documents) in a private `/dashboard`, OpenAI analyzes the media, and parents search everything from a public gallery using natural language.

## Stack

| Concern | Choice |
| --- | --- |
| Language | TypeScript (strict) |
| Web | Next.js App Router, React Server Components by default |
| UI | Tailwind CSS + shadcn/ui primitives |
| HTTP API | Hono mounted in `src/app/api/[[...route]]/route.ts`, `@hono/zod-openapi` |
| API docs | Scalar at `/api/docs`, OpenAPI spec at `/api/openapi.json` |
| User manual | Fumadocs at `/manual`, MDX in `content/manual` |
| Auth | Better Auth (email + password; members self-register as `pending` until an admin grants a role) |
| DB | PostgreSQL + `pgvector` + `unaccent`, Drizzle ORM |
| Files | MinIO (S3 API) with presigned uploads |
| Jobs | `pg-boss` queues; the worker (`src/worker`) runs inside the app process, started from `src/instrumentation.ts` |
| AI | OpenAI: `gpt-6-luna` (vision/summaries), `gpt-transcribe` (audio), `text-embedding-3-small` (embeddings) |
| Package manager | pnpm |

## Non-negotiable rules

1. **English only in code**: identifiers, file names, folders, commits, logs, API paths and OpenAPI descriptions. User-facing UI text and the user manual are in **Spanish**.
2. **Almost no comments.** Code must explain itself through names. A comment is allowed only for a non-obvious *why* (a workaround, an external constraint). Never comment *what* the code does, never leave commented-out code, no JSDoc on internal code.
3. **Every HTTP endpoint is documented in Scalar.** Define routes only with `createRoute` from `@hono/zod-openapi`, with request/response Zod schemas, `tags`, `summary` and error responses. An endpoint missing from `/api/docs` is not done.
4. **Every dashboard feature is documented in the user manual** (`content/manual`, Spanish, step by step, with screenshots). A dashboard feature missing from `/manual` is not done.
5. **Object-oriented backend** (see Architecture).
6. **Tiny, modular UI components** (see Frontend).
7. **Each milestone ends usable**: something that can be demoed end to end, not half-built layers.
8. **Documentation is continuous, never deferred.** Scalar API docs and the user manual are updated in the same milestone (ideally the same commit) as the code they describe. During deployment, the operations guide (`content/manual/operations`) is written as each service is configured.

## Architecture

Modular monolith. Modules: `auth` (users, roles, permissions, sessions) and `activities` (activities, media, AI analysis, search, public gallery). Each module has three layers, and each layer depends only on the one below it:

- **Infrastructure**: Next.js pages, Hono controllers, worker job handlers, external clients (OpenAI, MinIO, FFmpeg, yt-dlp). Validates input and calls services.
- **Services**: business logic and permission checks. Depends on interfaces, never on concrete clients or Drizzle.
- **Persistence**: repositories. The only place that touches Drizzle or SQL.

```
src/
  app/                         # Next.js routes (infrastructure)
    (public)/                  # gallery, search, activity detail
    dashboard/                 # private panel
    manual/                    # Fumadocs user manual
    api/[[...route]]/route.ts  # mounts the Hono app
  modules/
    auth/
      domain/                  # entities, value objects, permission catalog, errors
      services/
      repositories/
      http/                    # Hono controllers + OpenAPI route definitions
      ui/                      # module-specific React components
      schema.ts                # Drizzle tables
    activities/
      domain/  services/  repositories/  http/  ui/  processors/  schema.ts
  server/
    container.ts               # composition root: the only place that wires classes with `new`
    http/                      # Hono app, error handler, auth middleware, OpenAPI + Scalar setup
  shared/
    ui/                        # generic presentational components (shadcn/ui lives here)
    lib/                       # tiny framework-agnostic helpers
  worker/                      # pg-boss entrypoint and job registration
content/manual/                # user manual (MDX, Spanish)
drizzle/                       # generated migrations
```

### Backend OOP rules

- Services, repositories, controllers, processors and clients are **classes**, one class per file, file named after the class in kebab-case (`activity-service.ts` → `ActivityService`).
- Dependencies are injected through the constructor and typed with interfaces (`ActivityRepository` interface, `DrizzleActivityRepository` implementation). Classes never instantiate their own dependencies; wiring happens only in `src/server/container.ts`.
- Methods are short and do one thing. Prefer early returns. No method over ~25 lines.
- Domain errors are classes extending `DomainError` (`NotFoundError`, `ForbiddenError`, `ValidationError`); the HTTP error handler maps them to status codes.
- Permissions are checked in services through `Authorizer` (auth module) and `ActivityGuard` (activities module), never only in the UI. The permission catalog lives in `modules/auth/domain/permissions.ts`; roles are data.
- Media processing uses a strategy per media type: a `MediaProcessor` interface with `PhotoProcessor`, `VideoProcessor`, `YoutubeProcessor`, `DocumentProcessor`, selected by a `MediaProcessorRegistry`.

### Frontend rules

- React components are **function components** (React does not favor class components). OOP applies to the backend; the UI favors composition.
- One component per file, ideally under 60 lines. If a component has more than one responsibility, split it.
- Server Components by default; add `"use client"` only to the smallest leaf that needs interactivity.
- Presentational components receive typed props and contain no data fetching. Data is loaded in pages/server components or through small hooks.
- Client components talk to the backend only through the documented API: `ApiClient` (`src/shared/lib/api-client.ts`) plus one small API class per module (`modules/<module>/ui/api/*-api.ts`) typed with `import type` from the route schemas. Never import services into client code.
- Server components (pages) may call services from `container()` directly after `requirePermission()` / `currentProfile()`.
- Mutations from the UI use `useMutation` (`src/shared/hooks/use-mutation.ts`): toast + `router.refresh()`. API errors are translated to Spanish in `src/shared/lib/error-messages.ts`.
- Reuse `FormDialog`, `FormField`, `SelectField` and `PageHeader` from `src/shared/ui` instead of rebuilding forms.

## Conventions

- Names: `PascalCase` classes/types/components, `camelCase` variables/functions, `kebab-case` files and folders, `SCREAMING_SNAKE_CASE` env vars. DB tables and columns in `snake_case`, English (`activities`, `media_items`, `created_at`).
- API paths are English, plural and RESTful: `/api/activities`, `/api/activities/{id}/media`, `/api/users`, `/api/roles`, `/api/search`.
- Validate every external input with Zod at the infrastructure layer.
- Config comes only from a validated `env.ts`; never read `process.env` elsewhere.
- Commits follow Conventional Commits in English (`feat(activities): add youtube media`).
- Do not add dependencies without a clear need; prefer the ones listed in Stack.

## Commands

| Command | Purpose |
| --- | --- |
| `docker compose up -d` | Local PostgreSQL (pgvector) and MinIO |
| `cp .env.example .env` | Local configuration (then set `BETTER_AUTH_SECRET`) |
| `pnpm dev` | Dev server; migrations and root admin seed run on startup (`src/instrumentation.ts`) |
| `pnpm db:generate` | Generate a Drizzle migration after editing a `schema.ts` |
| `pnpm manual:screenshots` | Regenerate user manual screenshots into `public/manual` (dev server must be running) |
| `pnpm lint` / `pnpm typecheck` / `pnpm build` | Quality gates |

Production runs `docker-compose.prod.yml` (app + PostgreSQL + MinIO) on Dokploy.

| Command | Purpose |
| --- | --- |
| `pnpm import:folder --dir <path> [--url --email --password]` | Bulk import: every subfolder becomes a published activity; year and recurring series come from the folder name (`Semana Santa 2024`). Re-runs skip existing activities and files |
| `pnpm openai:setup [--vps <composeId>]` | Verify an OpenAI key (models, embeddings, credits) and store it in `.env` and optionally on the VPS |

Notes:
- The official `minio/minio` image is no longer published; use `cgr.dev/chainguard/minio`.
- `shadcn add` writes `import { cn } from "cn"` and installs an unrelated `cn` package. After adding components run `sed -i 's#from "cn"#from "@/shared/lib/utils"#' src/shared/ui/*.tsx` and `pnpm remove cn`.
- Pastoral profile pipeline: `analyze-media` → `classify-media` (file type) and `summarize-activity` → `generate-profile` → `virtue-art` (explanation + image of new virtues). The worker requeues missing profiles, virtue images and categories on start. Fields listed in `activities.manual_fields` and media with `category_source = 'manual'` are never overwritten by the AI; automatic runs keep an existing reflection image. Images are generated with `OPENAI_IMAGE_MODEL` and stored under `reflections/`. Every image is an `images.edit` call with the school references in `assets/school` (crest, student uniform, sweater and tracksuit, teachers' outfits; listed with their captions in `SchoolReferences`), so the runtime image copies `assets/`. A virtue can have its own image per activity (`activity_virtues.image_key`, job `activity-virtue-art`); otherwise the catalog image is shown.
- Virtues are deduplicated by `normalized_name` (no accents, lowercase); always resolve names through `VirtueResolver`.
- The container is a `globalThis` singleton, so hot reload does not pick up changes to services, repositories or the worker: restart `pnpm dev` after editing them.
- Access model: users have `status` (`pending` | `active` | `revoked`). Only `active` users get permissions; pending/revoked users see `AccessStatusScreen`. Every grant/revoke is written to `access_history`.
- `pnpm manual:screenshots [access] [activities]` drives the real UI with Playwright (flows live in `scripts/manual/`), creates and removes its own sample data, and doubles as the end-to-end check. Add a flow file per milestone.
- Uploads go straight from the browser to MinIO: `POST /api/activities/{id}/uploads` returns presigned multipart part URLs signed with `S3_PUBLIC_ENDPOINT`; server-side calls use `S3_ENDPOINT`. In production MinIO is exposed at its own HTTPS domain (staging: `files.pastoral.crafter.run`).
- Stored objects use generated keys (`activities/{activityId}/{uuid}.{ext}`); the original file name lives in `media_items.original_name` and is used for downloads.
- Permission model: effective permissions = role permissions ± per-user overrides (`user_permissions`, `granted` true adds / false removes), computed by `effectivePermissions()` in `ProfileService`; only `active` users get any. `UserPermissionService` stores the difference against the role and logs `permissions_changed` in `access_history`. Nobody can change their own permissions.
- `ActivityGuard` rules: activity data and publishing need `activities.update_own` (creator) or `activities.update_any`; files need `media.upload` / `media.edit` / `media.delete` on any activity (uploaders can always delete their own files); the pastoral profile needs `profiles.edit`. Panel access to activities is any of `CONTENT_PERMISSIONS`; the users page is any of `USER_ADMINISTRATION_PERMISSIONS` (`users.access` approves/revokes, `users.manage` creates accounts and adjusts permissions).
- AI analysis: uploads and YouTube links enqueue `analyze-media` jobs. `MediaAnalysisService` picks a `MediaProcessor` (photo, video, youtube, document), stores the result in `media_analyses`, and embeds chunks (`text-embedding-3-small`, 1536 dims) into `media_chunks` (pgvector, HNSW). Each finished file debounces a `summarize-activity` job that fills `activities.ai_summary`.
- The worker only starts when `OPENAI_API_KEY` is set and `WORKER_ENABLED` is true; without a key, files stay `pending` until it is configured. Instrumentation code is not hot-reloaded: restart `pnpm dev` after changing worker code.
- The runtime image ships FFmpeg, Python and the latest `yt-dlp`, configured with `--js-runtimes node` (YouTube requires a JS runtime).
- Search pipeline (`SearchRanker`): `SearchAssistant` asks the AI to expand the query and name catalog activities (ids constrained by a JSON-schema enum), retrieval runs for the query plus its variants (activity names match whole phrases), and an AI judge keeps only activities scoring 2–3. AI answers are cached 30 min and time out after `SEARCH_AI_TIMEOUT_MS`; on failure the unfiltered ranking is returned. Measure changes with `pnpm tsx scripts/search-eval.ts <baseUrl>`.
- Smart search (`GET /api/search`, `SearchService`): semantic candidates from `media_chunks` (cosine distance below `SEARCH_MAX_DISTANCE`, default 0.63, calibrated on real data) plus Spanish full-text over the analysis (any query term, `unaccent`), fused with Reciprocal Rank Fusion (`domain/search.ts`, keyword weight 0.5). Activities are ranked from their best files plus their own text; queries that name a recurring activity return it in `series`. Query embeddings are cached in memory.
- When the worker starts it requeues media left in `processing` (interrupted by a restart or deploy). This assumes a single app instance.
- `pnpm manual:screenshots search` uses the real imported content (it does not seed data); sample cleanups only delete series that no activity uses.
- Lucide no longer ships brand icons (no `YoutubeIcon`); use generic icons.
- `src/instrumentation.ts` is compiled as a separate bundle and creates the shared container, so error classes can come from another module copy: never use `instanceof DomainError`; use `isDomainError()` (and `orNotFound()` in pages).
- The Fumadocs `RootProvider` lives only in `src/app/manual/layout.tsx`; mounting it app-wide causes hydration mismatches when Radix dialogs open.
- Public gallery: `PublicGalleryService` (published content only) + `PublicGalleryPresenter` (adds presigned URLs) power both `/api/public/*` and the pages in `src/app/(public)`. Browsing without a query uses `PublicGalleryService`.
- Server code that builds the container must run after `await headers()` (or inside a request) so pages are not prerendered at build time without env vars.
- The Hono app is built lazily in `src/app/api/[[...route]]/route.ts` for the same reason.

## Definition of done

- Types compile (`pnpm typecheck`) and lint passes (`pnpm lint`).
- New endpoints appear in Scalar with schemas and examples.
- New dashboard features are described in the user manual.
- The milestone's "Documentación del hito" items in `docs/hitos.pdf` are done.
- The milestone's demo scenario in `docs/hitos.pdf` works end to end locally.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
