import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, MessageSquare, Sparkles, Bug, Pill, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

const QUICK_ACTIONS = [
  { label: "Identify Tomato Blight", icon: Bug },
  { label: "Suggest pesticide for aphids", icon: Pill },
  { label: "Fungal remedies", icon: ShieldCheck },
];

const SYSTEM_INSTRUCTIONS = `You are an expert AI agronomist assisting a farmer directly in the field via a mobile chat. The farmer may describe crop symptoms, pests, or diseases, or ask for treatment advice.

You will receive HIDDEN LIVE SENSOR CONTEXT (soil moisture, temperature, humidity) and the selected crop. Use it to inform your diagnosis and recommendations, but do not simply repeat the raw numbers.

ALWAYS structure every response using these three sections, with bold markdown headers and short, scannable bullet points optimized for mobile field viewing:

**🩺 Suspected Diagnosis**
- The most likely disease or pest given the described symptoms AND the live conditions.
- Key confirmatory signs the farmer should look for to confirm.

**💊 Pesticide Recommendation**
- Organic option(s): name, how to prepare/apply, dosage and timing.
- Chemical option(s): product/active ingredient, safe dosage, application timing, and safety precautions (PPE, pre-harvest interval/PHI).

**🛡️ Preventive Cultural Practices**
- 2–3 practical farm-level actions to prevent recurrence (crop rotation, spacing, watering timing, sanitation, resistant varieties, etc.).

Be concise, specific, and practical. If information is insufficient, ask ONE clarifying question at the very end. Always label any chemical with its pre-harvest interval and prioritize farmer/consumer safety.`;

function buildContext(sensorData, cropProfile) {
  const fmt = (v, unit) => (v != null ? `${v}${unit}` : "no live data");
  return `HIDDEN LIVE CONTEXT (use to inform your diagnosis):
- Crop: ${cropProfile?.name ?? "unknown"}
- Live Soil Moisture: ${fmt(sensorData?.moisture, "%")}
- Live Temperature: ${fmt(sensorData?.temperature, "°C")}
- Live Humidity: ${fmt(sensorData?.humidity, "%")}
- Ideal moisture: ${cropProfile?.moisture?.ideal_low ?? "—"}–${cropProfile?.moisture?.ideal_high ?? "—"}%
- Ideal temperature: ${cropProfile?.temp?.ideal_low ?? "—"}–${cropProfile?.temp?.ideal_high ?? "—"}°C
- Ideal humidity: ${cropProfile?.humidity?.ideal_low ?? "—"}–${cropProfile?.humidity?.ideal_high ?? "—"}%`;
}

const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="ml-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
};

export default function AgronomistChat({ sensorData, cropProfile }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm your **AI Agronomist** 🌱 powered by Gemini. Describe any crop symptoms, pests, or disease — I'll use your zone's **live sensor readings** to give a tailored diagnosis and treatment plan.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = nextMessages
        .map((m) => (m.role === "user" ? `Farmer: ${m.content}` : `Agronomist: ${m.content}`))
        .join("\n");

      const prompt = `${SYSTEM_INSTRUCTIONS}\n\n${buildContext(sensorData, cropProfile)}\n\nConversation so far:\n${history}\n\nAgronomist:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "gemini_3_flash",
        add_context_from_internet: true,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: typeof response === "string" ? response : "Sorry, I couldn't process that. Could you rephrase?",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ I couldn't reach the AI engine just now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-card/70 border border-border/50 rounded-2xl p-4 md:p-6 flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
        <div>
          <span className="text-sm font-medium text-foreground">Ask the AI Agronomist</span>
          <p className="text-[10px] text-muted-foreground">Live-context chat · Gemini</p>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary text-[10px] gap-1 ml-auto">
          <Sparkles className="h-2.5 w-2.5" />
          {cropProfile?.name ?? "Crop"}
        </Badge>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-foreground border border-border/40"
              }`}
            >
              {m.role === "user" ? (
                m.content
              ) : (
                <ReactMarkdown components={markdownComponents}>{m.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary/60 border border-border/40 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mt-3">
        {QUICK_ACTIONS.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => send(q.label)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
          >
            <q.icon className="h-3 w-3" />
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 mt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe symptoms or ask for treatment advice..."
          disabled={loading}
          className="flex-1 rounded-xl bg-input/60 border border-border/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
