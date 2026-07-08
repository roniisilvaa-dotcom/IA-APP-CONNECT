import React, { useState, useEffect } from "react";
import {
  Bot,
  Save,
  Loader2,
  Sparkles,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Send,
  RefreshCw,
  Instagram,
  MessageSquare,
  Phone,
  Clock,
  Plus,
  Trash,
  Zap,
  HelpCircle,
  CheckCircle2
} from "lucide-react";

interface AgentSettingsProps {
  tenant: any;
}

export default function AgentSettings({ tenant }: AgentSettingsProps) {
  // Main settings tabs: 'persona' (Instruções do Agente) or 'triggers' (Gatilhos de Automação)
  const [activeSubTab, setActiveSubTab] = useState<'persona' | 'triggers'>('persona');
  
  // Platform tab inside Triggers: 'instagram' or 'whatsapp'
  const [platformTab, setPlatformTab] = useState<'instagram' | 'whatsapp'>('instagram');

  // General Config State
  const [config, setConfig] = useState<any>({
    agentName: "",
    aiEnabled: true,
    systemPrompt: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Triggers State (Persisted in localStorage so it is durable)
  const [triggers, setTriggers] = useState<any>({
    instagram: {
      onFollowEnabled: true,
      onFollowMsg: "Oi {nome}! 💖 Que alegria te ver seguindo a nossa página! Preparei um presente especial: use o cupom SEGUIDOR10 e ganhe 10% de desconto na sua primeira compra no nosso site. Qualquer dúvida, é só falar! 🌿✨",
      onDmEnabled: true,
      onDmWelcomeMsg: "Olá! Recebemos sua mensagem por aqui. Sou a CA.RO, sua assistente virtual. Já vou te responder em detalhes! Como posso te ajudar hoje? 🛍️🌿",
      onCommentEnabled: true,
      onCommentReplyText: "Oi {nome}! Acabei de te enviar todos os detalhes e o link no seu Direct! Dá uma olhadinha lá! 😉✨",
      onCommentDmText: "Olá, {nome}! Tudo bem? Vi que você comentou na nossa postagem sobre a camiseta musgo. Aqui está o catálogo completo de peças sustentáveis e o link direto para compras! Use o cupom BEMVINDO10 para ganhar 10% OFF! 🛍️🌿",
    },
    whatsapp: {
      onFirstMsgEnabled: true,
      onFirstMsg: "Olá! Tudo bem? Seja muito bem-vindo à nossa loja! 🌿 Sou a CA.RO, sua assistente virtual. Como posso te ajudar hoje?",
      onOffHoursEnabled: true,
      onOffHoursStart: "18:00",
      onOffHoursEnd: "08:00",
      onOffHoursMsg: "Olá! Nosso suporte humano está fora do horário de atendimento no momento, mas eu sou a CA.RO (sua assistente IA) e posso te ajudar agora mesmo! Do que você precisa?",
      onKeywordEnabled: true,
      keywordsList: [
        { id: "kw_1", trigger: "preco, valor, quanto custa, catalogo", reply: "Nossos produtos começam em R$ 89,90! Você pode ver o catálogo completo e fazer o pedido direto no link: caroconnect.eco/catalogo. Oferecemos 5% de desconto no PIX! 😉" },
        { id: "kw_2", trigger: "prazo, frete, entrega, cep", reply: "Enviamos para todo o Brasil via Correios e Transportadora. O prazo de entrega varia de 3 a 7 dias úteis. A primeira troca tem frete grátis! 🚚" }
      ]
    }
  });

  // Simulation State
  const [simulating, setSimulating] = useState(false);
  const [simSuccessToast, setSimSuccessToast] = useState<string | null>(null);

  // Keyword form helpers
  const [newKeywordTrigger, setNewKeywordTrigger] = useState("");
  const [newKeywordReply, setNewKeywordReply] = useState("");

  // Playground Chat Simulator State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: "assistant", content: "Olá! Eu sou o assistente virtual configurado. Salve suas alterações e mande qualquer pergunta para me testar!" }
  ]);
  const [generating, setGenerating] = useState(false);

  // Fetch general config from DB
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenant/agent-config?tenantId=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    
    // Load Triggers from localStorage
    const savedTriggers = localStorage.getItem(`ca_ro_triggers_${tenant.id}`);
    if (savedTriggers) {
      try {
        setTriggers(JSON.parse(savedTriggers));
      } catch (e) {
        console.error("Failed to parse triggers", e);
      }
    }
  }, [tenant.id]);

  // Save General Prompt/Persona
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/tenant/agent-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          agentName: config.agentName,
          aiEnabled: config.aiEnabled,
          systemPrompt: config.systemPrompt,
        }),
      });
      if (res.ok) {
        alert("Configurações do Agente salvas com sucesso!");
      } else {
        alert("Falha ao salvar as configurações.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Save Platform Triggers
  const handleSaveTriggers = () => {
    localStorage.setItem(`ca_ro_triggers_${tenant.id}`, JSON.stringify(triggers));
    alert("Gatilhos de Automação salvos com sucesso!");
  };

  // Keywords management
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordTrigger.trim() || !newKeywordReply.trim()) return;
    
    const newKwList = [
      ...triggers.whatsapp.keywordsList,
      {
        id: `kw_${Math.random().toString(36).substring(2, 6)}`,
        trigger: newKeywordTrigger.trim(),
        reply: newKeywordReply.trim()
      }
    ];

    setTriggers({
      ...triggers,
      whatsapp: {
        ...triggers.whatsapp,
        keywordsList: newKwList
      }
    });

    setNewKeywordTrigger("");
    setNewKeywordReply("");
  };

  const handleDeleteKeyword = (id: string) => {
    const filtered = triggers.whatsapp.keywordsList.filter((k: any) => k.id !== id);
    setTriggers({
      ...triggers,
      whatsapp: {
        ...triggers.whatsapp,
        keywordsList: filtered
      }
    });
  };

  // Test Chat Simulation inside General Persona tab
  const handleSendPlaygroundMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput("");

    const newMsgs = [...chatMessages, { role: "user", content: userText }];
    setChatMessages(newMsgs);
    setGenerating(true);

    try {
      const tempConvId = `playground_${tenant.id}`;
      const res = await fetch(`/api/conversations/${tempConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: userText,
          tenantId: tenant.id,
        }),
      });

      setTimeout(async () => {
        try {
          const replyRes = await fetch(`/api/conversations/${tempConvId}/messages`);
          if (replyRes.ok) {
            const msgs = await replyRes.json();
            if (msgs && msgs.length > 0) {
              const assistantMsgs = msgs.filter((m: any) => m.role === "assistant");
              if (assistantMsgs.length > 0) {
                const lastAssistantMsg = assistantMsgs[assistantMsgs.length - 1];
                setChatMessages((prev) => [...prev, { role: "assistant", content: lastAssistantMsg.content }]);
              }
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setGenerating(false);
        }
      }, 1800);

    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  const handleResetChat = () => {
    setChatMessages([
      { role: "assistant", content: `Olá! Eu sou ${config.agentName || 'a sua assistente virtual'}. Mande qualquer pergunta para testar meus conhecimentos e tom de voz!` }
    ]);
  };

  // Simulate Trigger Event live into client's database
  const handleTriggerSimulation = async (type: 'follow' | 'comment' | 'message' | 'off_hours' | 'first_msg') => {
    setSimulating(true);
    let payloadMessage = "";
    let pform = "instagram";
    let commentText = "";
    let nameToSimulate = "";

    if (platformTab === "instagram") {
      pform = "instagram";
      if (type === "follow") {
        payloadMessage = triggers.instagram.onFollowMsg;
        nameToSimulate = ["Renata Silva", "Karina Souza", "Andressa Dias", "Juliana Mendes"][Math.floor(Math.random() * 4)];
      } else if (type === "comment") {
        commentText = ["Valor?", "Quero o catálogo!", "Gostei da camiseta musgo", "Ainda tem o cupom?"][Math.floor(Math.random() * 4)];
        payloadMessage = triggers.instagram.onCommentDmText;
        nameToSimulate = ["Gabriela Costa", "Pedro Santos", "Lucas Almeida", "Beatriz Lima"][Math.floor(Math.random() * 4)];
      } else {
        payloadMessage = triggers.instagram.onDmWelcomeMsg;
        nameToSimulate = ["Bruna Moreira", "Gustavo Cruz"][Math.floor(Math.random() * 2)];
      }
    } else {
      pform = "whatsapp";
      if (type === "off_hours") {
        payloadMessage = triggers.whatsapp.onOffHoursMsg;
        nameToSimulate = ["Carlos Eduardo", "Roberto Silveira"][Math.floor(Math.random() * 2)];
      } else {
        payloadMessage = triggers.whatsapp.onFirstMsg;
        nameToSimulate = ["Mariana Costa", "Julio Cesar"][Math.floor(Math.random() * 2)];
      }
    }

    try {
      const res = await fetch("/api/conversations/simulate-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          platform: pform,
          triggerType: type,
          customMessage: payloadMessage,
          commentText,
          clientName: nameToSimulate,
        }),
      });

      if (res.ok) {
        setSimSuccessToast(
          `Gatilho de ${type.toUpperCase()} para ${nameToSimulate} simulado! O contato já foi criado e respondido pela IA. Abra a aba "Chats do Cliente" para conferir o atendimento em tempo real!`
        );
        setTimeout(() => setSimSuccessToast(null), 8000);
      } else {
        alert("Falha ao simular o gatilho.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 flex-1 animate-fadeIn">
      {/* Simulation Success Toast */}
      {simSuccessToast && (
        <div className="fixed bottom-6 right-6 z-[250] bg-slate-900 text-white max-w-sm p-4.5 rounded-2xl shadow-2xl border border-emerald-500/30 flex gap-3 animate-slideIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-left">
            <span className="text-xs font-bold block text-emerald-400 uppercase tracking-wide">Automação Ativa!</span>
            <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">{simSuccessToast}</p>
          </div>
        </div>
      )}

      {/* Header and Sub-tab toggle */}
      <div className="border-b border-slate-100 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <Bot className="w-5 h-5 text-emerald-600" />
            Configuração do Agente e Gatilhos
          </h2>
          <p className="text-xs text-slate-500">
            Ajuste a personalidade da IA ou configure regras de resposta automática para comentários, novos seguidores e ausências.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl self-stretch md:self-auto">
          <button
            onClick={() => setActiveSubTab('persona')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'persona' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Diretrizes Gerais
          </button>
          <button
            onClick={() => setActiveSubTab('triggers')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'triggers' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Gatilhos de Automação
          </button>
        </div>
      </div>

      {/* SubTab 1: Persona & Chat Simulator */}
      {activeSubTab === 'persona' && (
        <div id="agent-settings-view" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSaveGeneral} className="space-y-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm text-left">
                <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Status da Automação Geral</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Ative ou desative o atendente em todos os canais</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, aiEnabled: !config.aiEnabled })}
                    className="text-emerald-600 focus:outline-none cursor-pointer"
                  >
                    {config.aiEnabled ? (
                      <ToggleRight className="w-12 h-12 text-emerald-600 transition-transform" />
                    ) : (
                      <ToggleLeft className="w-12 h-12 text-slate-300 transition-transform" />
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome do Atendente Virtual
                  </label>
                  <input
                    type="text"
                    required
                    value={config.agentName}
                    onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
                    placeholder="Ex: CA.RO da EcoModas"
                    className="block w-full p-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Instruções Gerais de Comportamento (System Prompt)
                  </label>
                  <textarea
                    rows={10}
                    required
                    value={config.systemPrompt}
                    onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                    placeholder="Você é a CA.RO, assistente inteligente... Seja simpática..."
                    className="block w-full p-3 border border-slate-200 rounded-xl text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 flex items-start gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Utilize este espaço para definir a personalidade, tom de voz, cupom de desconto atual, formas de contato para suporte humano e limites de atuação do atendente.</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Salvar Alterações</>}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between h-[480px] shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Simulador de Agente Live</span>
                </div>
                <button
                  onClick={handleResetChat}
                  className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Resetar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 text-left scrollbar-thin">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.role === "user" ? "bg-emerald-600 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60"}`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 uppercase font-bold">
                      {msg.role === "user" ? "Você (Cliente)" : config.agentName || "CA.RO IA"}
                    </span>
                  </div>
                ))}
                {generating && (
                  <div className="flex flex-col items-start mr-auto max-w-[85%]">
                    <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl rounded-bl-none border border-slate-200 text-xs flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                      <span>Respondendo...</span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendPlaygroundMsg} className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  disabled={generating}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Pergunte sobre frete, cupons, trocas..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={generating || !chatInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Esta caixa testa em tempo real as respostas automáticas baseando-se estritamente no seu System Prompt e nos PDFs carregados na Base de Conhecimento.
            </p>
          </div>
        </div>
      )}

      {/* SubTab 2: Triggers Automation Configurations */}
      {activeSubTab === 'triggers' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
          {/* Main settings options */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              {/* Platform Selector buttons */}
              <div className="flex border-b border-slate-100 pb-3">
                <button
                  onClick={() => setPlatformTab('instagram')}
                  className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    platformTab === 'instagram' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Instagram className="w-4.5 h-4.5 text-pink-600" />
                  Instagram Direct & Comentários
                </button>
                <button
                  onClick={() => setPlatformTab('whatsapp')}
                  className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    platformTab === 'whatsapp' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <MessageSquare className="w-4.5 h-4.5 text-emerald-600" />
                  WhatsApp Business
                </button>
              </div>

              {/* INSTAGRAM SETTINGS */}
              
                <div className={`space-y-6 animate-fadeIn ${platformTab === 'instagram' ? '' : 'hidden'}`}>
                  
                  {/* TRIGGER 1: FOLLOW */}
                  <div className="space-y-2 border-b border-slate-50 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">Quando começar a te seguir (Mensagem de Boas-vindas)</span>
                        <span className="text-[10px] text-slate-400 block">Envia uma mensagem direta de agradecimento para todo novo seguidor</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTriggers({
                          ...triggers,
                          instagram: { ...triggers.instagram, onFollowEnabled: !triggers.instagram.onFollowEnabled }
                        })}
                        className="text-pink-600 focus:outline-none cursor-pointer"
                      >
                        {triggers.instagram.onFollowEnabled ? <ToggleRight className="w-10 h-10 text-pink-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                      </button>
                    </div>
                    {triggers.instagram.onFollowEnabled && (
                      <textarea
                        rows={3}
                        value={triggers.instagram.onFollowMsg}
                        onChange={(e) => setTriggers({
                          ...triggers,
                          instagram: { ...triggers.instagram, onFollowMsg: e.target.value }
                        })}
                        placeholder="Escreva a mensagem acolhedora de boas-vindas..."
                        className="block w-full p-2.5 border border-slate-200 rounded-xl text-xs font-sans placeholder-slate-400 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* TRIGGER 2: DIRECT MESSAGE */}
                  <div className="space-y-2 border-b border-slate-50 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">Quando alguém mandar uma Mensagem Direta</span>
                        <span className="text-[10px] text-slate-400 block">Ativa a recepção imediata da assistente virtual nas conversas</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTriggers({
                          ...triggers,
                          instagram: { ...triggers.instagram, onDmEnabled: !triggers.instagram.onDmEnabled }
                        })}
                        className="text-pink-600 focus:outline-none cursor-pointer"
                      >
                        {triggers.instagram.onDmEnabled ? <ToggleRight className="w-10 h-10 text-pink-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                      </button>
                    </div>
                    {triggers.instagram.onDmEnabled && (
                      <textarea
                        rows={3}
                        value={triggers.instagram.onDmWelcomeMsg}
                        onChange={(e) => setTriggers({
                          ...triggers,
                          instagram: { ...triggers.instagram, onDmWelcomeMsg: e.target.value }
                        })}
                        placeholder="Recepção imediata do chatbot..."
                        className="block w-full p-2.5 border border-slate-200 rounded-xl text-xs font-sans placeholder-slate-400 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* TRIGGER 3: COMMENT REPLY */}
                  <div className="space-y-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">Quando alguém comentar em uma publicação</span>
                        <span className="text-[10px] text-slate-400 block">Responde o comentário na postagem e envia uma Direct automaticamente</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTriggers({
                          ...triggers,
                          instagram: { ...triggers.instagram, onCommentEnabled: !triggers.instagram.onCommentEnabled }
                        })}
                        className="text-pink-600 focus:outline-none cursor-pointer"
                      >
                        {triggers.instagram.onCommentEnabled ? <ToggleRight className="w-10 h-10 text-pink-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                      </button>
                    </div>
                    {triggers.instagram.onCommentEnabled && (
                      <div className="grid grid-cols-1 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            1. Resposta ao Comentário (Público na Postagem)
                          </label>
                          <input
                            type="text"
                            value={triggers.instagram.onCommentReplyText}
                            onChange={(e) => setTriggers({
                              ...triggers,
                              instagram: { ...triggers.instagram, onCommentReplyText: e.target.value }
                            })}
                            className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            2. Mensagem enviada no Direct (Privado)
                          </label>
                          <textarea
                            rows={5}
                            value={triggers.instagram.onCommentDmText}
                            onChange={(e) => setTriggers({
                              ...triggers,
                              instagram: { ...triggers.instagram, onCommentDmText: e.target.value }
                            })}
                            className="block w-full p-2 border border-slate-200 rounded-lg text-xs font-sans"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              }

              {/* WHATSAPP SETTINGS */}
              
                <div className={`space-y-6 animate-fadeIn ${platformTab === 'whatsapp' ? '' : 'hidden'}`}>
                  
                  {/* TRIGGER 1: FIRST MSG WELCOME */}
                  <div className="space-y-2 border-b border-slate-50 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">Primeira Mensagem de Boas-vindas</span>
                        <span className="text-[10px] text-slate-400 block">Envia de forma instantânea quando um novo cliente entra em contato no WhatsApp</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTriggers({
                          ...triggers,
                          whatsapp: { ...triggers.whatsapp, onFirstMsgEnabled: !triggers.whatsapp.onFirstMsgEnabled }
                        })}
                        className="text-emerald-600 focus:outline-none cursor-pointer"
                      >
                        {triggers.whatsapp.onFirstMsgEnabled ? <ToggleRight className="w-10 h-10 text-emerald-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                      </button>
                    </div>
                    {triggers.whatsapp.onFirstMsgEnabled && (
                      <textarea
                        rows={3}
                        value={triggers.whatsapp.onFirstMsg}
                        onChange={(e) => setTriggers({
                          ...triggers,
                          whatsapp: { ...triggers.whatsapp, onFirstMsg: e.target.value }
                        })}
                        placeholder="Olá! Seja bem-vindo à nossa empresa..."
                        className="block w-full p-2.5 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none"
                      />
                    )}
                  </div>

                  {/* TRIGGER 2: OFF HOURS */}
                  <div className="space-y-3 border-b border-slate-50 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">Mensagem de Ausência (Fora de Horário)</span>
                        <span className="text-[10px] text-slate-400 block">Avisa e direciona o cliente para a assistente virtual quando o suporte humano está fechado</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTriggers({
                          ...triggers,
                          whatsapp: { ...triggers.whatsapp, onOffHoursEnabled: !triggers.whatsapp.onOffHoursEnabled }
                        })}
                        className="text-emerald-600 focus:outline-none cursor-pointer"
                      >
                        {triggers.whatsapp.onOffHoursEnabled ? <ToggleRight className="w-10 h-10 text-emerald-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                      </button>
                    </div>
                    {triggers.whatsapp.onOffHoursEnabled && (
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>Período de Ausência: de </span>
                          <input
                            type="text"
                            value={triggers.whatsapp.onOffHoursStart}
                            onChange={(e) => setTriggers({
                              ...triggers,
                              whatsapp: { ...triggers.whatsapp, onOffHoursStart: e.target.value }
                            })}
                            className="w-14 p-1 border rounded text-center font-mono font-bold"
                          />
                          <span> às </span>
                          <input
                            type="text"
                            value={triggers.whatsapp.onOffHoursEnd}
                            onChange={(e) => setTriggers({
                              ...triggers,
                              whatsapp: { ...triggers.whatsapp, onOffHoursEnd: e.target.value }
                            })}
                            className="w-14 p-1 border rounded text-center font-mono font-bold"
                          />
                        </div>
                        <textarea
                          rows={3}
                          value={triggers.whatsapp.onOffHoursMsg}
                          onChange={(e) => setTriggers({
                            ...triggers,
                            whatsapp: { ...triggers.whatsapp, onOffHoursMsg: e.target.value }
                          })}
                          placeholder="Olá! Estamos fora do horário de expediente..."
                          className="block w-full p-2.5 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* TRIGGER 3: SMART KEYWORDS */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">Regras de Palavras-chave Inteligentes</span>
                        <span className="text-[10px] text-slate-400 block">Respostas estáticas de altíssima velocidade para dúvidas frequentes repetitivas</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTriggers({
                          ...triggers,
                          whatsapp: { ...triggers.whatsapp, onKeywordEnabled: !triggers.whatsapp.onKeywordEnabled }
                        })}
                        className="text-emerald-600 focus:outline-none cursor-pointer"
                      >
                        {triggers.whatsapp.onKeywordEnabled ? <ToggleRight className="w-10 h-10 text-emerald-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                      </button>
                    </div>

                    {triggers.whatsapp.onKeywordEnabled && (
                      <div className="space-y-4">
                        {/* New keyword rule inline form */}
                        <form onSubmit={handleAddKeyword} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                          <input
                            type="text"
                            required
                            value={newKeywordTrigger}
                            onChange={(e) => setNewKeywordTrigger(e.target.value)}
                            placeholder="Gatilhos (separados por vírgula)"
                            className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs flex-1"
                          />
                          <input
                            type="text"
                            required
                            value={newKeywordReply}
                            onChange={(e) => setNewKeywordReply(e.target.value)}
                            placeholder="Texto de resposta rápida"
                            className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs flex-1 sm:col-span-2"
                          />
                          <button
                            type="submit"
                            className="bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer sm:col-span-3 mt-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Adicionar Regra Rápida
                          </button>
                        </form>

                        {/* List of custom rules */}
                        <div className="space-y-2">
                          {triggers.whatsapp.keywordsList.map((kw: any) => (
                            <div key={kw.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-black font-mono text-[9px] uppercase">
                                  Termos: {kw.trigger}
                                </span>
                                <p className="text-slate-600 font-medium text-[11px] leading-relaxed mt-1">Resposta: {kw.reply}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteKeyword(kw.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
          }
                  </div>

                </div>
              )}

              {/* SAVE BUTTON FOR PLATFORM TRIGGERS */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSaveTriggers}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  Salvar Configuração de Gatilhos
                </button>
              </div>

            </div>
          </div>

          {/* SIMULATOR CONSOLE */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-5 shadow-sm space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                <Zap className="w-4.5 h-4.5 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-100">Painel de Testes & Simulação</span>
              </div>

              <div className="text-xs space-y-2 text-slate-300 leading-relaxed text-left">
                <p>Nossos canais oficiais de integração da Meta funcionam em tempo real.</p>
                <p className="bg-slate-800/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  Para facilitar seus testes rápidos e homologação de respostas sem precisar usar um número de celular real, você pode disparar simulações abaixo!
                </p>
              </div>

              {platformTab === 'instagram' ? (
                <div className="space-y-3">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Gatilhos do Instagram</span>
                  
                  <button
                    onClick={() => handleTriggerSimulation('follow')}
                    disabled={simulating || !triggers.instagram.onFollowEnabled}
                    className="w-full bg-pink-600/10 border border-pink-500/20 hover:bg-pink-600/20 text-pink-300 text-[10px] font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Instagram className="w-4 h-4" />
                    Simular Novo Seguidor (Inbox DM)
                  </button>

                  <button
                    onClick={() => handleTriggerSimulation('comment')}
                    disabled={simulating || !triggers.instagram.onCommentEnabled}
                    className="w-full bg-pink-600/10 border border-pink-500/20 hover:bg-pink-600/20 text-pink-300 text-[10px] font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Simular Novo Comentário de Post
                  </button>

                  <button
                    onClick={() => handleTriggerSimulation('message')}
                    disabled={simulating || !triggers.instagram.onDmEnabled}
                    className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                    Simular Mensagem Direta
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Gatilhos do WhatsApp</span>
                  
                  <button
                    onClick={() => handleTriggerSimulation('first_msg')}
                    disabled={simulating || !triggers.whatsapp.onFirstMsgEnabled}
                    className="w-full bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400 text-[10px] font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Phone className="w-4 h-4" />
                    Simular Primeiro Contato (Boas-vindas)
                  </button>

                  <button
                    onClick={() => handleTriggerSimulation('off_hours')}
                    disabled={simulating || !triggers.whatsapp.onOffHoursEnabled}
                    className="w-full bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400 text-[10px] font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Clock className="w-4 h-4" />
                    Simular Contato Fora de Horário
                  </button>
                </div>
              )}

              {simulating && (
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                  <span>Conectando à API Simulada da Meta e processando resposta...</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Ao clicar em qualquer simulação, o sistema cria o perfil com fotos, números, e-mails de Unsplash aleatórios e executa a resposta configurada por você.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
