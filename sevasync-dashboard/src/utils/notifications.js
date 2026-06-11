/**
 * Factory for the notification objects pushed into the global notifications
 * array via setNotifications(prev => [createNotification(...), ...prev]).
 *
 * The identical shape was copy-pasted 10+ times across BloodBankPage,
 * ResourcesPage, VolunteersPage, and UsersPage.
 *
 * @param {{ type: string, category: string, title: string, message: string, iconName: string, color: string, bg: string }} opts
 * @returns {object} notification object with stable shape
 */
export function createNotification({ type, category, title, message, iconName, color, bg }) {
  return {
    id: Date.now(),
    type,
    category,
    title,
    message,
    time: 'Just Now',
    iconName,
    color,
    bg,
  };
}
