import React, { useState } from "react";
import { 
  Globe, 
  Copy, 
  Check, 
  MessageSquare, 
  Instagram, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Shield, 
  Sparkles, 
  Info,
  X
} from "lucide-react";

interface MetaIntegrationViewProps {
  tenant: any;
  onUpdateTenant: (updatedTenant: any) => void;
}

export default function MetaIntegrationView({ tenant, onUpdateTenant }: MetaIntegrationViewProps) {
  // Check if tenant has an active connection stored
  const isCurrentlyConnected = tenant.metaConnected || false;
  
  // Embedded Signup Modal state
  const [isFbPopupOpen, setIsFbPopupOpen] = useState(false);
  const [fbStep, setFbStep] = useState(1);
  const [selectedFbPage, setSelectedFbPage] = useState("boutiquemaria_oficial");
  const [selectedWabaNumber, setSelectedWabaNumber] = useState("+55 (11) 98765-4321");
  const [isConnecting, setIsConnecting] = useState(false);

  // Helper to connect accounts in state
  const handleCompleteConnection = () => {
    setIsConnecting(true);
    setTimeout(() => {
      onUpdateTenant({
        ...tenant,
        metaConnected: true,
        metaWabaNumber: selectedWabaNumber,
        metaInstagramProfile: selectedFbPage,
        metaConnectedAt: new Date().toLocaleDateString("pt-BR")
      });
      setIsConnecting(false);
      setIsFbPopupOpen(false);
    }, 1000);
  };

  // Helper to disconnect accounts
  const handleDisconnect = () => {
    if (window.confirm("Deseja realmente desconectar suas contas de atendimento comercial do sistema?")) {
      onUpdateTenant({
        ...tenant,
        metaConnected: false,
        metaWabaNumber: undefined,
        metaInstagramProfile: undefined,
        metaConnectedAt: undefined
      });
    }
  };

  return (
    <div id="meta-integration-view" className="space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          Integração de Canais
        </span>
        <h2 className="text-xl font-black text-slate-900 mt-2 tracking-tight flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Conexão Oficial Meta API
        </h2>
        <p className="text-xs text-slate-500">
          Ative a Inteligência Artificial diretamente no WhatsApp Business e no Instagram comercial da sua empresa com um clique.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        
        {/* Connection Box */}
        {isCurrentlyConnected ? (
          /* CONNECTED STATE */
          <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 space-y-6 shadow-xs animate-in fade-in duration-300">
            
            {/* Success Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-center sm:text-left">
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Conexão Ativa
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Seus canais de atendimento estão vinculados!
                  </h3>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-ping"></span>
                <span>IA Ativa e Respondendo</span>
              </div>
            </div>

            {/* Active Accounts Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* WhatsApp Active Card */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">WhatsApp Business</span>
                  <p className="text-sm font-black text-slate-900">{tenant.metaWabaNumber || "+55 (11) 98765-4321"}</p>
                  <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Recebendo mensagens
                  </span>
                </div>
              </div>

              {/* Instagram Active Card */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-yellow-500 to-pink-500 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Instagram Comercial</span>
                  <p className="text-sm font-black text-slate-900">@{tenant.metaInstagramProfile || "boutiquemaria_oficial"}</p>
                  <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Directs e comentários ativos
                  </span>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <div className="text-[11px] text-slate-500">
                Conectado em: <span className="font-extrabold text-slate-700">{tenant.metaConnectedAt || "06/07/2026"}</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsFbPopupOpen(true)}
                  className="flex-1 sm:flex-initial text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-center"
                >
                  Alterar Contas Conectadas
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="flex-1 sm:flex-initial text-xs font-bold text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer text-center"
                >
                  Desconectar Integração
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* DISCONNECTED STATE */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            
            {/* Visual Intro */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Como funciona a conexão rápida?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ao clicar no botão de conexão, abriremos a janela segura oficial do <b>Facebook Login</b>. 
                Sua cliente simplesmente seleciona qual perfil do Instagram comercial e qual número do WhatsApp Business ela deseja vincular ao assistente inteligente. 
                Os tokens e chaves são configurados de forma automática em segundo plano, sem necessidade de acessar áreas complexas de desenvolvedor.
              </p>
            </div>

            {/* Simulated Buttons */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFbStep(1);
                  setIsFbPopupOpen(true);
                }}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-md cursor-pointer"
              >
                <svg className="w-4.5 h-4.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Conectar com Facebook (WhatsApp & Instagram)
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Integração oficial segura e criptografada pela Meta.</span>
              </div>
            </div>

            {/* Visual Guide steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase">1. Vincule Suas Contas</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">Faça login com a conta do Facebook comercial que administra suas páginas.</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase">2. Selecione os Canais</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">Escolha qual número de suporte e qual perfil profissional do Instagram receberão a IA.</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase">3. Ativação Imediata</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">Pronto! Nosso sistema ativa o chatbot inteligente e as respostas automáticas começam na hora.</p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* SECURE POPUP WINDOW FOR FB LOGIN */}
      {isFbPopupOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Fake Browser top bar */}
            <div className="bg-slate-200 px-4 py-2.5 flex items-center justify-between border-b border-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400 block"></span>
                <span className="w-3 h-3 rounded-full bg-green-400 block"></span>
                <span className="text-[10px] text-slate-500 font-mono ml-2 bg-white px-3 py-0.5 rounded-md border border-slate-300 w-64 truncate">
                  https://facebook.com/v19.0/dialog/oauth/business...
                </span>
              </div>
              <button 
                onClick={() => setIsFbPopupOpen(false)}
                className="text-slate-500 hover:text-slate-900 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Pop-up brand header */}
            <div className="bg-[#1877F2] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <h5 className="text-xs font-bold font-sans tracking-wide">Entrar com o Facebook</h5>
              </div>
              <span className="text-[10px] text-blue-100 font-medium">CaroConnect Integrações</span>
            </div>

            {/* Pop-up content steps */}
            <div className="p-5 bg-white space-y-4 min-h-[250px] flex flex-col justify-between">
              
              {/* Step 1: Instagram Account Selection */}
              {fbStep === 1 && (
                <div className="space-y-3">
                  <h6 className="font-extrabold text-xs text-slate-800">
                    Selecione a Conta do Instagram Profissional:
                  </h6>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Escolha qual perfil profissional do Instagram receberá a inteligência artificial para responder seus Directs e comentários automaticamente.
                  </p>

                  <div className="space-y-2 pt-2">
                    <label className="border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-all">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-pink-500 text-white font-bold text-[10px] flex items-center justify-center">
                          IG
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-extrabold text-slate-800">{tenant.name || "Minha Empresa"}</p>
                          <p className="text-[10px] text-slate-500">@{tenant.name ? tenant.name.toLowerCase().replace(/\s+/g, "") : "boutiquemaria"}_oficial</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="ig_page"
                        value={tenant.name ? `${tenant.name.toLowerCase().replace(/\s+/g, "")}_oficial` : "boutiquemaria_oficial"}
                        checked={selectedFbPage !== ""}
                        onChange={(e) => setSelectedFbPage(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: WhatsApp Number Selection */}
              {fbStep === 2 && (
                <div className="space-y-3">
                  <h6 className="font-extrabold text-xs text-slate-800">
                    Selecione o Número do WhatsApp Business ativo:
                  </h6>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Este é o número que receberá a automação do assistente inteligente da sua empresa para atender clientes em tempo real.
                  </p>

                  <div className="space-y-2 pt-2">
                    <label className="border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-all">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-extrabold text-slate-800">WhatsApp Comercial (Suporte)</p>
                          <p className="text-[10px] text-slate-500">+55 (11) 98765-4321</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="wa_num"
                        value="+55 (11) 98765-4321"
                        checked={selectedWabaNumber !== ""}
                        onChange={(e) => setSelectedWabaNumber(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Permissions Confirmation */}
              {fbStep === 3 && (
                <div className="space-y-3">
                  <h6 className="font-extrabold text-xs text-slate-800 text-center">
                    Permissões de Atendimento Comercial
                  </h6>
                  <p className="text-[11px] text-slate-600 text-center leading-relaxed max-w-sm mx-auto">
                    Ao confirmar, você concede permissão segura para receber os eventos de conversa e permitir que a Inteligência Artificial responda aos leads.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-[10px] text-slate-500 max-w-sm mx-auto">
                    <p>✓ Visualizar e gerenciar mensagens do Instagram</p>
                    <p>✓ Gerenciar mensagens e envios do WhatsApp Business</p>
                    <p>✓ Conectar webhooks oficiais em tempo real</p>
                  </div>
                </div>
              )}

              {/* Footer Actions of Secure Popup */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (fbStep > 1) setFbStep(fbStep - 1);
                    else setIsFbPopupOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {fbStep === 1 ? "Cancelar" : "Voltar"}
                </button>

                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => {
                    if (fbStep === 1) {
                      setFbStep(2);
                    } else if (fbStep === 2) {
                      setFbStep(3);
                    } else {
                      handleCompleteConnection();
                    }
                  }}
                  className="px-4 py-2 bg-[#1877F2] text-white text-xs font-bold rounded-lg hover:bg-[#166FE5] shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span>{isConnecting ? "Conectando..." : fbStep === 3 ? "Concluir" : "Avançar"}</span>
                  {!isConnecting && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
