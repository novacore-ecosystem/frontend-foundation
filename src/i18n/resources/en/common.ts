/**
 * Common, genuinely cross-application UI terminology — generic actions,
 * statuses, pagination, and table states used the same way by every
 * NovaCore admin surface. This is the English baseline: `vi`/`zh-CN`
 * equivalents are type-checked against this file's shape (`satisfies
 * typeof common`), so an incomplete translation is a compile error, not
 * a silent runtime gap.
 */
export const common = {
  actions: {
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    search: "Search",
    reset: "Reset",
    confirm: "Confirm",
    apply: "Apply",
    refresh: "Refresh",
    view: "View",
    back: "Back",
    next: "Next",
    submit: "Submit",
  },
  status: {
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    success: "Success",
    failed: "Failed",
    draft: "Draft",
    archived: "Archived",
  },
  pagination: {
    next: "Next",
    previous: "Previous",
    first: "First",
    last: "Last",
    page: "Page",
    of: "of",
    itemsPerPage: "Items per page",
  },
  table: {
    empty: "No data",
    loading: "Loading…",
    noResults: "No results found",
  },
  welcome: "Welcome, {{name}}",
};
