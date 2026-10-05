# FESTÉKINDEX

Magyar festékipari szakmai kereső-, adatbázis- és tudásplatform.  
Domain: [festekindex.hu](https://festekindex.hu)

## Stack

- Next.js (App Router) + TypeScript
- SEO-first (SSG / `generateMetadata`, sitemap, robots, JSON-LD)
- TypeScript adatréteg + `repository.ts` (nincs külső DB az első körben)
- Design baseline: `festekindex_sidebar_hero_v3.html`

## Fejlesztés

```bash
npm install
npm run dev
```

Nyisd meg: [http://localhost:3000](http://localhost:3000)

## Adatréteg

A UI **csak** a repository-n keresztül ér el adatot:

```ts
import { getBrandBySlug, getRelatedEntities, searchEntities } from "@/lib/data/repository"
```

Seed fájlok (`organizations.ts`, `brands.ts`, …) nem importálhatók komponensekből.

## Fő route-ok

- `/` — főoldal (hero + kereső)
- `/cegek/[slug]`, `/markak/[slug]`, `/technologiak/[slug]`
- `/kategoriak/[slug]`, `/tudastar/[slug]`, `/termekcsaladok/[slug]`
- `/kereses?q=`
- `/sitemap.xml`, `/robots.txt`
