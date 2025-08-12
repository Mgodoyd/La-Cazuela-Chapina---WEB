import { toast } from 'react-hot-toast';

export interface VoiceChatMessage {
  type: 'audio' | 'text' | 'system';
  content: string | ArrayBuffer;
  timestamp: number;
  sender: 'user' | 'ai';
}

export interface VoiceChatState {
  isConnected: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  messages: VoiceChatMessage[];
  error: string | null;
}

class VoiceChatService {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private silenceTimer: number | null = null;

  private isListeningMode = false;
  private isSpeakingMode = false;

  private readonly SILENCE_DURATION = 2000;
  private readonly VOLUME_THRESHOLD = 15;

  private audioMessages: VoiceChatMessage[] = [];

  private onMessageCallback: ((msg: VoiceChatMessage) => void) | null = null;
  private onStateChangeCallback: ((state: Partial<VoiceChatState>) => void) | null = null;

  private readonly WS_URL = 'ws://albmdwapi-1889324219.us-east-1.elb.amazonaws.com/api/v1/ws/voicechat';
  private readonly RECONNECT_ATTEMPTS = 3;
  private reconnectAttempts = 0;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('Error initializing AudioContext:', error);
      }
    }
  }

  async connect(): Promise<boolean> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return true;

    this.ws = new WebSocket(this.WS_URL);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.updateState({ error: 'WebSocket connection timeout' });
        reject(new Error('Timeout'));
      }, 10000);

      this.ws!.onopen = () => {
        clearTimeout(timeout);
        this.reconnectAttempts = 0;
        this.updateState({ isConnected: true, error: null });
        toast.success('Voice chat connected');
        resolve(true);
      };

      this.ws!.onmessage = (e) => this.handleWebSocketMessage(e);
      this.ws!.onclose = (e) => {
        clearTimeout(timeout);
        this.updateState({ isConnected: false });

        if (e.code !== 1000 && this.reconnectAttempts < this.RECONNECT_ATTEMPTS) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
        } else if (e.code === 1006) {
          this.updateState({ error: 'Connection error - check server' });
          toast.error('Voice server connection error');
          reject(new Error('Connection error'));
        }
      };

      this.ws!.onerror = (_error) => {
        clearTimeout(timeout);
        this.updateState({ error: 'WebSocket error' });
        toast.error('Voice chat error');
        reject(new Error('WebSocket error'));
      };
    });
  }

  disconnect() {
    this.stopContinuousListening();

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.updateState({
      isConnected: false,
      isRecording: false,
      isPlaying: false,
      isListening: false,
      isSpeaking: false,
    });

    toast.success('Voice chat disconnected');
  }

  async startContinuousListening(): Promise<boolean> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to voice chat');
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      if (!this.audioContext) this.initializeAudioContext();

      if (this.audioContext) {
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.chunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        this.processAudioChunk();
      };

      this.isListeningMode = true;
      this.updateState({ isListening: true });

      this.startVoiceDetection();
      toast.success('Continuous conversation mode activated - speak anytime!');

      return true;
    } catch (error) {
      console.error('Error starting continuous listening:', error);
      toast.error('Error starting continuous listening');
      return false;
    }
  }

  stopContinuousListening() {
    this.isListeningMode = false;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.updateState({ isListening: false, isRecording: false });
    toast.success('Continuous conversation mode deactivated');
  }

  private startVoiceDetection() {
    if (!this.analyser || !this.dataArray || !this.isListeningMode) return;

    const detectVoice = () => {
      if (!this.isListeningMode || !this.analyser || !this.dataArray) return;

      // this.analyser.getByteFrequencyData(this.dataArray);

      // Average volume in voice freq range (~300Hz to 3kHz)
      let sum = 0;
      const start = Math.floor(this.dataArray.length * 0.1);
      const end = Math.floor(this.dataArray.length * 0.5);
      for (let i = start; i < end; i++) {
        sum += this.dataArray[i];
      }
      const average = sum / (end - start);
      const voiceDetected = average > this.VOLUME_THRESHOLD;

      if (voiceDetected && !this.isSpeakingMode) {
        if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
          this.mediaRecorder.start();
          this.updateState({ isRecording: true });
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        }
      } else if (!voiceDetected && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        if (!this.silenceTimer) {
          this.silenceTimer = window.setTimeout(() => {
            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
              this.mediaRecorder.stop();
              this.updateState({ isRecording: false });
            }
            this.silenceTimer = null;
          }, this.SILENCE_DURATION);
        }
      }

      if (this.isListeningMode) requestAnimationFrame(detectVoice);
    };

    detectVoice();
  }

  private async processAudioChunk() {
    if (this.chunks.length === 0) return;

    try {
      const audioBlob = new Blob(this.chunks, { type: 'audio/webm;codecs=opus' });
      const arrayBuffer = await audioBlob.arrayBuffer();

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(arrayBuffer);

        this.addMessage({
          type: 'audio',
          content: arrayBuffer,
          timestamp: Date.now(),
          sender: 'user',
        });
      }

      this.chunks = [];
    } catch (error) {
      console.error('Error processing audio chunk:', error);
    }
  }

  private handleWebSocketMessage(event: MessageEvent) {
    try {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'text') {
            this.addMessage({
              type: 'text',
              content: data.content,
              timestamp: Date.now(),
              sender: 'ai',
            });
            this.updateState({ isSpeaking: false });
            this.startContinuousListening(); // Re-enable mic listening after AI finishes
          }
        } catch {
          console.log('Non-JSON text message:', event.data);
        }
      } else if (event.data instanceof ArrayBuffer) {
        this.playAudio(event.data);
        this.addMessage({
          type: 'audio',
          content: event.data,
          timestamp: Date.now(),
          sender: 'ai',
        });
        this.updateState({ isSpeaking: true });
        this.stopContinuousListening(); // Pause mic while AI is speaking
      }
    } catch (error) {
      console.error('Error handling WS message:', error);
    }
  }

  private async playAudio(buffer: ArrayBuffer) {
    try {
      if (!this.audioContext) this.initializeAudioContext();

      if (this.audioContext!.state === 'suspended') {
        await this.audioContext!.resume();
      }

      const audioBuffer = await this.audioContext!.decodeAudioData(buffer.slice(0));
      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext!.destination);

      source.start(0);

      source.onended = () => {
        this.updateState({ isPlaying: false, isSpeaking: false });
        this.startContinuousListening(); // Reactivate mic after playback
      };

      this.updateState({ isPlaying: true });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  private addMessage(msg: VoiceChatMessage) {
    this.audioMessages.push(msg);
    if (this.onMessageCallback) this.onMessageCallback(msg);
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

  public sendTextMessage(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: 'text', content: text });
      this.ws.send(message);
      
      this.addMessage({
        type: 'text',
        content: text,
        timestamp: Date.now(),
        sender: 'user',
      });
    } else {
      toast.error('WebSocket no está conectado');
    }
  }

  public getLastAudioMessage(): VoiceChatMessage | null {
    // Busca el último mensaje de tipo 'audio' en audioMessages
    for (let i = this.audioMessages.length - 1; i >= 0; i--) {
      if (this.audioMessages[i].type === 'audio') {
        return this.audioMessages[i];
      }
    }
    return null; // No encontró mensajes de audio
  }

  public getAudioMessages(): VoiceChatMessage[] {
    return this.audioMessages.filter(msg => msg.type === 'audio');
  }

  public playReceivedAudio(audioBuffer: ArrayBuffer) {
    this.playAudio(audioBuffer);
  }
  
}

export default VoiceChatService;
