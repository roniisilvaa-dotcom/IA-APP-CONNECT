import { useState } from "react";
import { motion } from "motion/react";
import {
  MessageSquare,
  Bot,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Zap,
  Shield,
  HelpCircle,
  Database,
  Briefcase,
  Users,
  LineChart,
  Code,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Instagram,
  UserCheck,
  Building,
  Activity,
  Check,
  ChevronDown
} from "lucide-react";

interface LandingPageProps {
  onStartAuth: (plan: 'starter' | 'pro' | 'business' | 'enterprise') => void;
  onLogin: () => void;
}

export default function LandingPage({ onStartAuth, onLogin }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const plans = [
    {
      id: 'starter' as const,
      name: 'START',
      price: 'R$ 97',
      period: 'mês',
      description: 'Ideal para pequenas empresas que desejam iniciar sua operação utilizando Inteligência Artificial.',
      features: [
        'Escolha de 1 canal oficial (WhatsApp ou Instagram)',
        '1 usuário incluso',
        'Inbox Inteligente',
        'IA treinada com a empresa',
        'Base de conhecimento (arquivos)',
        'Smart Bio integrada',
        'Dashboard Executivo',
        'Histórico de Conversas',
        'Suporte padrão por email'
      ],
      badge: '',
      ctaText: 'Começar com Start',
      color: 'border-slate-800 bg-luxury-blue-dark/60 text-white hover:border-slate-700'
    },
    {
      id: 'pro' as const,
      name: 'PRO',
      price: 'R$ 197',
      period: 'mês',
      description: 'Ideal para empresas em crescimento que precisam de fluxo comercial completo.',
      features: [
        'WhatsApp + Instagram Direct oficiais',
        '3 usuários inclusos',
        'CRM de Vendas nativo',
        'Pipeline de Vendas completo',
        'Analytics Avançado de conversas',
        'Funis de automação de fluxo',
        'IA de conversação avançada',
        'Histórico ilimitado de mensagens',
        'Suporte prioritário'
      ],
      badge: 'MAIS VENDIDO',
      ctaText: 'Testar Plano Pro',
      color: 'border-luxury-gold/60 bg-luxury-blue-light/45 text-white ring-1 ring-luxury-gold/30'
    },
    {
      id: 'business' as const,
      name: 'BUSINESS',
      price: 'R$ 397',
      period: 'mês',
      description: 'Para empresas que desejam automatizar toda sua operação com alta performance.',
      features: [
        'Usuários ilimitados',
        'Agentes de IA autônomos múltiplos',
        'Biblioteca de Automações completa',
        'Acesso completo à API CA.RO',
        'Configuração de Webhooks e gatilhos',
        'Integrações com CRMs externos',
        'Dashboard executivo avançado',
        'Permissões personalizadas de equipe',
        'Prioridade máxima no processamento da IA'
      ],
      badge: 'CRESCIMENTO',
      ctaText: 'Escalar com Business',
      color: 'border-slate-800 bg-luxury-blue-dark/90 text-white hover:border-slate-700'
    },
    {
      id: 'enterprise' as const,
      name: 'ENTERPRISE',
      price: 'Sob Consulta',
      period: 'personalizado',
      description: 'Estrutura robusta para corporações com necessidades específicas de segurança e escala.',
      features: [
        'Infraestrutura em nuvem isolada e dedicada',
        'SLA garantido em contrato',
        'Suporte dedicado 24/7 com gerente de conta',
        'Implantação assistida por engenheiros',
        'Consultoria mensal de otimização de IA',
        'Integrações de API sob demanda',
        'Políticas avançadas de governança e LGPD',
        'Contrato sob medida com faturamento direto'
      ],
      badge: 'EXCLUSIVO',
      ctaText: 'Falar com Especialista',
      color: 'border-luxury-gold/20 bg-black/60 text-white hover:border-luxury-gold/40'
    }
  ];

  const segments = [
    { title: "Clínicas & Consultórios", desc: "Agendamento autônomo, triagem inteligente e lembretes de consultas integrados.", icon: Activity },
    { title: "Academias & Studios", desc: "Recuperação de matriculas ativas, envio de planos e atendimento 24h de dúvidas frequentes.", icon: Award },
    { title: "Agências & Serviços", desc: "Qualificação ágil de leads, portfólio via Smart Bio e transição instantânea para o consultor.", icon: Briefcase },
    { title: "Escritórios Profissionais", desc: "Advocacia e contabilidade com triagem refinada de processos e compartilhamento seguro de dados.", icon: Shield },
    { title: "Restaurantes & Delivery", desc: "Envio automatizado de cardápios, captação de pedidos e suporte pós-venda fluido.", icon: Clock },
    { title: "Varejo & E-commerce", desc: "Busca de produtos em tempo real, status de rastreamento de pedidos e recuperação de carrinhos.", icon: TrendingUp },
    { title: "Indústrias & B2B", desc: "Distribuição qualificada de leads para representantes comerciais e catálogos automatizados.", icon: Building },
    { title: "Imobiliárias", desc: "Apresentação instantânea de imóveis disponíveis baseada no perfil e orçamento do cliente.", icon: Users }
  ];

  const coreCards = [
    { title: "Inbox Inteligente", desc: "Central única para gerenciar WhatsApp e Instagram sem alternar telas, com distribuição de atendentes.", icon: MessageSquare },
    { title: "IA Treinada", desc: "Sua assistente domina os PDFs de catálogo, tom de voz e políticas internas da sua empresa.", icon: Bot },
    { title: "CRM Nativo", desc: "Controle todo o histórico de interações do lead desde a primeira mensagem até o fechamento.", icon: UserCheck },
    { title: "Smart Bio", desc: "Link inteligente e customizável para redes sociais focado em direcionar tráfego para conversas diretas.", icon: Sparkles },
    { title: "Analytics Real-Time", desc: "Métricas claras de tempo de resposta, satisfação, volume de mensagens e conversão de vendas.", icon: LineChart },
    { title: "Automações Fluidas", desc: "Funis de mensagens disparados por tags, horários ou interações sem complicação técnica.", icon: Zap },
    { title: "Gestão de Equipe", desc: "Painel de controle com permissões específicas, logs de atividades e métricas por atendente.", icon: Users },
    { title: "Agentes IA Específicos", desc: "Crie assistentes para fins específicos: Comercial, Suporte ou Financeiro atuando em paralelo.", icon: Code }
  ];

  const faqs = [
    { q: "O CA.RO CONNECT utiliza API oficial do WhatsApp?", a: "Sim, operamos exclusivamente através da API Oficial Cloud da Meta. Isso garante segurança jurídica, estabilidade máxima e evita bloqueios do seu número comercial, permitindo escala real." },
    { q: "Posso manter meu número de WhatsApp atual?", a: "Perfeitamente. Você pode utilizar qualquer número ativo (celular ou fixo) para migrar para a API oficial. Nosso time auxilia em todo o processo de transição." },
    { q: "Como a IA é treinada sobre a minha empresa?", a: "Basta carregar seus manuais, catálogos em PDF, perguntas frequentes ou links institucionais no painel. Nossa arquitetura interpreta as regras de negócio e assume o tom de voz da sua marca em minutos." },
    { q: "O que acontece se a IA não souber a resposta?", a: "A IA é programada para ser sincera e elegante. Quando ela encontra uma pergunta fora da base de conhecimento, ela realiza uma transição suave para um atendente humano da sua equipe." },
    { q: "Posso gerenciar múltiplos atendentes com o mesmo número?", a: "Sim. Com o Inbox Inteligente, sua equipe inteira trabalha de forma colaborativa usando um único número de WhatsApp, com chats distribuídos de forma organizada." },
    { q: "Como funcionam os Add-ons (Complementos)?", a: "Oferecemos flexibilidade absoluta. Se você está no plano Start e precisa apenas de um CRM avançado ou de um Agente de IA extra, você pode assinar estes complementos de forma individual sem precisar migrar de plano." },
    { q: "Existe fidelidade contratual?", a: "Não. Nossas assinaturas são mensais ou anuais sem taxas ocultas de cancelamento. Você pode solicitar o encerramento da sua conta ou migrar de plano a qualquer momento pelo painel." },
    { q: "Quais são as formas de pagamento disponíveis?", a: "Aceitamos Cartão de Crédito com recorrência automática, PIX (com liberação instantânea) e Boleto Bancário para maior comodidade operacional de sua empresa." },
    { q: "A plataforma está em conformidade com a LGPD?", a: "Sim, a privacidade dos dados de seus clientes é prioridade absoluta. Todas as mensagens e documentos são protegidos por criptografia de ponta a ponta e armazenados em servidores seguros de alta governança." },
    { q: "Quanto tempo demora o onboarding do sistema?", a: "A ativação básica ocorre em menos de 5 minutos. Conectando seus canais e fazendo o upload dos primeiros documentos, sua IA já estará pronta para responder às primeiras interações." },
    { q: "Posso integrar a CA.RO Connect com meu CRM externo?", a: "Sim. A partir do plano Business, você conta com acesso irrestrito a APIs e Webhooks, permitindo integração direta com Salesforce, Hubspot, ActiveCampaign ou qualquer outro software de sua escolha." },
    { q: "Qual o suporte oferecido para cada plano?", a: "O plano Start conta com suporte padrão via email. O plano Pro inclui suporte prioritário via WhatsApp. O plano Business possui canal direto de alta prioridade, e o Enterprise conta com Gerente de Contas dedicado." }
  ];

  return (
    <div id="landing-page" className="min-h-screen bg-luxury-blue text-slate-100 flex flex-col font-sans selection:bg-luxury-gold selection:text-luxury-black overflow-x-hidden">
      
      {/* 1. TOP NAV BAR */}
      <nav id="navbar" className="sticky top-0 bg-luxury-blue-dark/80 backdrop-blur-md border-b border-white/5 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-luxury-gold via-yellow-600 to-luxury-gold rounded-xl flex items-center justify-center text-luxury-black font-black text-xl shadow-lg shadow-luxury-gold/10">
              CA
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block">
                CA.RO <span className="text-luxury-gold font-medium">CONNECT</span>
              </span>
              <span className="text-[9px] text-luxury-gold-light/60 font-bold uppercase tracking-widest block leading-none">
                ARQUITETURA INTELIGENTE
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <a href="#solucao" className="hover:text-luxury-gold transition-colors">Filosofia</a>
            <a href="#recursos" className="hover:text-luxury-gold transition-colors">Recursos</a>
            <a href="#como-funciona" className="hover:text-luxury-gold transition-colors">Funcionamento</a>
            <a href="#planos" className="hover:text-luxury-gold transition-colors">Planos</a>
            <a href="#faq" className="hover:text-luxury-gold transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="btn-nav-login"
              onClick={onLogin}
              className="text-slate-300 hover:text-white font-medium text-sm transition-colors cursor-pointer px-3 py-2"
            >
              Entrar no Painel
            </button>
            <button
              id="btn-nav-cta"
              onClick={() => onStartAuth('pro')}
              className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-black font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-luxury-gold/5 cursor-pointer flex items-center gap-1.5"
            >
              Criar Conta Grátis
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section id="hero-section" className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Abstract elegant glow elements */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-luxury-blue-light/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Hero Left Content */}
        <div className="lg:col-span-6 space-y-6 text-left relative z-10">
          <div className="inline-flex items-center gap-2 bg-luxury-blue-light/70 border border-white/5 text-luxury-gold px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-luxury-gold animate-pulse" />
            Arquitetura Inteligente para Empresas
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Transforme WhatsApp e Instagram em uma <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-luxury-gold">operação inteligente</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Centralize conversas, automatize atendimentos, organize clientes e aumente suas vendas utilizando Inteligência Artificial de alta performance. Tudo integrado em uma única e sofisticada arquitetura comercial.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <button
              id="btn-hero-cta"
              onClick={() => onStartAuth('pro')}
              className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-black font-bold uppercase text-xs tracking-wider px-8 py-4.5 rounded-xl transition-all shadow-lg shadow-luxury-gold/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              Começar Gratuitamente
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("como-funciona");
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/5 hover:bg-white/10 text-white font-bold uppercase text-xs tracking-wider px-6 py-4.5 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Ver Demonstração
            </button>
          </div>
        </div>

        {/* Hero Right Laptop Preview (Luxury system mockup) */}
        <div className="lg:col-span-6 relative z-10 flex justify-center">
          <div className="w-full max-w-lg aspect-video rounded-2xl bg-luxury-black border border-white/15 p-2 shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-luxury-blue-light/20 to-transparent pointer-events-none"></div>
            
            {/* Window bar */}
            <div className="h-6 bg-luxury-blue-dark/95 flex items-center justify-between px-3 border-b border-white/10">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              </div>
              <span className="text-[8px] font-mono tracking-wider text-slate-500 uppercase">CA.RO CONNECT OS v4.1</span>
              <div className="w-8"></div>
            </div>

            {/* Simulated Live View Inside App */}
            <div className="bg-luxury-blue-dark p-3 h-[calc(100%-24px)] overflow-hidden flex flex-col gap-2.5 text-[10px] text-slate-400">
              
              {/* Top Row: Mini stats & channel tags */}
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold text-[9px]">W</div>
                  <div className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[9px]"><Instagram className="w-3 h-3" /></div>
                  <span className="text-white font-bold tracking-tight text-[9px]">Canais Integrados Ativos</span>
                </div>
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50">● ONLINE</span>
              </div>

              {/* Main row split: mini conversation & CRM state */}
              <div className="grid grid-cols-12 gap-2 flex-1 overflow-hidden">
                
                {/* Chat Panel Mock */}
                <div className="col-span-7 bg-black/40 border border-white/5 rounded-lg p-2 flex flex-col justify-between overflow-hidden">
                  <div className="space-y-1.5 overflow-y-auto pr-1">
                    <div className="bg-white/5 rounded p-1 text-[8px] max-w-[85%] text-slate-300">
                      <span className="font-bold text-luxury-gold block text-[7px]">Mariana Santos (Instagram)</span>
                      Olá! Qual o preço do plano anual de vocês?
                    </div>
                    <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded p-1 text-[8px] max-w-[85%] ml-auto text-slate-200">
                      <span className="font-bold text-luxury-gold-light block text-[7px]">Assistente IA Carol</span>
                      Olá Mariana! Temos planos sob medida que iniciam em R$ 97/mês com foco em crescimento. Gostaria que eu lhe enviasse a proposta de cada módulo?
                    </div>
                  </div>
                  <div className="text-[7px] text-slate-500 border-t border-white/5 pt-1.5 flex justify-between">
                    <span>Processado em 1.2s via Gemini OS</span>
                    <span className="text-emerald-400">100% Autônomo</span>
                  </div>
                </div>

                {/* mini CRM pipeline */}
                <div className="col-span-5 bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col justify-between overflow-hidden">
                  <span className="font-bold text-white text-[8px] uppercase tracking-wide block border-b border-white/5 pb-1">Funil de Vendas</span>
                  
                  <div className="space-y-1 flex-1 py-1">
                    <div className="bg-white/5 p-1 rounded flex justify-between items-center text-[7px]">
                      <span>Novo Lead</span>
                      <span className="font-mono text-white">124</span>
                    </div>
                    <div className="bg-yellow-950/20 border border-yellow-800/30 p-1 rounded flex justify-between items-center text-[7px]">
                      <span>IA Respondendo</span>
                      <span className="font-mono text-luxury-gold">48</span>
                    </div>
                    <div className="bg-emerald-950/20 border border-emerald-800/30 p-1 rounded flex justify-between items-center text-[7px]">
                      <span>Reunião Agendada</span>
                      <span className="font-mono text-emerald-400">19</span>
                    </div>
                  </div>

                  <div className="bg-luxury-gold text-luxury-black font-bold p-1 rounded text-center text-[7px] tracking-wider uppercase mt-1">
                    MRR Projetado: R$ 48.500
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO 02: PHILOSOPHY */}
      <section id="solucao" className="py-20 md:py-28 bg-luxury-black border-t border-b border-white/5 relative">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest block">FILOSOFIA CA.RO</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Sua empresa não precisa de mais ferramentas.<br />
            <span className="text-luxury-gold">Precisa de inteligência.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Enquanto outras plataformas apenas respondem mensagens de forma estática e robotizada, a <strong>CA.RO CONNECT</strong> organiza toda a sua operação comercial. Nós conectamos clientes, automação inteligente, IA treinada, CRM e resultados reais em uma única e bela arquitetura de crescimento.
          </p>

          {/* Connected architecture illustration */}
          <div className="mt-12 p-6 rounded-2xl bg-luxury-blue/40 border border-white/5 relative overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center justify-center text-xs font-bold text-slate-300 relative z-10">
              
              <div className="bg-luxury-black border border-white/5 p-4 rounded-xl flex flex-col items-center gap-2">
                <span className="text-indigo-400 text-[10px] block font-mono">CLIENTES</span>
                <span className="text-white text-xs block">Instagram Direct</span>
              </div>

              <div className="text-luxury-gold font-mono text-center select-none hidden md:block">→</div>

              <div className="col-span-2 bg-luxury-blue border border-luxury-gold/30 p-4 rounded-xl flex flex-col items-center gap-1.5 shadow-lg shadow-luxury-gold/5 relative">
                <div className="absolute top-1 right-1"><Sparkles className="w-3 h-3 text-luxury-gold animate-bounce" /></div>
                <span className="text-luxury-gold text-[9px] block uppercase tracking-wider font-mono">Módulo Core</span>
                <span className="text-white text-sm font-black block">CA.RO CONNECT</span>
              </div>

              <div className="text-luxury-gold font-mono text-center select-none hidden md:block">→</div>

              <div className="bg-luxury-black border border-white/5 p-4 rounded-xl flex flex-col items-center gap-2">
                <span className="text-emerald-400 text-[10px] block font-mono">CRESCIMENTO</span>
                <span className="text-white text-xs block">Vendas & CRM</span>
              </div>

            </div>

            {/* Flow line tags */}
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              <span>Instagram & WhatsApp</span>
              <span>•</span>
              <span>IA Inteligente</span>
              <span>•</span>
              <span>CRM Comercial</span>
              <span>•</span>
              <span>Equipe Unificada</span>
              <span>•</span>
              <span>Conversão & Pós-Venda</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEÇÃO 03: TUDO QUE SUA EMPRESA PRECISA (CARDS) */}
      <section id="recursos" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest block">RECURSOS E MÓDULOS</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Tudo que sua empresa precisa em um só lugar.</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">Selecione apenas os módulos que fazem sentido para sua jornada. Arquitetura flexível sob demanda.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-luxury-black/40 border border-white/5 p-6 rounded-2xl hover:border-luxury-gold/45 transition-all group flex flex-col justify-between hover:translate-y-[-2px] duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold group-hover:bg-luxury-gold/10 group-hover:text-white transition-all mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{card.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                  <span>Módulo CA.RO OS</span>
                  <span className="text-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity">Ativo →</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. SEÇÃO 04: MOSTRAR DASHBOARD (DESKTOP/TABLET/MOBILE) */}
      <section className="py-24 bg-luxury-blue-dark/50 border-t border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest block">EXPERIÊNCIA PREMIUM</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Uma única tela. Controle absoluto de sua marca.</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">Interface extremamente polida inspirada no nível estético de Stripe e Linear. Responsividade nativa e refinada em qualquer dispositivo.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left explanation list */}
            <div className="lg:col-span-4 space-y-6 text-left">
              <div className="border-l-2 border-luxury-gold pl-4 space-y-1">
                <h4 className="text-white text-sm font-bold">Consistência Visual</h4>
                <p className="text-slate-400 text-xs">Desenvolvido com tons de preto profundo, azul petróleo e detalhes dourados para transmitir o máximo profissionalismo.</p>
              </div>
              <div className="border-l-2 border-white/10 pl-4 space-y-1 hover:border-luxury-gold/55 transition-colors">
                <h4 className="text-white text-sm font-bold">Responsividade Impecável</h4>
                <p className="text-slate-400 text-xs">Acesse e gerencie seus leads, configure os system prompts de sua IA e adicione complementos tanto pelo celular quanto pelo desktop.</p>
              </div>
              <div className="border-l-2 border-white/10 pl-4 space-y-1 hover:border-luxury-gold/55 transition-colors">
                <h4 className="text-white text-sm font-bold">Segurança Robusta</h4>
                <p className="text-slate-400 text-xs">Seus dados e históricos de chats contam com conformidade de alta criptografia e backups diários automatizados.</p>
              </div>
            </div>

            {/* Right overlapping desktop/mobile device simulator visual */}
            <div className="lg:col-span-8 relative flex justify-center items-center py-8">
              
              {/* Desktop Monitor Frame Simulation */}
              <div className="w-full max-w-xl bg-luxury-black border border-white/10 rounded-2xl shadow-2xl p-2 relative z-10">
                <div className="h-4 bg-white/5 rounded-t-lg flex items-center gap-1 px-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                </div>
                <div className="bg-luxury-blue h-64 rounded-b-lg p-4 font-sans text-left overflow-hidden relative">
                  
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                    <span className="text-[10px] text-white font-extrabold tracking-wider uppercase">PAINEL EXECUTIVO CA.RO</span>
                    <span className="text-[9px] text-luxury-gold tracking-tight bg-luxury-gold/10 px-2 py-0.5 rounded-full">Pro Ativo</span>
                  </div>

                  {/* Dashboard Content Mini grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[8px] text-slate-500 uppercase block">Total Conversas</span>
                      <span className="text-base font-black text-white block mt-0.5">14.829</span>
                      <span className="text-[7px] text-emerald-400 block">+12% vs ontem</span>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[8px] text-slate-500 uppercase block">Resolvido por IA</span>
                      <span className="text-base font-black text-white block mt-0.5">94.2%</span>
                      <span className="text-[7px] text-emerald-400 block">Tempo médio: 1.5s</span>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[8px] text-slate-500 uppercase block">Atendentes</span>
                      <span className="text-base font-black text-white block mt-0.5">3 online</span>
                      <span className="text-[7px] text-slate-400 block">Capacidade total: 10</span>
                    </div>
                  </div>

                  {/* Activity stream list mock */}
                  <div className="space-y-1 text-[8px] text-slate-400">
                    <div className="flex justify-between p-1.5 bg-black/30 rounded border-l border-luxury-gold">
                      <span>WhatsApp: Lead Bruno Lima - Dúvida sobre frete resolvida por IA</span>
                      <span className="font-mono text-slate-500">Há 2min</span>
                    </div>
                    <div className="flex justify-between p-1.5 bg-black/10 rounded">
                      <span>Instagram: Lead Cláudia Melo - Smart Bio clicada</span>
                      <span className="font-mono text-slate-500">Há 15min</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Overlapping Phone Frame Simulation */}
              <div className="absolute bottom-[-10px] right-[20px] w-36 bg-luxury-black border border-white/20 rounded-2xl shadow-2xl p-1 z-20 hidden sm:block">
                <div className="h-3 flex justify-center items-center bg-white/5 rounded-t-xl mb-1">
                  <span className="w-10 h-1.5 rounded-full bg-slate-800"></span>
                </div>
                <div className="bg-luxury-blue h-48 rounded-b-xl p-2 text-left text-[8px] text-slate-400 relative overflow-hidden">
                  <div className="border-b border-white/10 pb-1 mb-2 flex justify-between">
                    <span className="font-bold text-white uppercase text-[6px]">Mobile view</span>
                    <span className="text-emerald-400 text-[6px]">Active</span>
                  </div>
                  <div className="bg-white/5 p-1.5 rounded mb-1 border border-white/5">
                    <span className="text-[6px] text-slate-500 block">MRR Hoje</span>
                    <span className="font-black text-white text-xs block mt-0.5">R$ 24.900</span>
                  </div>
                  <div className="bg-white/5 p-1.5 rounded border border-white/5 flex flex-col gap-1">
                    <span className="text-[6px] text-slate-500 block">Mensagem</span>
                    <span className="text-slate-300 block text-[6px] truncate">Mariana Costa: 'Gostei...'</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. SEÇÃO 05: COMO FUNCIONA (TIMELINE) */}
      <section id="como-funciona" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center space-y-4 mb-20">
          <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest block">PASSO A PASSO</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Como funciona a CA.RO CONNECT.</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">Em apenas 4 passos simples você revoluciona as vendas e o suporte da sua empresa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-luxury-gold/5 via-luxury-gold/30 to-luxury-gold/5 z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 text-center space-y-4 group">
            <div className="w-14 h-14 bg-luxury-blue-dark border border-white/10 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm mx-auto group-hover:border-luxury-gold transition-all shadow-lg">
              01
            </div>
            <h3 className="text-white font-bold text-base mt-2">Conecte seus canais</h3>
            <p className="text-slate-400 text-xs leading-relaxed px-4">
              Integre seu WhatsApp e Instagram comerciais em poucos cliques utilizando conexões seguras e oficiais Meta.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 text-center space-y-4 group">
            <div className="w-14 h-14 bg-luxury-blue-dark border border-white/10 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm mx-auto group-hover:border-luxury-gold transition-all shadow-lg">
              02
            </div>
            <h3 className="text-white font-bold text-base mt-2">Treine sua IA</h3>
            <p className="text-slate-400 text-xs leading-relaxed px-4">
              Faça upload de manuais de atendimento, catálogos em PDF ou regras comerciais. A assistente absorve os dados instantaneamente.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 text-center space-y-4 group">
            <div className="w-14 h-14 bg-luxury-blue-dark border border-white/10 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm mx-auto group-hover:border-luxury-gold transition-all shadow-lg">
              03
            </div>
            <h3 className="text-white font-bold text-base mt-2">Atendimento autônomo</h3>
            <p className="text-slate-400 text-xs leading-relaxed px-4">
              Sua assistente passa a responder leads e tirar dúvidas 24/7 com máxima fluidez, naturalidade e alto padrão de tom.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 text-center space-y-4 group">
            <div className="w-14 h-14 bg-luxury-blue-dark border border-white/10 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm mx-auto group-hover:border-luxury-gold transition-all shadow-lg">
              04
            </div>
            <h3 className="text-white font-bold text-base mt-2">Acompanhe resultados</h3>
            <p className="text-slate-400 text-xs leading-relaxed px-4">
              Acompanhe seu volume de conversas, leads captados, relatórios de conversões de funil e métricas de satisfação.
            </p>
          </div>

        </div>
      </section>

      {/* 7. SEÇÃO 06: PROJETADO PARA EMPRESAS */}
      <section className="py-24 bg-luxury-black border-t border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest block">SEGMENTOS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Projetado para empresas estruturadas.</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">Modelos de linguagem refinados e integrados para atender as especificidades de cada modelo de negócio.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {segments.map((segment, idx) => {
              const Icon = segment.icon;
              return (
                <div
                  key={idx}
                  className="bg-luxury-blue/30 border border-white/5 hover:border-luxury-gold/30 p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-1px] group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-luxury-gold mb-4 group-hover:bg-luxury-gold/15 group-hover:text-white transition-all">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{segment.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{segment.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. SEÇÃO 07: RESULTADOS (ANIMAÇÕES FICTÍCIAS) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <span className="text-white text-[15vw] font-black tracking-widest font-mono">NUMBERS</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          
          <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white block">+12 Milhões</span>
            <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Conversas Processadas</span>
            <p className="text-[10px] text-slate-500">Respostas rápidas e qualificações autônomas</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-luxury-gold block">+2.4 Milhões</span>
            <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Leads Únicos Captados</span>
            <p className="text-[10px] text-slate-500">Base de contatos integrada ao CRM nativo</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white block">+42%</span>
            <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Taxa de Conversão</span>
            <p className="text-[10px] text-slate-500">Aumento médio de vendas em 60 dias</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-emerald-400 block">85%</span>
            <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold">Tempo Economizado</span>
            <p className="text-[10px] text-slate-500">Filtro autônomo antes da equipe humana</p>
          </div>

        </div>
      </section>

      {/* 9. SEÇÃO 08: PLANOS E ASSINATURAS COMPONENT */}
      <section id="planos" className="py-24 bg-luxury-black border-t border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest block">TABELA DE PREÇOS</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Escolha o plano ideal para crescer.</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">Adicione módulos e complementos sob demanda no painel conforme sua jornada comercial evolui.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`border rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl ${p.color}`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-luxury-gold text-luxury-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    {p.badge}
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-widest">{p.name}</h3>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-2 min-h-[44px]">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{p.price}</span>
                    {p.period && <span className="text-slate-500 text-xs font-medium">/{p.period}</span>}
                  </div>

                  <div className="border-t border-white/5 my-4"></div>

                  <ul className="space-y-3">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5">
                  <button
                    onClick={() => onStartAuth(p.id)}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      p.id === 'pro'
                        ? 'bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {p.ctaText}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick info about individual Add-ons */}
          <div className="mt-12 text-center text-xs text-slate-500 bg-white/5 p-4 rounded-xl max-w-2xl mx-auto border border-white/5">
            <span className="text-luxury-gold font-bold uppercase block text-[10px] mb-1">Flexibilidade Absoluta: Seção Complementos</span>
            Você pode contratar de forma avulsa: <b>Instagram Adicional</b> (R$49), <b>CRM Avançado</b> (R$39), <b>Agentes de IA extras</b> (R$39-49), <b>Usuários</b> (R$19) ou <b>Armazenamento</b> (R$19) de forma avulsa sem trocar de plano!
          </div>

        </div>
      </section>

      {/* 10. SEÇÃO 09: DEPOIMENTOS DE CLIENTES */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest block">DEPOIMENTOS</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">O que dizem grandes operações.</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">Casos reais de empresas que escalaram sua inteligência de vendas com nossa tecnologia.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-luxury-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
            <p className="text-slate-300 text-xs italic leading-relaxed">
              "A migração para a API oficial via CA.RO Connect aumentou nossa conversão de vendas em 48%. O fato de podermos treinar a assistente com nossos PDFs de catálogo evitou que perdêssemos tempo configurando conversas manuais repetitivas."
            </p>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-luxury-gold text-xs">RC</div>
              <div>
                <span className="font-bold text-white text-xs block">Rodrigo Camargo</span>
                <span className="text-slate-500 text-[10px] block">CEO, Camargo Negócios Imobiliários</span>
              </div>
            </div>
          </div>

          <div className="bg-luxury-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between border-luxury-gold/20">
            <p className="text-slate-300 text-xs italic leading-relaxed">
              "Utilizamos o plano Business com usuários ilimitados. Nossos agentes comerciais IA qualificam todos os contatos do Instagram Direct e entregam para o CRM nativo totalmente mastigado. Recomendo para qualquer empresa séria."
            </p>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-luxury-gold text-xs">AM</div>
              <div>
                <span className="font-bold text-white text-xs block">Andréa Mendes</span>
                <span className="text-slate-500 text-[10px] block">Diretora de Operações, Clinica Bella Pelle</span>
              </div>
            </div>
          </div>

          <div className="bg-luxury-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
            <p className="text-slate-300 text-xs italic leading-relaxed">
              "A experiência de UX da plataforma é impecável. É do nível de ferramentas globais como Stripe e Linear. O gerenciamento de complementos nos permitiu crescer sem ter que pagar por pacotes engessados."
            </p>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-luxury-gold text-xs">TS</div>
              <div>
                <span className="font-bold text-white text-xs block">Thiago Silva</span>
                <span className="text-slate-500 text-[10px] block">Cofundador, Alpha Gym Studios</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 11. SEÇÃO 10: FAQ (12 PERGUNTAS SOFISTICADAS) */}
      <section id="faq" className="py-24 bg-luxury-blue-dark/40 border-t border-b border-white/5 relative">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest block">DÚVIDAS FREQUENTES</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Perguntas Frequentes</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">Tudo que você precisa saber sobre a arquitetura e comercialização da CA.RO CONNECT.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-luxury-black/40 border border-white/5 rounded-xl overflow-hidden transition-all duration-200 hover:border-white/10"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full py-4.5 px-6 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-white hover:text-luxury-gold transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-luxury-gold' : ''}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 bg-luxury-black/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. SEÇÃO 11: CTA FINAL */}
      <section className="py-24 max-w-5xl mx-auto px-4 text-center relative z-10">
        <div className="bg-gradient-to-br from-luxury-blue-light/70 via-luxury-black/90 to-luxury-blue-light/45 p-8 sm:p-12 rounded-3xl border border-luxury-gold/20 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-[-100px] left-[50%] -translate-x-1/2 w-80 h-80 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none"></div>

          <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest block">ACESSO INSTANTÂNEO</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Sua operação inteligente<br />começa aqui.
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Em poucos minutos sua empresa pode atender melhor, vender mais e operar com Inteligência Artificial integrada ao WhatsApp e Instagram Direct oficiais. Sem complicação técnica.
          </p>

          <div className="pt-4">
            <button
              onClick={() => onStartAuth('pro')}
              className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-black font-black uppercase text-xs tracking-widest px-10 py-5 rounded-xl transition-all shadow-xl shadow-luxury-gold/10 cursor-pointer inline-flex items-center gap-2"
            >
              Criar Conta Gratuitamente
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 13. FOOTER */}
      <footer className="bg-luxury-black border-t border-white/5 py-12 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-luxury-gold rounded-lg flex items-center justify-center text-luxury-black font-black text-sm">
                CA
              </div>
              <span className="font-extrabold text-white text-sm uppercase tracking-wider">
                CA.RO <span className="text-luxury-gold font-medium">CONNECT</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Solução premium de arquitetura conversacional e IA. Transformamos suas conversas comerciais do WhatsApp e Instagram em fluxos altamente lucrativos de crescimento.
            </p>
            <p className="text-slate-600 text-[10px]">
              © 2026 CA.RO Connect Corp. Todos os direitos reservados.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-white text-[10px] font-bold uppercase tracking-wider block">Produtos</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#" className="hover:text-luxury-gold">Inbox Inteligente</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Agentes Comerciais IA</a></li>
              <li><a href="#" className="hover:text-luxury-gold">CRM Integrado</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Smart Bio Premium</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-white text-[10px] font-bold uppercase tracking-wider block">Empresa</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#" className="hover:text-luxury-gold">Sobre nós</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Carreiras</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Segurança & LGPD</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Fale Conosco</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-white text-[10px] font-bold uppercase tracking-wider block">Documentação</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#" className="hover:text-luxury-gold">API Cloud WhatsApp</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Integrações Webhooks</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Políticas de Uso Meta</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Políticas de Privacidade</a></li>
            </ul>
          </div>

        </div>
      </footer>

    </div>
  );
}
