import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'inquiry' | 'price_alert' | 'payment' | 'system' | 'message' | 'order';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    cropId?: string;
    inquiryId?: string;
    orderId?: string;
    userId?: string;
    amount?: number;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  fetchNotifications: () => Promise<void>;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getUnreadNotifications: () => Notification[];
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set, get) => ({
      // State
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      // Actions
      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        set((state) => {
          const newNotifications = [notification, ...state.notifications];
          const unreadCount = newNotifications.filter(n => !n.read).length;
          
          return {
            notifications: newNotifications,
            unreadCount,
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          );
          const unreadCount = updatedNotifications.filter(n => !n.read).length;
          
          return {
            notifications: updatedNotifications,
            unreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            read: true,
          })),
          unreadCount: 0,
        }));
      },

      deleteNotification: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(n => n.id !== id);
          const unreadCount = updatedNotifications.filter(n => !n.read).length;
          
          return {
            notifications: updatedNotifications,
            unreadCount,
          };
        });
      },

      clearAllNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Replace with actual API call
          // const response = await api.get('/notifications');
          // const notifications = response.data;
          
          // Mock data for now
          const mockNotifications: Notification[] = [
            {
              id: '1',
              type: 'inquiry',
              title: 'New Inquiry Received',
              message: 'Rajesh Kumar is interested in your Basmati Rice listing',
              timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
              read: false,
              priority: 'high',
              actionUrl: '/farmer/dashboard?tab=inquiries',
              actionText: 'View Inquiry',
              metadata: {
                cropId: 'crop_123',
                inquiryId: 'inq_456',
                userId: 'user_789',
              },
            },
            {
              id: '2',
              type: 'price_alert',
              title: 'Price Alert',
              message: 'Wheat prices have increased by 8% in your region',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
              read: false,
              priority: 'medium',
              actionUrl: '/marketplace?category=grains',
              actionText: 'View Market',
            },
            {
              id: '3',
              type: 'payment',
              title: 'Payment Received',
              message: 'Payment of ₹25,000 received for Order #ORD-001',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
              read: true,
              priority: 'high',
              actionUrl: '/farmer/dashboard?tab=transactions',
              actionText: 'View Transaction',
              metadata: {
                orderId: 'ORD-001',
                amount: 25000,
              },
            },
            {
              id: '4',
              type: 'system',
              title: 'Profile Verification Complete',
              message: 'Your farmer profile has been successfully verified',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
              read: true,
              priority: 'medium',
              actionUrl: '/profile',
              actionText: 'View Profile',
            },
            {
              id: '5',
              type: 'message',
              title: 'New Message',
              message: 'Priya Sharma sent you a message about tomato quality',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
              read: false,
              priority: 'medium',
              actionUrl: '/farmer/dashboard?tab=messages',
              actionText: 'Read Message',
              metadata: {
                userId: 'user_456',
              },
            },
          ];

          set({
            notifications: mockNotifications,
            unreadCount: mockNotifications.filter(n => !n.read).length,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch notifications',
            isLoading: false,
          });
        }
      },

      getNotificationsByType: (type) => {
        return get().notifications.filter(notification => notification.type === type);
      },

      getUnreadNotifications: () => {
        return get().notifications.filter(notification => !notification.read);
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
