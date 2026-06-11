import { useState, useMemo, useEffect } from 'react';

/**
 * Shared hook for client-side pagination.
 *
 * Duplicated in InventoryPage, ResourcesPage, VolunteersPage, and UsersPage.
 *
 * @param {Array} items          Full (already filtered) array of items
 * @param {number} itemsPerPage  How many items per page
 * @param {Array} resetDeps      Dependencies that should reset the page to 1
 * @returns {{ currentPage, setCurrentPage, paginatedItems, totalPages }}
 */
export function usePagination(items, itemsPerPage, resetDeps = []) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  const totalPages = Math.ceil((items?.length || 0) / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return (items || []).slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  return { currentPage, setCurrentPage, paginatedItems, totalPages };
}
