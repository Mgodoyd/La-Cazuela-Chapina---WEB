import { useState, useCallback, useEffect, useRef } from 'react';
import { AIService } from '../services/aiService';
import type { ChatMessage } from '../types/chat';
import VoiceChatService from '../services/voiceChatService';
import type { VoiceChatMessage, VoiceChatState } from '../types/ia';
import toast from 'react-hot-toast';

export interface ChatMessageExtended extends ChatMessage {
  type?: 'text' | 'audio';
  content?: ArrayBuffer;
}

export const useAIChat = (token: string | null) => {
  const [sessionId, setSessionId] = useState<string>(() => {
    const existingSessionId = localStorage.getItem('chatSessionId');
    if (existingSessionId) return existingSessionId;
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatSessionId', newSessionId);
    return newSessionId;
  });

  // chatHistory unificado para texto y audio
  const [chatHistory, setChatHistory] = useState<ChatMessageExtended[]>(() => {
    const savedHistory = localStorage.getItem(`chatHistory_${sessionId}`);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch {
        console.warn('Error parsing saved chat history');
      }
    }
    return [{
      id: 1,
      message: '¡Hola! Soy tu Cazuela. 🤖\n\nPara usar el chat, necesitas iniciar sesión. Una vez autenticado, podré ayudarte con:\n• Información sobre productos\n• Recomendaciones personalizadas\n• Consultas sobre ingredientes\n• Ayuda con pedidos\n• Y mucho más...',
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    }];
  });

  const [isTyping, setIsTyping] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [localToken, setLocalToken] = useState<string | null>(() => localStorage.getItem('token'));
  
  // Estados del chat de voz
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const voiceChatServiceRef = useRef<VoiceChatService | null>(null);

  const getToken = useCallback(() => token || localToken || localStorage.getItem('token'), [token, localToken]);

  useEffect(() => {
    const syncToken = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken !== localToken) setLocalToken(storedToken);
    };
    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, [localToken]);

  useEffect(() => {
    localStorage.setItem(`chatHistory_${sessionId}`, JSON.stringify(chatHistory));
  }, [chatHistory, sessionId]);

  // === Mensajes de texto ===
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const currentToken = getToken();
    if (!currentToken) {
      toast.error('No tienes autorización para usar el chat. Por favor, inicia sesión.');
      return;
    }

    const userMessage: ChatMessageExtended = {
      id: chatHistory.length + 1,
      message: message.trim(),
      isBot: false,
      timestamp: new Date(),
      type: 'text'
    };

    setChatHistory(prev => [...prev, userMessage]);

    const botMessageId = chatHistory.length + 2;
    const botMessage: ChatMessageExtended = {
      id: botMessageId,
      message: '',
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    };
    setChatHistory(prev => [...prev, botMessage]);

    setIsTyping(true);
    setCurrentStreamingMessage('');

    try {
      await AIService.sendMessage(
        message.trim(),
        currentToken,
        (chunk: string) => {
          setCurrentStreamingMessage(prev => prev + chunk);
          setChatHistory(prev => prev.map(msg =>
            msg.id === botMessageId ? { ...msg, message: (msg.message || '') + chunk } : msg
          ));
        },
        (fullResponse: string) => {
          setIsTyping(false);
          setCurrentStreamingMessage('');
          setChatHistory(prev => prev.map(msg =>
            msg.id === botMessageId ? { ...msg, message: fullResponse } : msg
          ));
        },
        (error: string) => {
          setIsTyping(false);
          setCurrentStreamingMessage('');
          setChatHistory(prev => prev.map(msg =>
            msg.id === botMessageId
              ? { ...msg, message: 'Lo siento, tuve un problema para procesar tu mensaje. Por favor, intenta de nuevo.' }
              : msg
          ));
          toast.error('Error en el chat: ' + error);
        }
      );
    } catch (error) {
      setIsTyping(false);
      setCurrentStreamingMessage('');
      setChatHistory(prev => prev.map(msg =>
        msg.id === botMessageId
          ? { ...msg, message: 'Lo siento, no pude conectarme con el servicio. Por favor, intenta más tarde.' }
          : msg
      ));
      toast.error('Error de conexión con la IA');
    }
  }, [chatHistory.length, getToken]);

  const clearChat = useCallback(() => {
    const defaultMessage: ChatMessageExtended = {
      id: 1,
      message: '¡Hola! Soy tu Cazuela. 🤖\n\nPara usar el chat, necesitas iniciar sesión. Una vez autenticado, podré ayudarte con:\n• Información sobre productos\n• Recomendaciones personalizadas\n• Consultas sobre ingredientes\n• Ayuda con pedidos\n• Y mucho más...',
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    };
    setChatHistory([defaultMessage]);
    setIsTyping(false);
    setCurrentStreamingMessage('');
    localStorage.removeItem(`chatHistory_${sessionId}`);
  }, [sessionId]);

  const closeChatSession = useCallback(() => {
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatSessionId', newSessionId);
    localStorage.removeItem(`chatHistory_${sessionId}`);

    setSessionId(newSessionId);
    clearChat();

    stopVoiceChat();
  }, [clearChat, sessionId]);

  // === Chat de voz integrado ===
  const initVoiceChatService = useCallback(() => {
    if (!voiceChatServiceRef.current) {
      voiceChatServiceRef.current = new VoiceChatService();

      // Cuando llega mensaje de audio del AI o usuario, se agrega al chatHistory
      voiceChatServiceRef.current.onMessage((message: VoiceChatMessage) => {
        const newMessage: ChatMessageExtended = {
          id: chatHistory.length + 1,
          isBot: message.sender === 'ai',
          timestamp: new Date(message.timestamp),
          type: message.type === 'system' ? 'text' : message.type,
          content: message.type === 'audio' ? message.content as ArrayBuffer : undefined,
          message: message.type === 'text' ? message.content as string : (message.type === 'system' ? message.content as string : '')
        };

        setChatHistory(prev => [...prev, newMessage]);
      });

      // Sincronización estado de grabación/reproducción
      voiceChatServiceRef.current.onStateChange((updates: Partial<VoiceChatState>) => {
        if (updates.isRecording !== undefined) {
          setIsRecording(updates.isRecording);
        }
        if (updates.isPlaying !== undefined) {
          setIsPlaying(updates.isPlaying);
        }
      });
    }
  }, [chatHistory.length]);

  const startRecording = useCallback(async () => {
    try {
      const currentToken = getToken();
      if (!currentToken) {
        toast.error('No tienes autorización para usar el chat. Por favor, inicia sesión.');
        return false;
      }

      initVoiceChatService();
      
      if (voiceChatServiceRef.current) {
        const success = await voiceChatServiceRef.current.startRecording();
        if (success) {
          toast.success('Grabando audio...');
          return true;
        } else {
          toast.error('No se pudo iniciar la grabación');
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error iniciando grabación:', error);
      toast.error('Error al iniciar grabación');
      return false;
    }
  }, [initVoiceChatService, getToken]);

  const stopRecording = useCallback(() => {
    if (voiceChatServiceRef.current) {
      voiceChatServiceRef.current.stopRecording();
      toast.success('Audio enviado, procesando...');
    }
  }, []);

  const stopVoiceChat = useCallback(() => {
    if (voiceChatServiceRef.current) {
      voiceChatServiceRef.current.disconnect();
      voiceChatServiceRef.current = null;
    }
    setIsRecording(false);
    setIsPlaying(false);
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopVoiceChat();
    };
  }, [stopVoiceChat]);

  return {
    sessionId,
    chatHistory,
    isTyping,
    currentStreamingMessage,
    sendMessage,
    clearChat,
    closeChatSession,
    startRecording,
    stopRecording,
    stopVoiceChat,
    isRecording,
    isPlaying
  };
};
