import { useState, useEffect } from 'react';

/**
 * Shared hook for debounced search input.
 *
 * Duplicated verbatim in VolunteersPage and ResourcesPage.
 *
 * @param {number} delay  Debounce delay in ms (default 300)
 * @returns {{ searchTerm, setSearchTerm, debouncedSearch }}
 */
export function useDebouncedSearch(delay = 300) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), delay);
    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return { searchTerm, setSearchTerm, debouncedSearch };
}
