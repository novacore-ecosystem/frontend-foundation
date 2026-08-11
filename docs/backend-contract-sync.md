# Backend Contract Synchronization

`@novacore/frontend-foundation` mirrors a specific set of the backend's shared Building Blocks. This document is the map between "what's in this package" and "where it actually comes from in the backend" — so that when the backend changes, any developer (on any machine, with only the backend repo checked out) can find the canonical source in seconds, without depending on this document ever being perfectly up to date.

All backend paths below are **repository-relative to the backend repository root**, referred to as `core-backend/` (the checkout may be named differently locally — never rely on a machine-specific absolute path; see "Path policy" below).

## Path policy

- Never document an absolute filesystem path (no `/home/...`, no `C:\...`, no `~/...`).
- Always give a path relative to the relevant repository's root (`core-backend/` for backend paths, this package's root for frontend paths).
- Backend files move during refactors. For every contract below, prefer searching by **search anchor** (a distinctive type/constant name) over trusting the path alone — the path is a starting point, the anchor is what actually survives a `git mv`.

## Contract map

| Contract | Frontend location | Backend location | Search anchors | Change frequency |
|---|---|---|---|---|
| API Response envelope | `src/api/response/` | `core-backend/src/BuildingBlocks/BuildingBlock.Application/Abstractions/Common/ApiResponse.cs` | `ApiResponse`, `class ApiResponse<T>` | Moderate |
| Pagination | `src/api/pagination/` | `core-backend/src/BuildingBlocks/BuildingBlock.Application/Abstractions/Common/PaginatedResult.cs`, `CursorPaginatedResult.cs` | `PaginatedResult`, `CursorPaginatedResult`, `HasNextPage` | Moderate |
| Search criteria (request shape) | `src/api/search/` | `core-backend/src/BuildingBlocks/BuildingBlock.Criteria/Requests/CriteriaRequest.cs`, `CriteriaFilter.cs`, `CriteriaSort.cs` | `CriteriaRequest`, `CriteriaFilter`, `CriteriaSort` | Moderate |
| Filter operators | `src/api/search/` (`CriteriaOperators`) | `core-backend/src/BuildingBlocks/BuildingBlock.Criteria/Enums/CriteriaOperator.cs`, `CriteriaOperatorJsonConverter.cs` | `CriteriaOperator`, `CriteriaOperatorJsonConverter` | Moderate |
| Sort direction | `src/api/search/` (`SortDirections`) | `core-backend/src/BuildingBlocks/BuildingBlock.Criteria/Requests/SortDirection.cs` | `SortDirection`, `LowerCaseStringEnumConverter` | Stable |
| Pagination/search defaults & limits | `src/api/pagination/` (`PAGINATION_DEFAULTS`) | `core-backend/src/BuildingBlocks/BuildingBlock.Criteria/Validation/CriteriaRequestValidator.cs` | `CriteriaRequestValidator`, `MaxPageSize` | Moderate |
| Error/status codes | `src/api/error/` (`MessageCode`) | `core-backend/src/BuildingBlocks/BuildingBlock.Domain/Enums/MessageCode.cs`, `Attributes/MessageCodeAttribute.cs` | `MessageCode`, `MessageCodeAttribute` | **High** |
| Error response (validation) | `src/api/error/` (`ValidationFieldError`) | `core-backend/src/BuildingBlocks/BuildingBlock.Application/Exceptions/ValidationException.cs` | `ValidationError`, `ValidationException` | **High** |
| Validation regex patterns | `src/validation/patterns/` | `core-backend/src/BuildingBlocks/BuildingBlock.SharedKernel/RegexPatterns/Identity.cs`, `Formatting.cs` | `RegexPatterns`, `GeneratedRegex` | **High** |
| Permissions | `src/authorization/permissions/` | `core-backend/src/BuildingBlocks/BuildingBlock.SharedKernel/Constants/Permissions.cs` | `Permissions`, `SupportedValues` | **High** |
| Permission evaluation rule | `src/authorization/helpers/` | `core-backend/src/BuildingBlocks/BuildingBlock.Web/Authorization/PermissionAuthorization.cs` | `HasAnyPermission`, `PermissionAuthorization` | **High** |
| Permission claim wire format | `src/authorization/helpers/`, `src/authorization/types/` | `core-backend/src/BuildingBlocks/BuildingBlock.SharedKernel/Constants/AppClaimTypes.cs` | `AppClaimTypes`, `"permission"` | Moderate |
| Current-user permissions ("me" response) | `src/authorization/types/` (`CurrentUserAuthorization`) | `core-backend/src/Services/User/User.Application/Features/Users/Queries/GetUserDetail/GetUserDetailQuery.cs` | `GetUserDetailResponse`, `IReadOnlyList<string> Permissions` | Moderate |
| Tenant bootstrap | `src/bootstrap/` | *No single canonical backend endpoint found* — see "Known gaps" below | — | — |

## Synchronization priority

**High-frequency** — expect these to change as the backend evolves feature-by-feature; re-audit on every backend release that touches auth or error handling:
- Permissions (`Permissions.cs`) — new permission keys are added whenever a new module/action is added to any service.
- Error/status codes (`MessageCode.cs`) — new codes are added per-service as error handling matures.
- Error response / validation error shape — currently has a known gap (see below); watch for the backend starting to actually populate `ApiResponse.details`.
- Validation regex patterns — new canonical patterns may be added to `RegexPatterns`; existing ones may be fixed (see the phone number issue below).

**Moderate** — change less often, usually only when the underlying architecture shifts, not per-feature:
- API response envelope, pagination, search criteria, filter operators, permission claim wire format, current-user permissions response.

**Stable** — essentially fixed:
- Sort direction (two values, unlikely to grow).
- Basic primitives this package relies on (`Intl`, `Date`, `JSON` — not backend-owned, no sync needed).

## Synchronization workflow

Applies to any contract in the table above, but especially the **High-frequency** ones:

1. **Locate the backend source.** Use the search anchor from the table (`grep`/full-text search across `core-backend/`) rather than trusting the path alone — it may have moved.
2. **Read the full current definition**, not a cached memory of it. Diff it mentally (or literally) against the corresponding frontend file's doc comment, which cites the same anchor.
3. **Update the frontend-foundation module** — keep the change additive where possible (new permission keys, new `MessageCode` members) rather than renaming existing exports. Update the module's doc comment to reflect the re-verified backend citation.
4. **Update or add tests** that assert the exact new wire shape/value — see `tests/authorization/permissions.test.ts` for the pattern (every constant asserted verbatim, plus a structural drift check that every `Permissions` leaf is present in `PERMISSION_VALUES`).
5. **Run the full validation suite:** `pnpm typecheck && pnpm test && pnpm build`.
6. **Version bump** (semver): additive changes (new permission/error code) are `minor`/`patch`; a rename or shape change affecting existing consumers is `major`. Note the change in `CHANGELOG.md`.
7. Frontend applications upgrade this package on their own schedule — this package does not push changes to them.

For permissions specifically, the workflow is the same, with one extra manual-verification step: because `Permissions.cs` is small enough to read in full, prefer copying the entire file's constant declarations verbatim over transcribing individual values, to eliminate transcription drift.

## Known gaps / open items

These were discovered during the backend audit and are intentionally **not** papered over in the frontend contracts:

- **No single canonical "tenant bootstrap" endpoint exists in the backend.** `TenantBootstrap` (`src/bootstrap/`) remains a generic, forward-looking contract not mirrored from one specific backend response — see its own doc comment.
- **`AuditAction` was audited but not mirrored.** No `[JsonConverter]` attribute and no global `JsonStringEnumConverter` registration were found anywhere in the HTTP pipeline, so its actual wire serialization (string vs. numeric) could not be confirmed. Do not add it to `src/contracts` (a folder that consequently does not exist in this package yet) until the backend confirms/fixes this.
- **The backend's canonical phone-number regex (`RegexPatterns.PhoneNumber()`) is broken** (it embeds JS regex-literal delimiters inside a .NET pattern) and is not mirrored. This package's `phone` module (backed by `libphonenumber-js`) remains authoritative for phone validation instead.
- **Field-level validation errors are computed server-side but never sent on the wire** (`ApiResponse.details` is always `null` today, even for validation failures) — `ValidationFieldError` is defined for forward compatibility, not because it's currently populated.
- **Two independent "permission" vocabularies exist in the User service.** Only the colon-separated `Permissions.cs` vocabulary (the JWT `permission` claim, enforced by `PermissionAuthorization.HasAnyPermission`) is mirrored here. User service also has its own dot-separated `PermissionCollection` value object (e.g. `"product.product.read"`) backing a separate, currently-unenforced business concept with no HTTP endpoint exposing it — do not merge the two into one frontend type.
- **`Permissions.User` (singular) and `Permissions.Users` (plural) are different concepts that share a near-identical name** in the backend itself. Preserved as-is (not renamed) per the "don't rename backend-mirrored properties casually" rule, but flagged here since it's an easy mistake to make when adding new call sites.
