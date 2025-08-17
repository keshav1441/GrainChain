import api from './api';

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
  error: boolean;
}

export interface ChatSuggestions {
  suggestions: string[];
  user_role: string;
}

class ChatbotService {
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await api.post('/chatbot/chat', { message });
      return response.data;
    } catch (error) {
      console.error('Failed to send message to chatbot:', error);
      throw error;
    }
  }

  async getSuggestions(): Promise<ChatSuggestions> {
    try {
      const response = await api.get('/chatbot/suggestions');
      return response.data;
    } catch (error) {
      console.error('Failed to get chat suggestions:', error);
      throw error;
    }
  }
}

export const chatbotService = new ChatbotService();
