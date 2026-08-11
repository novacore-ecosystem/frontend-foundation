/**
 * Re-exports `MessageCode` from `../../api/error` rather than redeclaring
 * it — `api/error` already mirrors the backend's `MessageCode` enum
 * (`BuildingBlock.Domain/Enums/MessageCode.cs`) verbatim, and this
 * module builds translation on top of that single source rather than
 * introducing a second error-code definition.
 */
export { MessageCode } from "../../api/error";
