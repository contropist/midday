import type { CoreMessage } from "ai";
import type { ReactNode } from "react";

export type Message = CoreMessage & {
  id: string;
};

export interface Chat extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  messages: Message[];
}

export type SettingsResponse = {
  provider: "openai" | "mistralai";
  enabled: boolean;
};

export type User = {
  id: string;
  full_name: string;
  avatar_url: string;
};

export type AIState = {
  chatId: string;
  user: User;
  messages: Message[];
};

export type UIState = {
  id: string;
  display: React.ReactNode;
}[];

export interface ServerMessage {
  role: "user" | "assistant" | "tool";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

export type MutableAIState = {
  get: () => AIState;
  update: (newState: ValueOrUpdater<AIState>) => void;
  done: ((newState: AIState) => void) | (() => void);
};
