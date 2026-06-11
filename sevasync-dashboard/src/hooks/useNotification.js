import { useState, useCallback } from 'react';

/**
 * Shared hook for managing toast notification state.
 *
 * Two variants are supported:
 *   - "simple"  → { message, type }           (InventoryPage, ResourcesPage, VolunteersPage)
 *   - "detailed" → { title, message, type }   (CasesPage, BloodBankPage)
 *
 * @param {number} duration  auto-dismiss time in ms (default 3000)
 * @returns {{ notification, showNotification, clearNotification }}
 */
export function useNotification(duration = 3000) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((titleOrMessage, messageOrType, maybeType) => {
    let payload;
    if (maybeType !== undefined) {
      // detailed: showNotification(title, message, type)
      payload = { title: titleOrMessage, message: messageOrType, type: maybeType };
    } else if (typeof messageOrType === 'string' && ['success', 'error', 'info', 'warning'].includes(messageOrType)) {
      // simple: showNotification(message, type)
      payload = { message: titleOrMessage, type: messageOrType };
    } else if (messageOrType !== undefined) {
      // detailed without explicit type: showNotification(title, message)
      payload = { title: titleOrMessage, message: messageOrType, type: 'info' };
    } else {
      // single arg: showNotification(message)
      payload = { message: titleOrMessage, type: 'success' };
    }
    setNotification(payload);
    setTimeout(() => setNotification(null), duration);
  }, [duration]);

  const clearNotification = useCallback(() => setNotification(null), []);

  return { notification, showNotification, clearNotification };
}
