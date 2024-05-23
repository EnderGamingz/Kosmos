import { create } from 'zustand';

export enum Severity {
  INFO,
  SUCCESS,
  ERROR,
  WARN,
}

export type CreateNotificationPayload = {
  title: string;
  description?: string;
  status?: string;
  severity: Severity;
  loading?: boolean;
  timeout?: number;
};

export type UpdateNotificationPayload = {
  title?: string;
  description?: string;
  severity?: Severity;
  popup?: boolean;
  status?: string;
  loading?: boolean;
  timeout?: number;
};

export type Notification = CreateNotificationPayload & {
  id: string;
  popup: boolean;
};

export type NotificationState = {
  notifications: Notification[];
  actions: {
    clearNotifications: () => void;
    notify: (data: CreateNotificationPayload) => string;
    updateNotification: (id: string, data: UpdateNotificationPayload) => void;
    removeNotification: (id: string) => void;
  };
};

export const useNotifications = create<NotificationState>(set => ({
  notifications: [],
  actions: {
    notify: (data: CreateNotificationPayload) => {
      const id = new Date().toISOString();
      set(state => ({
        notifications: [
          {
            ...data,
            popup: true,
            id,
          },
          ...state.notifications,
        ],
      }));
      return id;
    },
    removeNotification: id => {
      set(state => ({
        notifications: state.notifications.filter(x => x.id !== id),
      }));
    },
    clearNotifications: () => set(() => ({ notifications: [] })),
    updateNotification: (id: string, data: UpdateNotificationPayload) => {
      set(state => ({
        notifications: state.notifications.map(notification => {
          if (notification.id === id) {
            return {
              ...notification,
              ...data,
            };
          }
          return notification;
        }),
      }));
    },
  },
}));
