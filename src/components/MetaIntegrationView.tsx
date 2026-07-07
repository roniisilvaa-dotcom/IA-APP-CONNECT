import React, { useState, useEffect } from "react";
import {
  Globe,
  MessageSquare,
  Instagram,
  CheckCircle2,
  Shield,
  Sparkles,
} from "lucide-react";

interface MetaIntegrationViewProps {
  tenant: any;
  onUpdateTenant: (updatedTenant: any) => void;
}

interface MetaStatus {
  connected: boolean;
  whatsapp?: string;
  instagram?: string;
  connectedAt?: string;
}

export default function MetaIntegrationView({ tenant, onUpdateTenant }: MetaIntegrationViewProps) {
  const [status, setStatus] = useState<MetaStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/meta/status?tenantId=${tenant.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) setStatus(data);
      })
      .catch(() => {
        if (isMounted) setStatus({ connected: false });
      })
      .finally(() => {
        if (isMounted) setLoadingStatus(false);
      });
    return () => {
      isMounted = false;
    };
  }, [tenant.id]);

  const isCurrentlyConnected = status?.connected ?? false;

  // Redirects to the real backend endpoint, which starts the official Meta
  // (Facebook Login for Business) OAuth flow. The user picks their own
  // WhatsApp Business number / Instagram account on Meta's own hosted page.
  const handleConnectClick = () => {
    window.location.href = `/api/meta/oauth/start?tenantId=${tenant.id}`;
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Deseja realmente desconectar suas contas de atendimento comercial do sistema?")) {
      return;
    }
    try {
      await fetch(`/api/meta/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenant.id }),
      });
    } catch (err) {
      console.error("[Meta Disconnect] Failed", err);
    }
    setStatus({ connected: false });
    onUpdateTenant({
      ...tenant,
      metaConnected: false,
      metaWabaNumber: undefined,
      metaInstagramProfile: undefined,
      metaConnectedAt: undefined,
    });
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

        {loadingStatus ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-xs text-slate-500">
            Verificando status da conexão...
          </div>
        ) : isCurrentlyConnected ? (
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
                  <p className="text-sm font-black text-slate-900">{status?.whatsapp || "Não conectado"}</p>
                  <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {status?.whatsapp ? "Recebendo mensagens" : "Aguardando conexão"}
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
                  <p className="text-sm font-black text-slate-900">{status?.instagram ? `@${status.instagram}` : "Não conectado"}</p>
                  <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {status?.instagram ? "Directs e comentários ativos" : "Aguardando conexão"}
                  </span>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <div className="text-[11px] text-slate-500">
                Conectado em: <span className="font-extrabold text-slate-700">{status?.connectedAt || "-"}</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleConnectClick}
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
                Ao clicar no botão de conexão, você será levado para a janela oficial e segura de login do <b>Facebook</b>.
                Selecione qual perfil profissional do Instagram e qual número do WhatsApp Business deseja vincular ao assistente inteligente.
                Os tokens e chaves são configurados automaticamente em segundo plano, sem necessidade de acessar áreas complexas de desenvolvedor.
              </p>
            </div>

            {/* Real connect button */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={handleConnectClick}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-md cursor-pointer"
              >
                <svg className="w-4.5 h-4.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Conectar com Facebook (WhatsApp & Instagram)
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Integração oficial segura pela Meta.</span>
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

    </div>
  );
}
