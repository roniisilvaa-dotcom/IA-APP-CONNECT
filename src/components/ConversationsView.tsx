import React, { useState, useEffect } from "react";
import { 
  MessageSquare, Instagram, Send, Loader2, Bot, AlertCircle, 
  ToggleLeft, ToggleRight, Check, Plus, HelpCircle, Phone, 
  Mail, MapPin, User, Tag, Calendar, FileText, CheckCheck, 
  Save, Edit2, Info, ExternalLink, X, ChevronRight, MessageCircle, 
  Clock, Trash 
} from "lucide-react";

interface ConversationsViewProps {
  tenant: any;
}

export default function ConversationsView({ tenant }: ConversationsViewProps) {
  const [channel, setChannel] = useState<'whatsapp_meta' | 'instagram'>('whatsapp_meta');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  
  // Custom message reply
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // Profile Details editing state
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profileTag, setProfileTag] = useState("");
  const [profileNotes, setProfileNotes] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Lead injection simulation modal
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadLocation, setNewLeadLocation] = useState("");
  const [newLeadTag, setNewLeadTag] = useState("Novo Lead 🆕");
  const [newLeadMsg, setNewLeadMsg] = useState("");
  const [newLeadNotes, setNewLeadNotes] = useState("");
  const [creatingLead, setCreatingLead] = useState(false);

  // Fetch conversations list
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/conversations?tenantId=${tenant.id}&channel=${channel}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !selectedConv) {
          setSelectedConv(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [channel, tenant.id]);

  // Fetch messages of active thread
  const fetchMessages = async (convId: string) => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      
      // Initialize edit fields
      setProfilePhone(selectedConv.phone || "");
      setProfileEmail(selectedConv.email || "");
      setProfileLocation(selectedConv.location || "");
      setProfileTag(selectedConv.status_tag || "Novo Lead 🆕");
      setProfileNotes(selectedConv.notes || "");
    } else {
      setMessages([]);
    }
  }, [selectedConv]);

  // Handle human reply submission
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    setSending(true);
    const content = replyText.trim();
    setReplyText("");

    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content,
          tenantId: tenant.id,
        }),
      });

      if (res.ok) {
        setMessages((prev) => [...prev, {
          id: Math.random().toString(),
          role: "assistant",
          content,
          createdAt: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // Toggle AI Active Responder on thread
  const handleToggleAiStatus = async (conv: any) => {
    const nextStatus = conv.status === "paused" ? "open" : "paused";
    try {
      const res = await fetch(`/api/conversations/${conv.id}/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, status: nextStatus } : c))
        );
        if (selectedConv?.id === conv.id) {
          setSelectedConv({ ...selectedConv, status: nextStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save profile updates to backend database
  const handleSaveProfile = async () => {
    if (!selectedConv) return;
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          phone: profilePhone,
          email: profileEmail,
          location: profileLocation,
          status_tag: profileTag,
          notes: profileNotes
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProfileSuccess(true);
        setSelectedConv(data.conversation);
        setConversations(prev => prev.map(c => c.id === selectedConv.id ? data.conversation : c));
        setTimeout(() => setProfileSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Simulate new client lead submission
  const handleCreateLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadMsg) return;

    setCreatingLead(true);
    try {
      const convRes = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          channel,
          lead_id: newLeadName,
          phone: newLeadPhone,
          email: newLeadEmail,
          location: newLeadLocation,
          status_tag: newLeadTag,
          notes: newLeadNotes
        }),
      });

      if (convRes.ok) {
        const newConv = await convRes.json();
        
        // Inject customer message
        await fetch(`/api/conversations/${newConv.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "user",
            content: newLeadMsg,
            tenantId: tenant.id,
          }),
        });

        setShowLeadModal(false);
        setNewLeadName("");
        setNewLeadPhone("");
        setNewLeadEmail("");
        setNewLeadLocation("");
        setNewLeadNotes("");
        setNewLeadMsg("");
        
        // Reload conversations and select the new one
        const updateRes = await fetch(`/api/conversations?tenantId=${tenant.id}&channel=${channel}`);
        if (updateRes.ok) {
          const freshConvs = await updateRes.json();
          setConversations(freshConvs);
          const currentNew = freshConvs.find((c: any) => c.id === newConv.id);
          if (currentNew) {
            setSelectedConv(currentNew);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingLead(false);
    }
  };

  // Real-time poller to stream responses
  useEffect(() => {
    if (!selectedConv) return;
    const poller = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations/${selectedConv.id}/messages`);
        if (res.ok) {
          const data = await res.json();
          if (data.length !== messages.length) {
            setMessages(data);
          }
        }
      } catch (e) {
        // ignore
      }
    }, 3000);

    return () => clearInterval(poller);
  }, [selectedConv, messages]);

  // Color mappings for different tags
  const getTagColor = (tag: string) => {
    if (tag.includes("Quente") || tag.includes("🔥")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (tag.includes("Suporte") || tag.includes("🛠️")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (tag.includes("Negociação") || tag.includes("🏷️")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (tag.includes("Fechado") || tag.includes("🚀")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div id="conversations-module" className="grid grid-cols-1 lg:grid-cols-12 border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xl h-[700px] font-sans">
      
      {/* 1. LEFT PANEL: Chat list (3 cols on desktop) */}
      <div className="lg:col-span-3 border-r border-slate-200 flex flex-col h-full bg-slate-50">
        
        {/* Channel Selection Tabs with elegant spacing, padding, and layout */}
        <div className="p-3 bg-white border-b border-slate-200/80 shrink-0 flex flex-col gap-2">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Canal Ativo</span>
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200/40">
            <button
              id="tab-wa"
              onClick={() => { setChannel('whatsapp_meta'); setSelectedConv(null); }}
              className={`flex-1 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
                channel === 'whatsapp_meta'
                  ? "bg-white text-[#25D366] shadow-sm border border-slate-200/30 scale-[1.02]"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
              }`}
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]/5" />
              WhatsApp
            </button>
            <button
              id="tab-ig"
              onClick={() => { setChannel('instagram'); setSelectedConv(null); }}
              className={`flex-1 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
                channel === 'instagram'
                  ? "bg-white text-[#d62976] shadow-sm border border-slate-200/30 scale-[1.02]"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
              }`}
            >
              <Instagram className="w-4 h-4 text-[#d62976]" />
              Instagram
            </button>
          </div>
        </div>

        {/* List Header and Lead Simulation Button */}
        <div className="p-4 border-b border-slate-200/60 flex items-center justify-between shrink-0 bg-white">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Conversas</span>
            <span className="text-[12px] text-slate-800 font-extrabold">{conversations.length} Ativos</span>
          </div>
          <button
            onClick={() => {
              // Populate defaults for faster simulation experience
              setNewLeadName("");
              setNewLeadPhone(channel === 'whatsapp_meta' ? "+55 (11) 9" + Math.floor(10000000 + Math.random() * 90000000) : "@client_" + Math.floor(Math.random() * 999));
              setNewLeadEmail("");
              setNewLeadLocation("São Paulo, SP");
              setNewLeadTag("Novo Lead 🆕");
              setNewLeadNotes("Enviado através do simulador integrado.");
              setNewLeadMsg("Olá! Quero tirar uma dúvida sobre os prazos.");
              setShowLeadModal(true);
            }}
            className="text-[10px] bg-[#25D366]/10 text-[#1ebd56] hover:bg-[#25D366]/20 px-3 py-1.5 rounded-full font-black transition-all cursor-pointer flex items-center gap-1 border border-[#25D366]/20"
            title="Simular mensagem recebida de novo cliente"
          >
            <Plus className="w-3 h-3" />
            Simular Cliente
          </button>
        </div>

        {/* Conversation records */}
        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 px-4 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <MessageSquare className="w-8 h-8 text-slate-200" />
              <span>Nenhuma conversa ativa no {channel === 'whatsapp_meta' ? 'WhatsApp' : 'Instagram'}.</span>
              <button 
                onClick={() => setShowLeadModal(true)} 
                className="mt-3 text-xs text-[#25D366] font-extrabold hover:underline"
              >
                Clique aqui para simular a primeira!
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = selectedConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? "bg-white border-[#25D366]/30 shadow-md shadow-emerald-50"
                      : "bg-transparent border-transparent hover:bg-slate-200/40 text-slate-700"
                  }`}
                >
                  {/* Avatar wrapper with channel badge overlay */}
                  <div className="relative shrink-0">
                    <img 
                      src={conv.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                      alt={conv.lead_id} 
                      className="w-11 h-11 rounded-full object-cover border border-slate-200/80"
                      referrerPolicy="no-referrer"
                    />
                    <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm ${
                      conv.channel === 'whatsapp_meta' ? 'bg-[#25D366]' : 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]'
                    }`}>
                      {conv.channel === 'whatsapp_meta' ? (
                        <MessageSquare className="w-2.5 h-2.5 text-white fill-white" />
                      ) : (
                        <Instagram className="w-2.5 h-2.5 text-white" />
                      )}
                    </span>
                  </div>

                  {/* Body information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-slate-900 truncate">{conv.lead_id}</h4>
                      <span className="text-[9px] text-slate-400 font-medium shrink-0">
                        {new Date(conv.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{conv.phone}</p>
                    
                    {/* Tags & AI states row */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border ${getTagColor(conv.status_tag || "")}`}>
                        {conv.status_tag || "Novo Lead 🆕"}
                      </span>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        conv.status === 'paused'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {conv.status === 'paused' ? 'Suporte Humano' : 'CA.RO IA'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* 2. MIDDLE PANEL: Active Chat Thread (6 cols on desktop) */}
      <div className={`lg:col-span-6 flex flex-col h-full bg-[#efeae2] border-r border-slate-200 relative`}>
        
        {selectedConv ? (
          <>
            {/* Header style dynamic to channel (Whatsapp vs Instagram) */}
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={selectedConv.avatarUrl} 
                    alt={selectedConv.lead_id} 
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 leading-none">
                    {selectedConv.lead_id}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-ping"></span>
                    <span className="text-[10px] text-slate-400 font-bold">Online • {selectedConv.phone}</span>
                  </div>
                </div>
              </div>

              {/* Toggle IA Control */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">CA.RO IA Responde:</span>
                <button
                  onClick={() => handleToggleAiStatus(selectedConv)}
                  className="focus:outline-none cursor-pointer flex items-center"
                  title={selectedConv.status === 'paused' ? "Ativar IA para responder automaticamente" : "Pausar IA para intervenção humana"}
                >
                  {selectedConv.status !== 'paused' ? (
                    <ToggleRight className="w-10 h-10 text-[#25D366] transition-all" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-slate-300 transition-all" />
                  )}
                </button>
              </div>
            </div>

            {/* Conversation Messages viewport with background styling */}
            <div 
              className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin"
              style={{
                backgroundColor: channel === 'whatsapp_meta' ? '#efeae2' : '#ffffff',
                backgroundImage: channel === 'whatsapp_meta' ? 'radial-gradient(#dfdcd6 1px, transparent 1px)' : 'none',
                backgroundSize: '16px 16px'
              }}
            >
              <div className="mx-auto max-w-sm text-center my-2">
                <span className="bg-white/90 backdrop-blur-sm border border-slate-200/60 text-slate-500 text-[9px] px-3 py-1 rounded-lg font-bold shadow-xs uppercase tracking-wider block">
                  {selectedConv.channel === 'whatsapp_meta' ? 'Criptografia de simulação via WhatsApp Business API' : 'Direct integrado via Instagram API'}
                </span>
              </div>

              {loadingMsgs ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${isUser ? 'mr-auto items-start' : 'ml-auto items-end'}`}
                    >
                      {/* Message Balloon */}
                      <div
                        className={`p-3.5 rounded-2xl text-[12px] leading-relaxed shadow-sm relative ${
                          isUser
                            ? 'bg-white text-slate-800 rounded-tl-none border border-slate-200/50'
                            : channel === 'whatsapp_meta'
                              ? 'bg-[#D9FDD3] text-slate-800 rounded-tr-none'
                              : 'bg-gradient-to-tr from-[#8a3ab9] to-[#e95950] text-white rounded-tr-none'
                        }`}
                      >
                        {/* Little corner tail for WhatsApp style */}
                        {channel === 'whatsapp_meta' && (
                          <span className={`absolute top-0 w-2.5 h-2.5 overflow-hidden ${
                            isUser 
                              ? '-left-2 text-white fill-current' 
                              : '-right-2 text-[#D9FDD3] fill-current'
                          }`}>
                            <svg viewBox="0 0 8 8" className="w-full h-full">
                              <polygon points={isUser ? "8,0 8,8 0,0" : "0,0 0,8 8,0"} />
                            </svg>
                          </span>
                        )}

                        <p className="font-medium whitespace-pre-wrap">{msg.content}</p>

                        {/* Double Check & Time */}
                        <div className="flex items-center justify-end gap-1 mt-1.5">
                          <span className={`text-[8px] font-bold ${isUser ? 'text-slate-400' : channel === 'whatsapp_meta' ? 'text-emerald-600' : 'text-white/70'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {!isUser && (
                            <CheckCheck className={`w-3.5 h-3.5 ${
                              channel === 'whatsapp_meta' ? 'text-[#34b7f1]' : 'text-white/80'
                            }`} />
                          )}
                        </div>
                      </div>

                      {/* Author badge */}
                      <span className="text-[8px] text-slate-400 mt-1 uppercase font-black tracking-widest px-1">
                        {isUser ? selectedConv.lead_id : 'CA.RO Assistente Virtual'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Reply Form (human intervention) */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-white flex gap-2 shrink-0 items-center">
              <input
                type="text"
                disabled={sending}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={selectedConv.status === 'paused' ? "Digite sua resposta de suporte humano..." : "Pause a CA.RO IA no botão acima para poder responder manualmente..."}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#25D366] transition-all font-medium"
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="bg-[#25D366] hover:bg-[#1ebd56] disabled:opacity-40 text-[#0b141a] p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md shadow-[#25D366]/20"
              >
                <Send className="w-4 h-4 fill-[#0b141a]" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-xs text-center space-y-3 bg-white">
            <MessageSquare className="w-12 h-12 text-slate-200 animate-pulse" />
            <p className="font-extrabold text-slate-600">Nenhum chat selecionado</p>
            <p className="max-w-xs text-slate-400 leading-relaxed">Selecione um contato na lista lateral para carregar a conversa e gerenciar os dados em tempo real.</p>
          </div>
        )}

      </div>

      {/* 3. RIGHT PANEL: Contact profile details (3 cols on desktop) */}
      <div className="lg:col-span-3 border-l border-slate-200 flex flex-col h-full bg-white overflow-y-auto">
        {selectedConv ? (
          <div className="p-5 flex flex-col h-full">
            
            {/* Centered Avatar and Name */}
            <div className="text-center pb-5 border-b border-slate-200 flex flex-col items-center shrink-0">
              <div className="relative group mb-3">
                <img 
                  src={selectedConv.avatarUrl} 
                  alt={selectedConv.lead_id} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#25D366] shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] shadow-md ${
                  selectedConv.channel === 'whatsapp_meta' ? 'bg-[#25D366]' : 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]'
                }`}>
                  {selectedConv.channel === 'whatsapp_meta' ? (
                    <MessageSquare className="w-3.5 h-3.5 text-white fill-white" />
                  ) : (
                    <Instagram className="w-3.5 h-3.5 text-white" />
                  )}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 mt-1">{selectedConv.lead_id}</h3>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider">
                {selectedConv.channel === 'whatsapp_meta' ? 'WhatsApp Business' : 'Instagram Direct'}
              </p>
            </div>

            {/* Editable Profile Information Block */}
            <div className="flex-1 py-4 space-y-4">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">Dados de Contato</span>
              
              {/* Phone / Username */}
              <div>
                <label className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {selectedConv.channel === 'whatsapp_meta' ? 'Telefone WhatsApp' : 'Instagram Handle'}
                </label>
                <input 
                  type="text" 
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#25D366] transition-all"
                  placeholder={selectedConv.channel === 'whatsapp_meta' ? "+55 11 9..." : "@usuario"}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  E-mail do Cliente
                </label>
                <input 
                  type="email" 
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#25D366] transition-all"
                  placeholder="cliente@exemplo.com"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Localidade / Região
                </label>
                <input 
                  type="text" 
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#25D366] transition-all"
                  placeholder="Ex: São Paulo, SP"
                />
              </div>

              {/* Tag Status Selector */}
              <div>
                <label className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  Status da Conversa
                </label>
                <select
                  value={profileTag}
                  onChange={(e) => setProfileTag(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#25D366] cursor-pointer"
                >
                  <option value="Novo Lead 🆕">Novo Lead 🆕</option>
                  <option value="Lead Quente 🔥">Lead Quente 🔥</option>
                  <option value="Negociação 🏷️">Negociação 🏷️</option>
                  <option value="Suporte 🛠️">Suporte 🛠️</option>
                  <option value="Fechado 🚀">Fechado 🚀</option>
                </select>
              </div>

              {/* Contact Notes */}
              <div>
                <label className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                  <FileText className="w-3 h-3 text-slate-400" />
                  Observações & Histórico
                </label>
                <textarea 
                  rows={4}
                  value={profileNotes}
                  onChange={(e) => setProfileNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#25D366] transition-all resize-none"
                  placeholder="Adicione anotações sobre o cliente, produtos de interesse, detalhes das dúvidas já sanadas..."
                />
              </div>

            </div>

            {/* Save Buttons & Feedback */}
            <div className="pt-4 border-t border-slate-200 shrink-0">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full bg-[#25D366] hover:bg-[#1ebd56] disabled:bg-slate-300 text-[#0b141a] font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/10"
              >
                {savingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : profileSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Salvo com Sucesso!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Dados do Contato
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 text-xs text-center space-y-2">
            <Info className="w-8 h-8 text-slate-200" />
            <p className="font-bold">Detalhes de Contato</p>
            <p className="text-slate-400">Clique em qualquer conversa para visualizar e editar os dados cadastrados.</p>
          </div>
        )}
      </div>

      {/* SIMULATE INCOMING CUSTOMER LEAD MODAL */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[200] px-4 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 relative animate-zoomIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                Simular Mensagem Recebida de Cliente
              </h3>
              <button 
                onClick={() => setShowLeadModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Simule o envio de uma mensagem real de um cliente de fora no seu {channel === 'whatsapp_meta' ? 'WhatsApp' : 'Instagram Direct'}. O agente CA.RO IA fará a resposta de atendimento inteligente instantaneamente!
            </p>

            <form onSubmit={handleCreateLeadSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                    Nome Completo do Cliente
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    placeholder="Ex: Pedro Henrique"
                    className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                    {channel === 'whatsapp_meta' ? 'Telefone WhatsApp' : 'Instagram Handle'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    placeholder={channel === 'whatsapp_meta' ? "+55 (11) 99888-2233" : "@pedro_henrique"}
                    className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                    E-mail para Cadastro
                  </label>
                  <input
                    type="email"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    placeholder="pedro.h@exemplo.com"
                    className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                    Localização (Cidade, Estado)
                  </label>
                  <input
                    type="text"
                    value={newLeadLocation}
                    onChange={(e) => setNewLeadLocation(e.target.value)}
                    placeholder="São Paulo, SP"
                    className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                    Marcar Conversa com Tag
                  </label>
                  <select
                    value={newLeadTag}
                    onChange={(e) => setNewLeadTag(e.target.value)}
                    className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#25D366] cursor-pointer"
                  >
                    <option value="Novo Lead 🆕">Novo Lead 🆕</option>
                    <option value="Lead Quente 🔥">Lead Quente 🔥</option>
                    <option value="Negociação 🏷️">Negociação 🏷️</option>
                    <option value="Suporte 🛠️">Suporte 🛠️</option>
                    <option value="Fechado 🚀">Fechado 🚀</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                    Primeiras Observações (Notas)
                  </label>
                  <input
                    type="text"
                    value={newLeadNotes}
                    onChange={(e) => setNewLeadNotes(e.target.value)}
                    placeholder="Inserir anotação inicial opcional..."
                    className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                  Texto da Mensagem (O que ele dirá no chat)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newLeadMsg}
                  onChange={(e) => setNewLeadMsg(e.target.value)}
                  placeholder="Ex: Olá! Vi o catálogo e me interessei no Tênis de Fibra de Bambu. Vcs dividem em qts vezes?"
                  className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#25D366] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingLead || !newLeadName || !newLeadMsg}
                  className="bg-[#25D366] hover:bg-[#1ebd56] disabled:bg-slate-300 disabled:text-slate-500 text-[#0b141a] text-xs font-black px-5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#25D366]/10 transition-all"
                >
                  {creatingLead ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      Simular Entrada de Mensagem
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
