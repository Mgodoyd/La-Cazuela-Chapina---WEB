import { useState } from "react";

interface Message { role: "user" | "assistant"; content: string }

export default function AsistentePage() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("openrouter_key") ?? "");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!apiKey || !input) return;
    const newMessages = [...messages, { role: "user", content: input } as Message];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.openrouter.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: newMessages,
        }),
      });
      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content ?? "(sin respuesta)";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${e?.message ?? e}` }]);
    } finally {
      setLoading(false);
    }
  };

  const saveKey = () => {
    localStorage.setItem("openrouter_key", apiKey);
  };

  return (
    <div className="p-4 grid grid-cols-1 gap-4">
      <div className="flex gap-2">
        <input className="border rounded px-2 py-1 w-full" placeholder="OpenRouter API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        <button className="bg-gray-200 px-3 rounded" onClick={saveKey}>Guardar</button>
      </div>
      <div className="border rounded p-3 h-80 overflow-auto space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className={m.role === "user" ? "bg-blue-100 inline-block p-2 rounded" : "bg-gray-100 inline-block p-2 rounded"}>
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="border rounded px-2 py-1 w-full" placeholder="Escribe tu mensaje" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" disabled={loading} onClick={send}>{loading ? "Enviando..." : "Enviar"}</button>
      </div>
    </div>
  );
} 