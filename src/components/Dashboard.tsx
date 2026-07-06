import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Database,
  CreditCard,
  LogOut,
  Sparkles,
  Zap,
  Activity,
  User as UserIcon,
  HelpCircle,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Settings,
  X,
  Globe,
  Users
} from "lucide-react";

import ConversationsView from "./ConversationsView";
import AgentSettings from "./AgentSettings";
import KnowledgeBase from "./KnowledgeBase";
import SubscriptionsView from "./SubscriptionsView";
import MetaIntegrationView from "./MetaIntegrationView";
import ClientsManagementView from "./ClientsManagementView";

interface DashboardProps {
  user: any;
  tenant: any;
  onLogout: () => void;
  onUpdateTenant: (updatedTenant: any) => void;
  currentTheme: 'sand-gold' | 'midnight-velvet' | 'minimal-onyx';
  onChangeTheme: (theme: 'sand-gold' | 'midnight-velvet' | 'minimal-onyx') => void;
}

export default function Dashboard({ user, tenant, onLogout, onUpdateTenant, currentTheme, onChangeTheme }: DashboardProps) {
  const isAdmin = user.email === "ronysiilvaa1@gmail.com" || user.email === "admin@caroconnect.com" || user.email?.startsWith("admin@") || tenant.id === "ten_demo";
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'agent' | 'knowledge' | 'billing' | 'design' | 'meta' | 'clients'>('overview');
  const [stats, setStats] = useState<any>({
    totalConversations: 0,
    activeLeads: 0,
    aiResponseRate: 100,
    totalKnowledgeDocs: 0,
    activeChannels: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/tenant/stats?tenantId=${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 10 seconds to keep metrics updated when simulating customer replies
    const timer = setInterval(fetchStats, 10000);
    return () => clearInterval(timer);
  }, [tenant.id, activeTab]);

  return (
    <div id="dashboard-shell" className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-300">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 bg-brand-card border-b border-brand-border z-40 shrink-0 transition-colors duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md transition-all duration-300">
              CA
            </div>
            <div>
              <span className="font-extrabold text-brand-text text-sm tracking-tight block transition-colors duration-300">
                CA.RO Connect <span className="text-brand-primary font-bold text-[10px] ml-1 bg-brand-accent-light px-2 py-0.5 rounded-full border border-brand-primary-border/40">Premium</span>
              </span>
              <span className="text-[10px] text-brand-text-muted font-bold block uppercase tracking-wider transition-colors duration-300">{tenant.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Luxury Style Center Switcher CTA */}
            <button
              onClick={() => setActiveTab('design')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'design'
                  ? "bg-brand-primary text-white scale-95"
                  : "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-sm hover:shadow-md"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sintonizar Luxo ✨
            </button>

            {/* Active Plan Tag */}
            <span className="text-[10px] font-black uppercase tracking-wider bg-brand-primary text-white px-2.5 py-1 rounded-full shadow-sm transition-colors duration-300">
              Plano {tenant.plan}
            </span>

            <div className="h-5 w-[1px] bg-brand-border"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-primary-light border border-brand-primary-border flex items-center justify-center text-brand-text transition-colors duration-300">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-brand-text block leading-none transition-colors duration-300">{user.name}</span>
                <span className="text-[9px] text-brand-text-muted block leading-none mt-0.5 transition-colors duration-300">{user.email}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="text-brand-text-muted hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Sair do painel"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* BODY MAIN SECTION */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 items-stretch">
        
        {/* SIDE NAVIGATION (3 cols wide on md) */}
        <aside className="md:w-64 shrink-0 flex flex-col gap-2">
          
          <button
            id="nav-overview"
            onClick={() => setActiveTab('overview')}
            className={`w-full py-3 px-4 rounded-xl text-left text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/15 scale-[1.02]"
                : "bg-brand-card border border-brand-border hover:bg-brand-primary-light text-brand-text"
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            Painel Executivo
          </button>

          <button
            id="nav-conversations"
            onClick={() => setActiveTab('conversations')}
            className={`w-full py-3 px-4 rounded-xl text-left text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'conversations'
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/15 scale-[1.02]"
                : "bg-brand-card border border-brand-border hover:bg-brand-primary-light text-brand-text"
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            Chats do Cliente
          </button>

          <button
            id="nav-agent"
            onClick={() => setActiveTab('agent')}
            className={`w-full py-3 px-4 rounded-xl text-left text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'agent'
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/15 scale-[1.02]"
                : "bg-brand-card border border-brand-border hover:bg-brand-primary-light text-brand-text"
            }`}
          >
            <Bot className="w-4.5 h-4.5" />
            Instruções e Persona
          </button>

          <button
            id="nav-knowledge"
            onClick={() => setActiveTab('knowledge')}
            className={`w-full py-3 px-4 rounded-xl text-left text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'knowledge'
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/15 scale-[1.02]"
                : "bg-brand-card border border-brand-border hover:bg-brand-primary-light text-brand-text"
            }`}
          >
            <Database className="w-4.5 h-4.5" />
            Base de Conhecimento (PDFs)
          </button>

          <button
            id="nav-meta"
            onClick={() => setActiveTab('meta')}
            className={`w-full py-3 px-4 rounded-xl text-left text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'meta'
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/15 scale-[1.02]"
                : "bg-brand-card border border-brand-border hover:bg-brand-primary-light text-brand-text"
            }`}
          >
            <Globe className="w-4.5 h-4.5 text-blue-500" />
            Conexão Meta API
          </button>

          {isAdmin && (
            <button
              id="nav-clients"
              onClick={() => setActiveTab('clients')}
              className={`w-full py-3 px-4 rounded-xl text-left text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'clients'
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/15 scale-[1.02]"
                  : "bg-brand-card border border-brand-border hover:bg-brand-primary-light text-brand-text"
              }`}
            >
              <Users className="w-4.5 h-4.5 text-emerald-600" />
              Gerenciar Clientes
            </button>
          )}

          <button
            id="nav-design"
            onClick={() => setActiveTab('design')}
            className={`w-full py-3 px-4 rounded-xl text-left text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'design'
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/15 scale-[1.02]"
                : "bg-brand-card border border-brand-border hover:bg-brand-primary-light text-brand-text"
            }`}
          >
            <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
            Design & Identidade
          </button>

          <button
            id="nav-billing"
            onClick={() => setActiveTab('billing')}
            className={`w-full py-3 px-4 rounded-xl text-left text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'billing'
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/15 scale-[1.02]"
                : "bg-brand-card border border-brand-border hover:bg-brand-primary-light text-brand-text"
            }`}
          >
            <CreditCard className="w-4.5 h-4.5" />
            Assinatura & Painel
          </button>

          {/* Quick info card in sidebar */}
          <div className="mt-auto hidden md:block bg-brand-primary text-white p-4 rounded-2xl border border-brand-primary-border/30 shadow-md">
            <span className="text-[9px] opacity-80 font-bold uppercase tracking-wider block">CO-PILOTO IA</span>
            <span className="text-xs font-black block mt-1">CA.RO IA Assistente</span>
            <p className="text-[10px] opacity-75 mt-1 leading-relaxed">CA.RO responderá dúvidas usando os PDFs carregados. Altere seu System Prompt a qualquer momento.</p>
          </div>

        </aside>

        {/* MAIN DISPLAY WORKSPACE (9 cols wide) */}
        <main className="flex-1 min-w-0 bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden transition-colors duration-300">
          
          <AnimatePresence mode="wait">
            {/* HIGH-LEVEL METRICS CARDS GRID (Always visible on Overview tab) */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-8 flex-1"
              >
                {/* Header metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Conversas</span>
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-950">{stats.totalConversations}</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Acumulado total de chats</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Leads Ativos</span>
                      <UserIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-950">{stats.activeLeads}</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Contatos únicos captados</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Resposta IA</span>
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-950">{stats.aiResponseRate}%</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Mensagens respondidas por IA</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Canais Ativos</span>
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-950">{stats.activeChannels} / 2</h3>
                    <p className="text-[10px] text-slate-500 mt-1">WhatsApp + Instagram</p>
                  </div>

                </div>

                {/* Overview Details (Daily activity logs and AI insights) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Visual log streams */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Atividade Operacional Recente</h3>
                    
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3.5 max-h-[250px] overflow-y-auto">
                      <div className="flex items-start gap-3 text-xs leading-relaxed">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                        <div>
                          <span className="font-bold text-slate-900 block">Lead Mariana Costa respondeu no WhatsApp</span>
                          <span className="text-[10px] text-slate-400">Há 5 minutos • Canal WhatsApp</span>
                          <p className="text-slate-600 text-[11px] mt-0.5">IA CA.RO formulou resposta baseada em Catalogo.pdf em 1.4s.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-xs leading-relaxed border-t border-slate-100/60 pt-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                        <div>
                          <span className="font-bold text-slate-900 block">Lead gabriela_mendes respondeu no Instagram</span>
                          <span className="text-[10px] text-slate-400">Há 20 minutos • Canal Instagram</span>
                          <p className="text-slate-600 text-[11px] mt-0.5">IA CA.RO respondeu sobre política de trocas ecológicas.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-xs leading-relaxed border-t border-slate-100/60 pt-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                        <div>
                          <span className="font-bold text-slate-900 block">Canal Instagram comercial vinculado</span>
                          <span className="text-[10px] text-slate-400">Hoje mais cedo • Sistema Onboarding</span>
                          <p className="text-slate-600 text-[11px] mt-0.5">Página do Facebook vinculada com sucesso à Graph API.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI executive insights */}
                  <div className="bg-emerald-50/40 border border-emerald-100 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <Sparkles className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Recomendações da IA</h3>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Sua assistente virtual CA.RO resolveu <b className="text-emerald-950 font-bold">{stats.aiResponseRate}%</b> das conversas sem necessidade de intervenção humana nas últimas 24 horas.
                    </p>
                    
                    <div className="border-t border-emerald-100 my-3"></div>

                    <h4 className="text-[10px] font-bold text-slate-700 uppercase">Sugestão de otimização:</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Detectamos 3 perguntas de clientes sobre o prazo de fabricação artesanal. Considere adicionar um PDF específico sobre prazos ou detalhar este tema no System Prompt para aumentar as taxas de conversão de leads!
                    </p>
                  </div>

                </div>
              </motion.div>
            )}

            {/* RENDER CONVERSATIONS */}
            {activeTab === 'conversations' && (
              <motion.div
                key="conversations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex-1 flex flex-col min-h-0"
              >
                <ConversationsView tenant={tenant} />
              </motion.div>
            )}

            {/* RENDER AGENT CONFIG */}
            {activeTab === 'agent' && (
              <motion.div
                key="agent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex-1"
              >
                <AgentSettings tenant={tenant} />
              </motion.div>
            )}

            {/* RENDER KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <motion.div
                key="knowledge"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex-1"
              >
                <KnowledgeBase tenant={tenant} />
              </motion.div>
            )}

            {/* RENDER BILLING & STRIPE */}
            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex-1"
              >
                <SubscriptionsView tenant={tenant} onUpdateTenant={onUpdateTenant} />
              </motion.div>
            )}

            {/* RENDER META API CONNECTIONS */}
            {activeTab === 'meta' && (
              <motion.div
                key="meta"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex-1"
              >
                <MetaIntegrationView tenant={tenant} onUpdateTenant={onUpdateTenant} />
              </motion.div>
            )}

            {/* RENDER CLIENTS MANAGEMENT PANEL */}
            {activeTab === 'clients' && isAdmin && (
              <motion.div
                key="clients"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex-1"
              >
                <ClientsManagementView currentTenant={tenant} onUpdateTenant={onUpdateTenant} />
              </motion.div>
            )}

            {/* RENDER LUXURY DESIGN SWITCHER */}
            {activeTab === 'design' && (
              <motion.div
                key="design"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-6 flex-1"
              >
                <div className="border-b border-brand-border pb-5">
                  <span className="text-[10px] text-brand-primary font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Sintonizador de Identidade Visual
                  </span>
                  <h2 className="text-xl font-black text-brand-text tracking-tight flex items-center gap-1.5">
                    Estética Ativa do Sistema
                  </h2>
                  <p className="text-xs text-brand-text-muted">
                    O sistema está configurado exclusivamente com uma assinatura visual limpa de alto contraste, garantindo clareza operacional e sofisticação.
                  </p>
                </div>

                <div className="max-w-2xl">
                  
                  {/* Theme 1: Sand Gold (Branco & Verde WhatsApp - Modo Claro) */}
                  <div 
                    className="border-2 border-[#25D366] bg-[#25D366]/5 rounded-2xl p-6 relative shadow-lg"
                  >
                    <span className="absolute -top-2.5 right-4 bg-[#25D366] text-[#0b141a] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
                      Assinatura Ativa
                    </span>
                    <div>
                      <span className="text-[9px] text-[#25D366] font-bold uppercase tracking-wider block mb-1">WhatsApp Web Light</span>
                      <h3 className="text-lg font-black text-brand-text font-sans">Branco & Verde WhatsApp</h3>
                      <p className="text-xs text-brand-text-muted mt-2 leading-relaxed">
                        Interface limpa de alto contraste. Fundo branco puro com acentos no clássico verde-limão vibrante do WhatsApp, ideal para ambientes bem iluminados, proporcionando o máximo conforto para longos períodos de operação.
                      </p>

                      {/* Small Live Preview Mock */}
                      <div className="mt-4 p-4 bg-[#ffffff] border border-[#e1e8e5] rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1ebd56]"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f4f6f5]"></span>
                        </div>
                        <div className="h-6 bg-[#f4f6f5] border border-[#e1e8e5] rounded-lg flex items-center px-3 justify-between">
                          <span className="text-[9px] text-[#111b21] font-bold">Painel Executivo</span>
                          <span className="text-[8px] text-[#25D366] font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-ping"></span>
                            Online
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-brand-border/40 flex items-center justify-between">
                      <span className="text-[10px] text-brand-text-muted font-bold">Classic Light Mode</span>
                      <span className="text-[10px] font-extrabold text-[#25D366] bg-[#25D366]/10 px-3 py-1.5 rounded-lg border border-[#25D366]/20">
                        Ativo e Sincronizado
                      </span>
                    </div>
                  </div>

                </div>

                {/* AI Assistant Luxury Styling Prompt Mockup */}
                <div className="bg-brand-primary-light border border-brand-primary-border/40 p-5 rounded-2xl mt-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4.5 h-4.5 text-brand-primary" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">O Toque da Assistente Virtual CA.RO</h3>
                  </div>
                  <p className="text-[11px] text-brand-text-muted leading-relaxed">
                    A identidade visual também sintoniza os valores de atendimento da sua assistente de IA. Quando um tema de luxo é ativado, a IA CA.RO adota automaticamente diretrizes de <strong className="text-brand-text">cortesia refinada</strong>, <strong className="text-brand-text">vocabulário polido</strong> e <strong className="text-brand-text">comunicação exclusiva</strong> para combinar perfeitamente com a experiência do seu cliente de alto valor.
                  </p>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

    </div>
  );
}
