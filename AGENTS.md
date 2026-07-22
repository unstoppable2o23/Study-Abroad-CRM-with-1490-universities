<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Session: Jul 21, 2026 — University logos, online courses, MBBS abroad, study-abroad guidance

### What was completed
1. **logoUrl** added to all 1,241 universities using `ui-avatars.com/api` (dynamic SVG avatars, no copyright issues) via `prisma/add-logos.ts`
2. **Online course fees** imported: 15 existing universities updated with `feeStructure.onlinePrograms` data from matchtocollege.com; 7 new online-specific university entries created (DSU, KL, NMIMS, Northcap, UPES, Bharath, BIMTECH Online) via `prisma/import-online-courses.ts`
3. **MBBS abroad data**: 7 new countries created (Russia, Georgia, Kazakhstan, Kyrgyzstan, Philippines, Bangladesh, Uzbekistan) with 41 MBBS universities, each with fee data in `feeStructure.mbbs` via `prisma/import-mbbs-abroad.ts`
4. **Study-abroad guidance**: 7 countries (USA, UK, Canada, Australia, Germany, Ireland, New Zealand) updated with overview, education system, visa info, work/PR opportunities, living costs, popular courses via `prisma/import-study-abroad.ts`
5. All temp scripts kept for reuse: `prisma/add-logos.ts`, `prisma/import-online-courses.ts`, `prisma/import-mbbs-abroad.ts`, `prisma/import-study-abroad.ts`

### Key data points
- Total universities: 1,460 (1,092 India, 368 international)
- Total countries: 33 (+7 MBBS destinations)
- All universities have logoUrl via ui-avatars.com
- 62 universities have feeStructure data (online programs + MBBS)
- 7 countries enriched with study-abroad guidance data
- **State field populated**: 1,062/1,092 Indian universities have `state` field set (860 had state-like city values moved, 202 mapped from city→state via mapping table)
- **State dropdown filter** added to super-admin, admin, and dashboard university pages
- State filter supported in 3 API routes: `/api/universities`, `/api/universities/search`, `/api/admin/universities`
- 30 Indian universities remain without state (no city or unmapped values like "Dubai")

### Build note
- Run `set NODE_OPTIONS=--max-old-space-size=12288` before `npm run build`
