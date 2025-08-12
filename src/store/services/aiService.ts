import { ApiService } from "../api/apiService";

export class AIService {
  
  // Método para stream de respuestas
  private static async streamResponse(
    message: string,
    token: string
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      return await ApiService.stream("/ai/stream", { message });
    } catch (error) {
      console.error("Error connecting to AI stream:", error);
      throw error;
    }
  }

  // Método para enviar mensajes
  public static async sendMessage(
    message: string,
    token: string,
    onChunk: (chunk: string) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const stream = await this.streamResponse(message, token);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("Stream terminado (done = true)");
          break;
        }

        try {
          // Decodificar el chunk
          const chunk = decoder.decode(value);

          // Dividir por líneas y procesar cada una
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {

            // Si la línea comienza con 'data: ', es formato Server-Sent Events
            if (line.startsWith("data: ")) {
              const jsonData = line.slice(6); // Remover 'dat

              if (jsonData === "[DONE]") {
                onComplete(fullResponse);
                return;
              }

              // Intentar parsear como JSON primero
              try {
                const parsed = JSON.parse(jsonData);
                if (parsed.content) {
                  fullResponse += parsed.content;
                  onChunk(parsed.content);
                }
              } catch (parseError) {
                // Si no es JSON válido, tratar como texto directo
                fullResponse += jsonData;
                onChunk(jsonData);
              }
            }
            // Si la línea NO comienza con 'data: ', es texto directo
            else if (line.trim()) {
              fullResponse += line;
              onChunk(line);
            }
          }
        } catch (chunkError) {
          console.warn("Error processing chunk:", chunkError);
        }
      }

      onComplete(fullResponse);
    } catch (error) {
      console.error("Error in AI stream:", error);
      onError(
        error instanceof Error ? error.message : "Error desconocido en la IA"
      );
    }
  }

  // Método alternativo para respuestas simples (no streaming)
  public static async sendSimpleMessage(message: string): Promise<string> {
    try {
      const response = await ApiService.post("/ai/chat", { message });
      return (
        response.response ||
        response.message ||
        "No se pudo obtener respuesta de la IA"
      );
    } catch (error) {
      console.error("Error sending simple message:", error);
      throw error;
    }
  }
}
