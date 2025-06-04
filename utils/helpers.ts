// Format date to a readable string
export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
};

interface Log {
  title: string;
  location: string;
  description: string;
  tags?: string[];
}

// Filter logs by search term
export const filterLogsBySearchTerm = (logs: Log[], searchTerm: string): Log[] => {
  if (!searchTerm.trim()) return logs;

  const term = searchTerm.toLowerCase();
  return logs.filter(log =>
    log.title.toLowerCase().includes(term) ||
    log.location.toLowerCase().includes(term) ||
    log.description.toLowerCase().includes(term) ||
    (log.tags && log.tags.some((tag: string) => tag.toLowerCase().includes(term)))
  );
};

// Get available travel categories
export const getTravelCategories = (): string[] => {
  return [
    'Adventure',
    'Beach',
    'City',
    'Culture',
    'Family',
    'Food',
    'Hiking',
    'Historical',
    'Mountain',
    'Nature',
    'Relaxation',
    'Road Trip',
    'Romantic',
    'Shopping',
    'Sightseeing',
    'Solo Travel',
    'Wildlife'
  ];
};
