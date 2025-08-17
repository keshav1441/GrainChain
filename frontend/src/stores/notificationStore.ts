import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { notificationApi } from '../services/api';

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

      markAsRead: async (id) => {
        try {
          // Update local state immediately for better UX
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
          
          // Then call the API
          await notificationApi.markAsRead(parseInt(id));
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
          // Revert the local state change if API call fails
          set((state) => {
            const revertedNotifications = state.notifications.map(notification =>
              notification.id === id ? { ...notification, read: false } : notification
            );
            const unreadCount = revertedNotifications.filter(n => !n.read).length;
            
            return {
              notifications: revertedNotifications,
              unreadCount,
            };
          });
        }
      },

      markAllAsRead: async () => {
        try {
          // Update local state immediately
          set((state) => ({
            notifications: state.notifications.map(notification => ({
              ...notification,
              read: true,
            })),
            unreadCount: 0,
          }));
          
          // Then call the API
          await notificationApi.markAllAsRead();
        } catch (error) {
          console.error('Failed to mark all notifications as read:', error);
          // Optionally revert or refresh from server
        }
      },

      deleteNotification: async (id) => {
        try {
          // Update local state immediately
          set((state) => {
            const updatedNotifications = state.notifications.filter(n => n.id !== id);
            const unreadCount = updatedNotifications.filter(n => !n.read).length;
            
            return {
              notifications: updatedNotifications,
              unreadCount,
            };
          });
          
          // Then call the API
          await notificationApi.deleteNotification(parseInt(id));
        } catch (error) {
          console.error('Failed to delete notification:', error);
          // Optionally revert the deletion or refresh from server
        }
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
          const response = await notificationApi.getNotifications();
          const notifications = response.data.map((notification: any) => ({
            ...notification,
            timestamp: new Date(notification.timestamp || notification.created_at),
          }));

          set({
            notifications,
            unreadCount: notifications.filter((n: any) => !n.read).length,
            isLoading: false,
          });
        } catch (error) {
          // If API call fails, show empty state instead of mock data
          console.warn('Failed to fetch notifications:', error);
          set({
            notifications: [],
            unreadCount: 0,
            isLoading: false,
            error: 'Unable to load notifications. Please try again later.',
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
