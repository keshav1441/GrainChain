import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useNotificationStore, Notification } from '../stores/notificationStore';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByType,
    getUnreadNotifications,
  } = useNotificationStore();

  const [selectedFilter, setSelectedFilter] = useState<'all' | Notification['type'] | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'inquiry':
        return <EyeIcon className="h-6 w-6 text-blue-500" />;
      case 'price_alert':
        return <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />;
      case 'payment':
        return <CurrencyRupeeIcon className="h-6 w-6 text-green-500" />;
      case 'system':
        return <CogIcon className="h-6 w-6 text-gray-500" />;
      case 'message':
        return <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-500" />;
      case 'order':
        return <ShoppingCartIcon className="h-6 w-6 text-emerald-500" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  // const getPriorityColor = (priority: Notification['priority']) => {
  //   switch (priority) {
  //     case 'urgent':
  //       return 'border-l-red-500 bg-red-50';
  //     case 'high':
  //       return 'border-l-orange-500 bg-orange-50';
  //     case 'medium':
  //       return 'border-l-blue-500 bg-blue-50';
  //     case 'low':
  //       return 'border-l-gray-500 bg-gray-50';
  //     default:
  //       return 'border-l-gray-500 bg-gray-50';
  //   }
  // };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Apply type/status filter
    if (selectedFilter === 'unread') {
      filtered = getUnreadNotifications();
    } else if (selectedFilter !== 'all') {
      filtered = getNotificationsByType(selectedFilter as Notification['type']);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const filteredNotifications = getFilteredNotifications();

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id));
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]);
  };

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'inquiry', label: 'Inquiries', count: getNotificationsByType('inquiry').length },
    { value: 'price_alert', label: 'Price Alerts', count: getNotificationsByType('price_alert').length },
    { value: 'payment', label: 'Payments', count: getNotificationsByType('payment').length },
    { value: 'message', label: 'Messages', count: getNotificationsByType('message').length },
    { value: 'order', label: 'Orders', count: getNotificationsByType('order').length },
    { value: 'system', label: 'System', count: getNotificationsByType('system').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BellIcon className="h-8 w-8 mr-3 text-emerald-600" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">
                Stay updated with your agricultural activities and opportunities
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Mark All Read ({unreadCount})
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center mb-6">
                <FunnelIcon className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Filter Options */}
              <div className="space-y-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedFilter === option.value
                        ? 'bg-emerald-100 text-emerald-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option.label}</span>
                      <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                        {option.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-lg">
              {/* Bulk Actions */}
              {selectedNotifications.length > 0 && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedNotifications.length} selected
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleBulkMarkAsRead}
                        className="flex items-center px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Mark Read
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                      <button
                        onClick={() => setSelectedNotifications([])}
                        className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Header with Select All */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {filteredNotifications.length} notifications
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing {selectedFilter === 'all' ? 'all' : selectedFilter} notifications
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              )}

              {/* Notifications */}
              {!isLoading && (
                <div className="divide-y divide-gray-200">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-6 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          />
                          
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                {notification.title}
                                {!notification.read && (
                                  <span className="ml-2 h-2 w-2 bg-emerald-500 rounded-full"></span>
                                )}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                  notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                  notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {notification.priority}
                                </span>
                                <span className="text-sm text-gray-500 flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mt-2">{notification.message}</p>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center space-x-4">
                                {notification.actionUrl && notification.actionText && (
                                  <Link
                                    to={notification.actionUrl}
                                    onClick={() => {
                                      if (!notification.read) {
                                        markAsRead(notification.id);
                                      }
                                    }}
                                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                                  >
                                    {notification.actionText}
                                  </Link>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-2 text-gray-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50"
                                    title="Mark as read"
                                  >
                                    <CheckIcon className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                  title="Delete notification"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
