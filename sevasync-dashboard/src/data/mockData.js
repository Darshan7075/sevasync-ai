
// Mapped from community_reports_1000.csv (Partial Sample)
export const communityReports = [
  { id: 1, area: "Ahmedabad", lat: 22.118362, lng: 72.012157, issue: "Medical", group: "Disabled", people: 17, urgency: "Low", score: 4, timestamp: "2026-04-17 05:47:33", description: "Food issue reported in Ahmedabad" },
  { id: 3, area: "Surat", lat: 22.855691, lng: 70.992009, issue: "Medical", group: "Children", people: 70, urgency: "Medium", score: 7, timestamp: "2026-04-17 13:47:33", description: "Food issue reported in Surat" },
  { id: 4, area: "Navsari", lat: 22.118469, lng: 71.211621, issue: "Education", group: "Women", people: 44, urgency: "High", score: 10, timestamp: "2026-04-15 00:47:33", description: "Shelter issue reported in Navsari" },
  { id: 6, area: "Surat", lat: 21.741225, lng: 72.271093, issue: "Food", group: "Children", people: 96, urgency: "High", score: 8, timestamp: "2026-04-15 11:47:33", description: "Water issue reported in Surat" },
  { id: 8, area: "Navsari", lat: 21.647657, lng: 70.384956, issue: "Education", group: "Disabled", people: 74, urgency: "High", score: 9, timestamp: "2026-04-16 15:47:33", description: "Medical issue reported in Navsari" },
  { id: 9, area: "Vadodara", lat: 20.625017, lng: 70.704361, issue: "Medical", group: "Disabled", people: 89, urgency: "Medium", score: 7, timestamp: "2026-04-17 10:47:33", description: "Medical issue reported in Vadodara" },
];

// Mapped from volunteers_1000.csv
export const volunteers = [
  { id: 1, name: "Volunteer 1", role: "Medical", city: "Surat", status: "Active", joined: "2026-04-17" },
  { id: 2, name: "Volunteer 2", role: "Education", city: "Vadodara", status: "Active", joined: "2026-04-17" },
  { id: 3, name: "Volunteer 3", role: "Medical", city: "Rajkot", status: "Active", joined: "2026-04-17" },
];

// Mapped from resources_500.csv
export const resources = [
  { id: 1, type: "Food Packets", quantity: 36, location: "Vadodara", expiry: "2026-04-20" },
  { id: 2, type: "Shelter Kits", quantity: 176, location: "Vadodara", expiry: "2026-05-09" },
  { id: 3, type: "Shelter Kits", quantity: 351, location: "Ahmedabad", expiry: "2026-05-01" },
];

export const tasks = [
  { id: 1, title: "Emergency Medical Supply", assignedTo: "Volunteer 1", priority: "High", status: "In Progress" },
];

export const urgencyDistribution = [
  { name: 'High (8-10)', value: 420, color: '#ef4444' },
  { name: 'Medium (5-7)', value: 380, color: '#f97316' },
  { name: 'Low (1-4)', value: 200, color: '#10b981' },
];

export const issueTypes = [
  { name: 'Medical', count: 450 },
  { name: 'Food', count: 320 },
  { name: 'Water', count: 210 },
  { name: 'Shelter', count: 180 },
  { name: 'Education', count: 88 },
];

export const taskStatusDistribution = [
  { name: 'Pending', value: 312, color: '#f59e0b' },
  { name: 'In Progress', value: 245, color: '#3b82f6' },
  { name: 'Completed', value: 299, color: '#10b981' },
];

export const stats = {
  totalReports: 1000,
  totalResources: 500,
  totalVolunteers: 1000,
  totalTasks: 250
};
