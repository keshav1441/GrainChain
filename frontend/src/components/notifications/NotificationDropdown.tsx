import React, { useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CurrencyRupeeIcon,
  ChatBubbleLeftRightIcon,
  ShoppingCartIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { useNotificationStore, Notification } from '../../stores/notificationStore';

const NotificationDropdown: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'inquiry':
        return <EyeIcon className="h-5 w-5 text-blue-500" />;
      case 'price_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'payment':
        return <CurrencyRupeeIcon className="h-5 w-5 text-green-500" />;
      case 'system':
        return <CogIcon className="h-5 w-5 text-gray-500" />;
      case 'message':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500" />;
      case 'order':
        return <ShoppingCartIcon className="h-5 w-5 text-emerald-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg">
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-96 origin-top-right bg-white rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  to="/notifications"
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
              </div>
            )}

            {/* Notifications List */}
            {!isLoading && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  recentNotifications.map((notification) => (
                    <Menu.Item key={notification.id}>
                      {({ active }) => (
                        <div
                          className={`relative rounded-lg border-l-4 p-3 transition-colors ${
                            getPriorityColor(notification.priority)
                          } ${
                            !notification.read ? 'ring-2 ring-emerald-200' : ''
                          } ${
                            active ? 'bg-gray-100' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <div className="flex items-center space-x-1">
                                  {!notification.read && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                      className="p-1 text-gray-400 hover:text-emerald-500"
                                      title="Mark as read"
                                    >
                                      <CheckIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                    title="Delete notification"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center text-xs text-gray-500">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {formatTimestamp(notification.timestamp)}
                                </div>
                                
                                {notification.actionUrl && notification.actionText && (
                                  <Link
                                    to={notification.actionUrl}
                                    onClick={() => {
                                      if (!notification.read) {
                                        markAsRead(notification.id);
                                      }
                                    }}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                  >
                                    {notification.actionText}
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {!notification.read && (
                            <div className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full"></div>
                          )}
                        </div>
                      )}
                    </Menu.Item>
                  ))
                )}
              </div>
            )}

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/notifications"
                  className="block w-full text-center py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  View All Notifications ({notifications.length})
                </Link>
              </div>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationDropdown;
