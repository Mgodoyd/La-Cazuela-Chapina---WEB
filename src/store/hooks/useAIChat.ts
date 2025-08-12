import { useState, useCallback, useEffect, useRef } from 'react';
import { AIService } from '../services/aiService';
import type { ChatMessage } from '../types/chat';
import VoiceChatService, { type VoiceChatMessage, type VoiceChatState } from '../services/voiceChatService';
import toast from 'react-hot-toast';

export const useAIChat = (token: string | null) => {
  // Generar o recuperar sessionID para el chat
  const [sessionId, setSessionId] = useState<string>(() => {
    const existingSessionId = localStorage.getItem('chatSessionId');
    if (existingSessionId) return existingSessionId;

    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatSessionId', newSessionId);
    return newSessionId;
  });

  // Estado del historial del chat
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
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
      timestamp: new Date()
    }];
  });

  // Estado para mostrar si el bot está "escribiendo"
  const [isTyping, setIsTyping] = useState(false);
  // Mensaje parcial que va llegando por streaming
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');

  // Token local sincronizado con localStorage para evitar inconsistencias
  const [localToken, setLocalToken] = useState<string | null>(() => localStorage.getItem('token'));

  // Estado y referencia para chat de voz
  const [voiceChatState, setVoiceChatState] = useState<VoiceChatState>({
    isConnected: false,
    isRecording: false,
    isPlaying: false,
    isListening: false,
    isSpeaking: false,
    messages: [],
    error: null
  });

  const voiceChatServiceRef = useRef<VoiceChatService | null>(null);

  const getToken = useCallback(() => {
    return token || localToken || localStorage.getItem('token');
  }, [token, localToken]);

  useEffect(() => {
    const syncToken = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken !== localToken) {
        setLocalToken(storedToken);
      }
    };
    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, [localToken]);

  useEffect(() => {
    localStorage.setItem(`chatHistory_${sessionId}`, JSON.stringify(chatHistory));
  }, [chatHistory, sessionId]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const currentToken = getToken();
    if (!currentToken) {
      toast.error('No tienes autorización para usar el chat. Por favor, inicia sesión.');
      return;
    }

    const userMessage: ChatMessage = {
      id: chatHistory.length + 1,
      message: message.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);

    const botMessageId = chatHistory.length + 2;
    const botMessage: ChatMessage = {
      id: botMessageId,
      message: '',
      isBot: true,
      timestamp: new Date()
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
    const defaultMessage: ChatMessage = {
      id: 1,
      message: '¡Hola! Soy tu Cazuela. 🤖\n\nPara usar el chat, necesitas iniciar sesión. Una vez autenticado, podré ayudarte con:\n• Información sobre productos\n• Recomendaciones personalizadas\n• Consultas sobre ingredientes\n• Ayuda con pedidos\n• Y mucho más...',
      isBot: true,
      timestamp: new Date()
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

  // === Chat de voz ===

  // Inicializar instancia VoiceChatService y listeners solo una vez
  const initVoiceChatService = useCallback(() => {
    if (!voiceChatServiceRef.current) {
      voiceChatServiceRef.current = new VoiceChatService();

      voiceChatServiceRef.current.onMessage((message: VoiceChatMessage) => {
        setVoiceChatState(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }));
      });

      voiceChatServiceRef.current.onStateChange((updates: Partial<VoiceChatState>) => {
        setVoiceChatState(prev => ({ ...prev, ...updates }));
      });
    }
  }, []);

  // Iniciar conexión chat voz
  const startVoiceChat = useCallback(async () => {
    try {
      initVoiceChatService();
      const connected = await voiceChatServiceRef.current!.connect();
      if (connected) {
        toast.success('Chat de voz iniciado');
        return true;
      }
      toast.error('No se pudo conectar el chat de voz');
      return false;
    } catch (error) {
      console.error('Error iniciando chat de voz:', error);
      return false;
    }
  }, [initVoiceChatService]);

  // Detener chat de voz y limpiar instancia
  const stopVoiceChat = useCallback(() => {
    if (voiceChatServiceRef.current) {
      voiceChatServiceRef.current.disconnect();
      voiceChatServiceRef.current = null;
    }
    setVoiceChatState({
      isConnected: false,
      isRecording: false,
      isPlaying: false,
      isListening: false,
      isSpeaking: false,
      messages: [],
      error: null
    });
  }, []);

  // Control de grabación voz
  const startRecording = useCallback(async () => {
    if (!voiceChatServiceRef.current) {
      const started = await startVoiceChat();
      if (!started) return false;
    }
    return voiceChatServiceRef.current!.startContinuousListening();
  }, [startVoiceChat]);

  const stopRecording = useCallback(() => {
    voiceChatServiceRef.current?.stopContinuousListening();
  }, []);

  const sendVoiceMessage = useCallback((text: string) => {
    voiceChatServiceRef.current?.sendTextMessage(text);
  }, []);

  
  // Conversación continua
  const startContinuousChat = useCallback(async () => {
    if (!voiceChatServiceRef.current) {
      const started = await startVoiceChat();
      if (!started) return false;
    }
    return voiceChatServiceRef.current!.startContinuousListening();
  }, [startVoiceChat]);

  const stopContinuousChat = useCallback(() => {
    voiceChatServiceRef.current?.stopContinuousListening();
  }, []);

  // Reproducir último audio recibido
  const playLastAudio = useCallback(async () => {
    if (!voiceChatServiceRef.current) return false;
    const lastAudioMessage = voiceChatServiceRef.current.getLastAudioMessage();
    if (lastAudioMessage?.content instanceof ArrayBuffer) {
      await voiceChatServiceRef.current.playReceivedAudio(lastAudioMessage.content);
      return true;
    }
    toast.error('No hay audio recibido para reproducir');
    return false;
  }, []);

  return {
    sessionId,
    chatHistory,
    isTyping,
    currentStreamingMessage,
    sendMessage,
    clearChat,
    closeChatSession,
    voiceChatState,
    startVoiceChat,
    stopVoiceChat,
    startRecording,
    stopRecording,
    sendVoiceMessage,
    startContinuousChat,
    stopContinuousChat,
    playLastAudio
  };
};
