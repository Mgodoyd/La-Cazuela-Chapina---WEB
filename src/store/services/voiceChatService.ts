import { toast } from 'react-hot-toast';
import type { VoiceChatMessage, VoiceChatState } from '../types/ia';
class VoiceChatService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  private audioMessages: VoiceChatMessage[] = [];

  private onMessageCallback: ((msg: VoiceChatMessage) => void) | null = null;
  private onStateChangeCallback:
    | ((state: Partial<VoiceChatState>) => void)
    | null = null;

  private currentSource: AudioBufferSourceNode | null = null;

  private readonly API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5266/api/v1'}/voicechat`;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('Error initializing AudioContext:', error);
      }
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      if (!this.audioContext) this.initializeAudioContext();

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.chunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        this.processAudioAndSend();
      };

      this.mediaRecorder.start();
      this.updateState({ isRecording: true, error: null });

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Error al iniciar grabación');
      this.updateState({ error: 'Error al iniciar grabación' });
      return false;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording')
      this.mediaRecorder.stop();

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.updateState({ isRecording: false });
  }

  private async processAudioAndSend() {
    if (this.chunks.length === 0) return;

    try {
      const audioBlob = new Blob(this.chunks, {
        type: 'audio/webm;codecs=opus',
      });
      const arrayBuffer = await audioBlob.arrayBuffer();

      this.addMessage({
        type: 'audio',
        content: arrayBuffer,
        timestamp: Date.now(),
        sender: 'user',
      });

      await this.sendAudioToBackend(arrayBuffer);

      this.chunks = [];
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Error al procesar audio');
      this.updateState({ error: 'Error al procesar audio' });
    }
  }

  private async sendAudioToBackend(audioBuffer: ArrayBuffer) {
    try {
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], {
        type: 'audio/webm;codecs=opus',
      });
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const audioResponse = await response.arrayBuffer();

      if (audioResponse && audioResponse.byteLength > 0) {
        // mensaje de audio del AI
        this.addMessage({
          type: 'audio',
          content: audioResponse,
          timestamp: Date.now(),
          sender: 'ai',
        });

        // Reproducir el audio de respuesta
        this.playAudio(audioResponse);

        toast.success('Respuesta de audio recibida');
      } else {
        throw new Error('No se recibió audio de respuesta');
      }
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      toast.error('Error al enviar audio');
      this.updateState({ error: 'Error al enviar audio' });
    }
  }

  private async playAudio(buffer: ArrayBuffer) {
    try {
      if (!this.audioContext) this.initializeAudioContext();

      if (this.audioContext!.state === 'suspended') {
        await this.audioContext!.resume();
      }

      if (this.currentSource) {
        this.currentSource.stop();
        this.currentSource.disconnect();
        this.currentSource = null;
      }

      const audioBuffer = await this.audioContext!.decodeAudioData(
        buffer.slice(0)
      );
      this.currentSource = this.audioContext!.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.audioContext!.destination);

      this.currentSource.start(0);

      this.currentSource.onended = () => {
        this.updateState({ isPlaying: false });
        this.currentSource = null;
      };

      this.updateState({ isPlaying: true });
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Error al reproducir audio de respuesta');
    }
  }

  public sendTextMessage(text: string) {
    this.addMessage({
      type: 'text',
      content: text,
      timestamp: Date.now(),
      sender: 'user',
    });

    toast('Función de texto no implementada en este modo');
  }

  public getLastAudioMessage(): VoiceChatMessage | null {
    for (let i = this.audioMessages.length - 1; i >= 0; i--) {
      if (this.audioMessages[i].type === 'audio') {
        return this.audioMessages[i];
      }
    }
    return null;
  }

  public getAudioMessages(): VoiceChatMessage[] {
    return this.audioMessages.filter((msg) => msg.type === 'audio');
  }

  public getMessages(): VoiceChatMessage[] {
    return this.audioMessages;
  }

  public clearMessages() {
    this.audioMessages = [];
    this.updateState({ messages: [] });
  }

  private addMessage(msg: VoiceChatMessage) {
    this.audioMessages.push(msg);
    if (this.onMessageCallback) this.onMessageCallback(msg);
    this.updateState({ messages: [...this.audioMessages] });
  }

  public onMessage(callback: (msg: VoiceChatMessage) => void) {
    this.onMessageCallback = callback;
  }

  private updateState(state: Partial<VoiceChatState>) {
    if (this.onStateChangeCallback) this.onStateChangeCallback(state);
  }

  public onStateChange(callback: (state: Partial<VoiceChatState>) => void) {
    this.onStateChangeCallback = callback;
  }

  public disconnect() {
    this.stopRecording();

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.updateState({
      isRecording: false,
      isPlaying: false,
    });

    toast.success('Chat de voz desconectado');
  }
}

export default VoiceChatService;
