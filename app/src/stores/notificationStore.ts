import { create } from 'zustand';

export enum Severity {
  INFO,
  SUCCESS,
  ERROR,
  WARN,
}

export type CreateNotificationPayload = {
  id: string;
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
  popup: boolean;
};

export type NotificationState = {
  notifications: Notification[];
  actions: {
    clearNotifications: () => void;
    notify: (data: CreateNotificationPayload) => void;
    updateNotification: (id: string, data: UpdateNotificationPayload) => void;
    removeNotification: (id: string) => void;
  };
};

export const useNotifications = create<NotificationState>(set => ({
  notifications: [],
  actions: {
    notify: (data: CreateNotificationPayload) => {
      set(state => ({
        notifications: [
          {
            ...data,
            popup: true,
          },
          ...state.notifications,
        ],
      }));
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
