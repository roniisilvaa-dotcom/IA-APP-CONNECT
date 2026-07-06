import React, { useState } from "react";
import { Check, Info, Bot, MessageSquare, Instagram, ChevronRight, Loader2, Play, CheckCircle2, Globe, ShieldCheck } from "lucide-react";

interface OnboardingFlowProps {
  tenant: any;
  user: any;
  onOnboardingComplete: (updatedTenant: any) => void;
}

export default function OnboardingFlow({ tenant, user, onOnboardingComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [segment, setSegment] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Meta integration states
  const [waConnected, setWaConnected] = useState(false);
  const [waNumber, setWaNumber] = useState("");
  const [showMetaPopup, setShowMetaPopup] = useState(false);
  const [metaPopupStep, setMetaPopupStep] = useState(1);
  const [metaVerifyCode, setMetaVerifyCode] = useState("");

  // Instagram integration states
  const [igConnected, setIgConnected] = useState(false);
  const [igHandle, setIgHandle] = useState("");
  const [showIgPopup, setShowIgPopup] = useState(false);

  const businessSegments = [
    "E-Commerce de Moda",
    "Clínicas e Consultórios Médicos",
    "Restaurante / Delivery",
    "SaaS / Tecnologia",
    "Imobiliária / Corretores",
    "Consultoria e Serviços Gerais",
    "Outro",
  ];

  const handleNextStep1 = () => {
    if (!segment || !description) {
      alert("Por favor, preencha todos os campos do negócio.");
      return;
    }
    setStep(2);
  };

  const handleMetaLoginClick = () => {
    setShowMetaPopup(true);
    setMetaPopupStep(1);
  };

  const handleMetaPopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (metaPopupStep === 1) {
      if (!waNumber) {
        alert("Digite um número de telefone válido.");
        return;
      }
      setMetaPopupStep(2); // send mock SMS
    } else if (metaPopupStep === 2) {
      if (!metaVerifyCode) {
        alert("Digite o código de verificação.");
        return;
      }
      // Success
      setWaConnected(true);
      setShowMetaPopup(false);
    }
  };

  const handleIgLoginClick = () => {
    setShowIgPopup(true);
  };

  const handleIgPopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!igHandle) {
      alert("Digite seu @username do Instagram.");
      return;
    }
    setIgConnected(true);
    setShowIgPopup(false);
  };

  const handleFinalize = async () => {
    setLoading(true);

    const channelsToSave = [];
    if (waConnected) {
      channelsToSave.push({ type: "whatsapp_meta", identifier: waNumber });
    }
    if (igConnected) {
      channelsToSave.push({ type: "instagram", identifier: `@${igHandle.replace("@", "")}` });
    }

    try {
      const res = await fetch("/api/tenant/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          segment,
          description,
          channels: channelsToSave,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao completar onboarding");
      }

      onOnboardingComplete(data.tenant);
    } catch (err: any) {
      alert(err.message || "Erro de rede ao salvar onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="onboarding-flow" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto bg-white border border-slate-200 rounded-3xl shadow-2xl p-8">
        
        {/* Onboarding Header with Progress Steps */}
        <div className="mb-8">
          <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Passo {step} de 3
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Configurando seu Agente IA
          </h2>
          <p className="text-xs text-slate-500">
            {step === 1 && "Primeiro, conte-nos sobre seu negócio para ajustarmos as respostas da IA."}
            {step === 2 && "Conecte seu WhatsApp oficial através do fluxo oficial da Meta."}
            {step === 3 && "Conecte sua conta comercial do Instagram para automação de DMs."}
          </p>

          {/* Progress bar visualizer */}
          <div className="mt-6 flex items-center justify-between gap-1">
            <div className={`h-1.5 rounded-full flex-1 transition-all ${step >= 1 ? "bg-emerald-600" : "bg-slate-200"}`}></div>
            <div className={`h-1.5 rounded-full flex-1 transition-all ${step >= 2 ? "bg-emerald-600" : "bg-slate-200"}`}></div>
            <div className={`h-1.5 rounded-full flex-1 transition-all ${step >= 3 ? "bg-emerald-600" : "bg-slate-200"}`}></div>
          </div>
        </div>

        {/* STEP 1: BUSINESS PROFILE DETAILS */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Qual o segmento principal da {tenant.name}?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {businessSegments.map((seg) => (
                  <button
                    key={seg}
                    onClick={() => setSegment(seg)}
                    className={`p-3 text-xs font-semibold rounded-xl text-left border transition-all cursor-pointer ${
                      segment === seg
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-50"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {seg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Descreva seu negócio (Para instruir a IA)
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Somos a EcoModas. Vendemos roupas de algodão 100% orgânico feitas à mão. Nossa loja física fica em SP e entregamos via Correios. Aceitamos cartão de crédito e PIX com 5% desc. Oferecemos trocas sem custo em 30 dias..."
                className="block w-full p-3.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-emerald-600 shrink-0" />
                Dica: Quanto mais detalhes colocar sobre prazos, políticas e formas de pagamento, melhor sua assistente IA responderá!
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleNextStep1}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-3 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-emerald-50"
              >
                Avançar para Canais
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WHATSAPP META EMBEDDED SIGNUP */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100 mb-4">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Embedded Meta Signup oficial</h3>
              <p className="text-xs text-slate-600 mt-1.5 max-w-sm">
                Conecte seu número de WhatsApp comercial em poucos segundos. O número será hospedado nos servidores seguros da Meta e ativado com a CA.RO IA.
              </p>
            </div>

            {waConnected ? (
              <div className="bg-slate-50 rounded-xl p-4 border border-emerald-500 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">WhatsApp Conectado</h4>
                    <p className="text-[10px] text-slate-500">{waNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setWaConnected(false)}
                  className="text-[10px] text-red-600 hover:underline cursor-pointer"
                >
                  Alterar número
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleMetaLoginClick}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-100 cursor-pointer transition-all transform hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  Conectar WhatsApp com Meta
                </button>
                <p className="text-[10px] text-slate-400 mt-2.5">
                  Requer um número de telefone celular ou fixo livre (que não esteja no app do WhatsApp comum).
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-3 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-emerald-50"
              >
                Ir para Passo 3 (Opcional)
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INSTAGRAM DIRECT INTEGRATION */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-100 mb-4">
                <Instagram className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Automação de DMs do Instagram</h3>
              <p className="text-xs text-slate-600 mt-1.5 max-w-sm">
                (Opcional) Responda directs, comentários e reações aos stories do Instagram automaticamente por inteligência artificial.
              </p>
            </div>

            {igConnected ? (
              <div className="bg-slate-50 rounded-xl p-4 border border-purple-500 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Instagram DM Integrado</h4>
                    <p className="text-[10px] text-slate-500">@{igHandle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIgConnected(false)}
                  className="text-[10px] text-red-600 hover:underline cursor-pointer"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleIgLoginClick}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-purple-100 cursor-pointer transition-all transform hover:-translate-y-0.5"
                >
                  <Instagram className="w-4 h-4" />
                  Vincular conta Instagram
                </button>
                <p className="text-[10px] text-slate-400 mt-2.5">
                  Requer uma conta profissional/comercial conectada a uma Página do Facebook.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-100"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Finalizar Configuração
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* META EMBEDDED SIGNUP SIMULATION POPUP MODAL */}
      {showMetaPopup && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative font-sans animate-zoomIn">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                ∞
              </div>
              <span className="text-[11px] font-black tracking-wide text-slate-500 uppercase">Meta Business Partner Portal</span>
            </div>

            <h3 className="text-base font-black text-slate-900">
              {metaPopupStep === 1 ? "Vincular número comercial do WhatsApp" : "Verificar código de segurança"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {metaPopupStep === 1
                ? "Insira o número de celular ou linha fixa exclusiva para hospedar o canal oficial."
                : "Insira o código SMS enviado para o seu dispositivo para ativação do Webhook."}
            </p>

            <form onSubmit={handleMetaPopupSubmit} className="mt-4 space-y-4">
              {metaPopupStep === 1 ? (
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Número do WhatsApp (DDI + DDD + Número)
                  </label>
                  <input
                    type="text"
                    required
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    placeholder="+55 (11) 98765-4321"
                    className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  />
                  <div className="mt-3 p-3 bg-blue-50 text-blue-800 text-[10px] leading-relaxed rounded-xl flex items-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                    <span>Ao avançar, o número será integrado automaticamente ao app CA.RO Connect usando credenciais de API homologadas pela Meta Cloud API.</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Código SMS / Ligação (6 dígitos)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={metaVerifyCode}
                    onChange={(e) => setMetaVerifyCode(e.target.value)}
                    placeholder="123456"
                    className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs tracking-widest text-center font-bold"
                  />
                  <p className="text-[9px] text-slate-400 mt-1.5">
                    Dica: Digite qualquer código de 6 dígitos para simular a validação com sucesso.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMetaPopup(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1"
                >
                  {metaPopupStep === 1 ? "Enviar Código" : "Confirmar e Vincular"}
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTAGRAM DM LINK POPUP MODAL */}
      {showIgPopup && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative font-sans animate-zoomIn">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Instagram className="w-5 h-5 text-pink-500" />
              <span className="text-[11px] font-black tracking-wide text-slate-500 uppercase">Vincular Conta Profissional</span>
            </div>

            <h3 className="text-base font-black text-slate-900">Vincular Instagram comercial</h3>
            <p className="text-xs text-slate-500 mt-1">
              Adicione o seu handle do Instagram comercial. A autenticação usará os escopos oficiais da API Graph.
            </p>

            <form onSubmit={handleIgPopupSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Seu @username Comercial
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    required
                    value={igHandle}
                    onChange={(e) => setIgHandle(e.target.value)}
                    placeholder="empresa.oficial"
                    className="block w-full pl-6 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIgPopup(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Autorizar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
