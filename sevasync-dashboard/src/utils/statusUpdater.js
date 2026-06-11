/**
 * Shared helper for the "optimistic API update with local fallback" pattern.
 *
 * The same try/catch structure was duplicated in CasesPage, ReportsPage,
 * and TasksPage for handleUpdateStatus, and a similar pattern existed for
 * handleDelete in ReportsPage.
 *
 * @param {Function}  apiCall    async function that calls the backend
 * @param {Function}  setState   React state setter (e.g. setReports)
 * @param {Function}  updater    function that produces the new array: (prev) => next
 * @param {Function}  [onError]  optional error callback
 */
export async function optimisticUpdate(apiCall, setState, updater, onError) {
  try {
    await apiCall();
  } catch (error) {
    if (onError) onError(error);
  }
  // Always apply the local state update (optimistic / fallback)
  setState(updater);
}
