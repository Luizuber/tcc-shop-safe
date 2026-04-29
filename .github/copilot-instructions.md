# Copilot Instructions for TCC Project

## Project Overview
This is a TCC (Trabalho de Conclusão de Curso) project consisting of a NestJS backend API for analyzing product trustworthiness. The system evaluates products based on ratings, review counts, site reputation, HTTPS usage, and market price comparison, returning a score and justifications.

## Architecture
- **Backend**: NestJS application with modular structure
- **Key Module**: `analysis/` handles product analysis logic
- **Data Flow**: Client sends `AnalyzeProductDto` to `/analysis/analyze-product` endpoint, receives score and justification array
- **Enums**: Use Portuguese values ('BOA', 'MEDIA', 'RUIM' for reputation; 'ABAIXO', 'NORMAL', 'ACIMA' for price comparison)

## Developer Workflows
- **Development**: `npm run start:dev` (watches for changes)
- **Building**: `npm run build` (outputs to `dist/`)
- **Testing**: `npm run test` (Jest unit tests), `npm run test:e2e` (end-to-end)
- **Linting**: `npm run lint` (ESLint with auto-fix)
- **Formatting**: `npm run format` (Prettier on `src/**/*.ts` and `test/**/*.ts`)
- **Debugging**: `npm run start:debug` for debug mode, `npm run test:debug` for test debugging

## Code Patterns
- **DTOs**: Define input structures in `dto/` folders (e.g., `analyze-product.dto.ts`)
- **Services**: Contain business logic, return objects with score and justifications
- **Controllers**: Thin layer, delegate to services, use `@Post` for analysis endpoints
- **Scoring Logic**: Accumulate score (0-100) with conditional additions, build justification strings in Portuguese
- **Modules**: Group related controllers/services in feature modules (e.g., `AnalysisModule`)

## Conventions
- User-facing strings in Portuguese (e.g., 'Produto bem avaliado')
- HTTPS check adds 10 points if true, no penalty if false but noted in justification
- Rating thresholds: >=4.0 (+25), >=3.0 (+15), else (+5)
- Reviews: >500 (+15), >=100 (+10), else (+5)
- Site reputation: 'BOA' (+25), 'MEDIA' (+10), 'RUIM' (0)

## Key Files
- `backand/backend-api/src/analysis/analysis.service.ts`: Core scoring algorithm
- `backand/backend-api/src/analysis/dto/analyze-product.dto.ts`: Input validation structure
- `backand/backend-api/src/main.ts`: Server bootstrap with PORT env support

## Integration Points
- Backend runs on port 3000 (or PORT env), logs listening port for debugging
- Planned VS Code extension in `extension/` folder (currently empty)