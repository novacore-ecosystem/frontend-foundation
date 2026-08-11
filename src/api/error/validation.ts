/**
 * Mirrors `NovaCore.BuildingBlock.Application.Exceptions.ValidationError`
 * (`BuildingBlock.Application/Exceptions/ValidationException.cs`) — the
 * backend's per-field validation error shape: a property name and a
 * message, with no error code or attempted-value field.
 *
 * ## Known gap (documented, not fixed here — this is a frontend repo)
 *
 * As of this audit, the backend does **not** actually send an array of
 * these on the wire. `ValidationException`'s constructor folds
 * `ValidationErrors` into a single joined string for the `Message`
 * property (for logging), but never passes them as the `Fail(...)`
 * factory's `details` argument — so `ApiResponse.details` is always
 * `null` for a validation failure today, even though the domain model
 * clearly supports a structured field-error list. Consumers should not
 * assume `ApiResponse.details` will contain a `ValidationFieldError[]`
 * until the backend is changed to actually populate it. This type is
 * included for forward compatibility and to document the intended shape
 * once that gap is closed.
 */
export interface ValidationFieldError {
  propertyName: string;
  errorMessage: string;
}
