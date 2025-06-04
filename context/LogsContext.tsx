import { generateId } from '@/utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

// Define the Log type
export interface Log {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  rating: number;
  images: string[];
  tags: string[];
  userId: string;
}

// Context type definition
interface LogsContextType {
  logs: Log[];
  loading: boolean;
  error: string | null;
  addLog: (log: Omit<Log, 'id'>) => Promise<void>;
  updateLog: (id: string, log: Partial<Log>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  getLogById: (id: string) => Log | null;
  getLogsByUser: (userId: string) => Log[];
  refreshLogs: () => Promise<void>;
}

export const LogsContext = createContext<LogsContextType>({
  logs: [],
  loading: false,
  error: null,
  addLog: async () => { },
  updateLog: async () => { },
  deleteLog: async () => { },
  getLogById: () => null,
  getLogsByUser: () => [],
  refreshLogs: async () => { },
});

interface LogsProviderProps {
  children: React.ReactNode;
}

// Sample data for initial logs
const SAMPLE_LOGS: Log[] = [
  {
    id: '1',
    title: 'Amazing Barcelona Trip',
    description: 'Explored the beautiful city of Barcelona. Visited Sagrada Familia and Park Güell.',
    location: 'Barcelona, Spain',
    latitude: 41.3851,
    longitude: 2.1734,
    date: new Date('2023-06-15').toISOString(),
    rating: 5,
    images: [
      'https://images.pexels.com/photos/819764/pexels-photo-819764.jpeg',
      'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg'
    ],
    tags: ['City', 'Culture', 'Architecture'],
    userId: 'user-123',
  },
  {
    id: '2',
    title: 'Serene Beach Getaway',
    description: 'Relaxed on the beautiful beaches of Bali. Enjoyed the sunset views and local cuisine.',
    location: 'Bali, Indonesia',
    latitude: -8.4095,
    longitude: 115.1889,
    date: new Date('2023-08-22').toISOString(),
    rating: 4,
    images: [
      'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg',
      'https://images.pexels.com/photos/1802255/pexels-photo-1802255.jpeg'
    ],
    tags: ['Beach', 'Relaxation', 'Food'],
    userId: 'user-123',
  },
  {
    id: '3',
    title: 'Mountain Hiking Adventure',
    description: 'Hiked the stunning Alps. Breathtaking views and challenging trails made this a memorable trip.',
    location: 'Swiss Alps, Switzerland',
    latitude: 46.8182,
    longitude: 8.2275,
    date: new Date('2023-10-05').toISOString(),
    rating: 5,
    images: [
      'https://images.pexels.com/photos/414122/pexels-photo-414122.jpeg',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg'
    ],
    tags: ['Mountain', 'Hiking', 'Adventure'],
    userId: 'google-user-123',
  },
];

export const LogsProvider: React.FC<LogsProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load logs from storage on app start
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const storedLogs = await AsyncStorage.getItem('logs');

        if (storedLogs) {
          setLogs(JSON.parse(storedLogs));
        } else {
          // If no logs in storage, use sample data
          setLogs(SAMPLE_LOGS);
          await AsyncStorage.setItem('logs', JSON.stringify(SAMPLE_LOGS));
        }
      } catch (err) {
        setError('Failed to load logs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  // Validate log data against the Log interface
  const validateLog = (log: Omit<Log, 'id'>): string | null => {
    if (!log.title?.trim()) return 'Title is required';
    if (!log.description?.trim()) return 'Description is required';
    if (!log.location?.trim()) return 'Location is required';
    if (typeof log.latitude !== 'number') return 'Valid latitude is required';
    if (typeof log.longitude !== 'number') return 'Valid longitude is required';
    if (!log.date) return 'Date is required';
    if (typeof log.rating !== 'number' || log.rating < 1 || log.rating > 5) {
      return 'Rating must be a number between 1 and 5';
    }
    if (!Array.isArray(log.images)) return 'Images must be an array';
    if (!Array.isArray(log.tags)) return 'Tags must be an array';
    if (!log.userId?.trim()) return 'User ID is required';

    return null;
  };

  // Add a new log
  const addLog = useCallback(async (log: Omit<Log, 'id'>) => {
    setError(null);
    setLoading(true);

    try {
      // Validate the incoming log data
      const validationError = validateLog(log);
      if (validationError) {
        throw new Error(validationError);
      }

      const newLog: Log = {
        ...log,
        id: generateId(),
      };

      const updatedLogs = [...logs, newLog];
      setLogs(updatedLogs);

      await AsyncStorage.setItem('logs', JSON.stringify(updatedLogs));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add log';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [logs]);

  // Update an existing log
  const updateLog = useCallback(async (id: string, updatedData: Partial<Log>) => {
    setError(null);
    setLoading(true);
    
    try {
      const logIndex = logs.findIndex(log => log.id === id);
      if (logIndex === -1) {
        throw new Error('Log not found');
      }

      const updatedLogs = [...logs];
      updatedLogs[logIndex] = { ...updatedLogs[logIndex], ...updatedData };
      
      setLogs(updatedLogs);
      await AsyncStorage.setItem('logs', JSON.stringify(updatedLogs));
    } catch (err) {
      setError('Failed to update log');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logs]);

  // Delete a log
  const deleteLog = useCallback(async (id: string) => {
    try {
      setLoading(true);

      const updatedLogs = logs.filter(log => log.id !== id);
      setLogs(updatedLogs);
      await AsyncStorage.setItem('logs', JSON.stringify(updatedLogs));
    } catch (err) {
      setError('Failed to delete log');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logs]);

  // Get a log by ID
  const getLogById = useCallback((id: string) => {
    return logs.find(log => log.id === id) || null;
  }, [logs]);

  // Group logs by user
  const logsByUser = useMemo(() => {
    const map = new Map<string, Log[]>();
    logs.forEach(log => {
      const userLogs = map.get(log.userId) || [];
      userLogs.push(log);
      map.set(log.userId, userLogs);
    });
    return map;
  }, [logs]);

  // Get logs by user ID
  const getLogsByUser = useCallback((userId: string) => {
    return logsByUser.get(userId) || [];
  }, [logsByUser]);

  // Refresh logs - in a real app, this would fetch from a remote API
  const refreshLogs = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, we would fetch from an API here
      // For now, just load from storage
      const storedLogs = await AsyncStorage.getItem('logs');

      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
    } catch (err) {
      setError('Failed to refresh logs');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <LogsContext.Provider
      value={{
        logs,
        loading,
        error,
        addLog,
        updateLog,
        deleteLog,
        getLogById,
        getLogsByUser,
        refreshLogs,
      }}
    >
      {children}
    </LogsContext.Provider>
  );
};