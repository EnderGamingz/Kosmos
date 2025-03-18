import { create } from 'zustand';
import { PresenceNewChatMessage } from '@bindings/PresenceNewChatMessage.ts';

export const SOCIAL_UPDATE_TIMEOUT = 5000;

export type SocialUpdateState = {
  chatMessage?: PresenceNewChatMessage;
  setChatMessage: (message: PresenceNewChatMessage) => void;
  clearChatMessage: () => void;
};

export const useSocialUpdate = create<SocialUpdateState>(set => ({
  chatMessage: undefined,
  setChatMessage: message => set({ chatMessage: message }),
  clearChatMessage: () => set({ chatMessage: undefined }),
}));
