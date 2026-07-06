import React, { useState } from "react";
import {
  CreditCard,
  Shield,
  Lock,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  QrCode,
  FileText,
  BadgePercent,
  Check,
  ChevronRight,
  Receipt
} from "lucide-react";

interface StripeCheckoutModalProps {
  tenant: any;
  plan: 'starter' | 'pro' | 'business' | 'enterprise';
  onClose: () => void;
  onPaymentSuccess: (updatedTenant: any) => void;
}

export default function StripeCheckoutModal({ tenant, plan, onClose, onPaymentSuccess }: StripeCheckoutModalProps) {
  const [gateway, setGateway] = useState<'stripe' | 'mercadopago' | 'asaas' | 'pagarme'>('stripe');
  const [payMethod, setPayMethod] = useState<'card' | 'pix' | 'boleto'>('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Card states
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardName, setCardName] = useState(tenant.owner_email ? tenant.owner_email.split('@')[0].toUpperCase() : "MARIANA SANTOS");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const planDetails = {
    starter: { name: "Plano START", price: 97, desc: "Escolha de 1 canal oficial + 1 usuário + IA Básica" },
    pro: { name: "Plano PRO", price: 197, desc: "WhatsApp + Instagram + 3 usuários + CRM + IA Avançada" },
    business: { name: "Plano BUSINESS", price: 397, desc: "Usuários ilimitados + Agentes IA múltiplos + API + Prioridade" },
    enterprise: { name: "Plano ENTERPRISE", price: 997, desc: "Infraestrutura dedicada + SLA de 99.9% + Suporte dedicado" },
  };

  const selectedPlan = planDetails[plan] || planDetails.pro;
  const originalPrice = selectedPlan.price;
  const currentPrice = Math.max(0, originalPrice - (originalPrice * appliedDiscount) / 100);

  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    const code = couponCode.trim().toUpperCase();
    if (code === "CONECT10") {
      setAppliedDiscount(10);
      setCouponSuccess("Cupom CONECT10 aplicado! 10% de desconto recorrente.");
    } else if (code === "WELCOME50") {
      setAppliedDiscount(50);
      setCouponSuccess("Cupom WELCOME50 aplicado! 50% de desconto recorrente.");
    } else if (code === "CARO99") {
      setAppliedDiscount(99);
      setCouponSuccess("Cupom CARO99 aplicado! 99% de desconto de parceria.");
    } else {
      setCouponError("Cupom inválido ou expirado.");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, attempt to create a real checkout session if the gateway is Stripe
      if (gateway === "stripe") {
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId: tenant.id,
            plan,
          }),
        });

        if (checkoutRes.ok) {
          const checkoutData = await checkoutRes.json();
          if (checkoutData.realStripe && checkoutData.checkoutUrl) {
            console.log("[Stripe] Redirecting to real checkout page:", checkoutData.checkoutUrl);
            window.location.href = checkoutData.checkoutUrl;
            return; // Exit as the page redirects
          }
        }
      }

      // Simulation Fallback
      const res = await fetch("/api/stripe/activate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tenantId: tenant.id, 
          plan,
          paymentMethod: payMethod,
          gateway: gateway,
          coupon: appliedDiscount > 0 ? couponCode : undefined,
          pricePaid: currentPrice
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao processar pagamento");
      }

      // Add details about billing method and active coupons to tenant locally if needed
      const updatedTenant = {
        ...data.tenant,
        paymentMethod: payMethod === 'card' ? 'Cartão de Crédito (**** 4242)' : payMethod === 'pix' ? 'PIX Ativo' : 'Boleto Bancário',
        gatewaySelected: gateway,
        pricePaid: currentPrice,
        couponApplied: appliedDiscount > 0 ? couponCode : null,
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      };

      setSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(updatedTenant);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Erro ao autorizar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="stripe-checkout-modal" className="fixed inset-0 bg-luxury-blue-dark/85 backdrop-blur-md flex items-center justify-center z-[150] px-4 font-sans animate-fadeIn">
      <div className="bg-luxury-blue border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row border-luxury-gold/20 animate-zoomIn">
        
        {/* Left column: order summary */}
        <div className="bg-luxury-blue-dark/60 p-6 md:w-5/12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5">
          <div className="space-y-6">
            <div>
              <span className="text-[9px] bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold px-2.5 py-1 rounded-full font-bold uppercase tracking-widest block w-fit">
                Carrinho Seguro
              </span>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-luxury-gold rounded-lg flex items-center justify-center text-luxury-black font-black text-sm">
                  CA
                </div>
                <span className="font-extrabold text-xs text-white uppercase tracking-wider">CA.RO CONNECT</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">PRODUTO SELECIONADO</span>
              <h3 className="text-base font-black text-white">{selectedPlan.name}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{selectedPlan.desc}</p>
            </div>

            {/* Trial period notifier */}
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-start gap-2 text-[10px] text-slate-300">
              <Sparkles className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-white block">Período de Teste Ativado!</span>
                Garantia de 7 dias de avaliação gratuita sem compromisso de débito imediato.
              </div>
            </div>

            {/* Pricing math */}
            <div className="space-y-2 pt-4 border-t border-white/5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Preço Base:</span>
                <span className="font-mono text-white">R$ {originalPrice.toFixed(2)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Desconto ({appliedDiscount}%):</span>
                  <span className="font-mono">- R$ {((originalPrice * appliedDiscount) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-white/5 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-white">Valor Recorrente:</span>
                <div className="text-right">
                  <span className="text-xl font-black text-luxury-gold font-mono">R$ {currentPrice.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-500 block">/mês</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-0 pt-4 border-t border-white/5 text-[9px] text-slate-500 leading-relaxed space-y-1">
            <span className="flex items-center gap-1 font-bold text-slate-400">
              <Shield className="w-3 h-3 text-luxury-gold shrink-0" />
              Tecnologia 100% Criptografada
            </span>
            <span>Simulação homologada e integrada às APIs de teste dos provedores selecionados. Nenhuma cobrança monetária real será efetuada nesta demonstração.</span>
          </div>
        </div>

        {/* Right column: checkout gateway & form */}
        <div className="p-6 md:w-7/12 flex flex-col justify-between bg-luxury-blue/95">
          {success ? (
            <div className="text-center py-12 space-y-4 flex flex-col items-center my-auto">
              <div className="w-14 h-14 bg-luxury-gold/10 border border-luxury-gold text-luxury-gold rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-black text-white uppercase tracking-wider">Assinatura Ativada!</h4>
                <p className="text-xs text-slate-400 mt-1">Webhook de pagamento processado pelo gateway do <strong>{gateway.toUpperCase()}</strong>.</p>
              </div>
              <p className="text-[10px] text-luxury-black font-extrabold bg-luxury-gold px-4 py-1.5 rounded-full uppercase tracking-wider">
                Sincronizando Sistema...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Provedor / Gateway Selector */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Provedor de Pagamento
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'stripe', name: 'Stripe' },
                    { id: 'mercadopago', name: 'M. Pago' },
                    { id: 'asaas', name: 'Asaas' },
                    { id: 'pagarme', name: 'Pagar.me' }
                  ].map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setGateway(gw.id as any)}
                      className={`py-1.5 px-1 rounded-lg text-[9px] font-extrabold uppercase tracking-tight text-center transition-all cursor-pointer ${
                        gateway === gw.id
                          ? 'bg-luxury-gold text-luxury-black font-black'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {gw.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Forma de Cobrança
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('card')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                      payMethod === 'card'
                        ? 'border-luxury-gold text-white bg-luxury-blue-light/40'
                        : 'border-white/5 text-slate-400 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Cartão
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('pix')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                      payMethod === 'pix'
                        ? 'border-luxury-gold text-white bg-luxury-blue-light/40'
                        : 'border-white/5 text-slate-400 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    PIX
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('boleto')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                      payMethod === 'boleto'
                        ? 'border-luxury-gold text-white bg-luxury-blue-light/40'
                        : 'border-white/5 text-slate-400 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Boleto
                  </button>
                </div>
              </div>

              {/* Coupon code application area */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 space-y-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Possui Cupom de Desconto?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ex: WELCOME50 ou CONECT10"
                    className="flex-1 px-3 py-2 bg-luxury-black/60 border border-white/10 rounded-xl text-xs uppercase text-white font-mono placeholder-slate-500 focus:outline-none focus:border-luxury-gold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs px-4 rounded-xl transition-all cursor-pointer border border-white/10 flex items-center gap-1"
                  >
                    <BadgePercent className="w-3.5 h-3.5 text-luxury-gold" />
                    Aplicar
                  </button>
                </div>
                {couponError && <p className="text-[9px] text-red-400 font-bold">{couponError}</p>}
                {couponSuccess && <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> {couponSuccess}</p>}
              </div>

              {/* MAIN CONTENT FORM CHOSEN */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                
                {payMethod === 'card' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Número do Cartão de Crédito
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="block w-full p-2.5 bg-luxury-black/40 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Nome impresso no Cartão
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        className="block w-full p-2.5 bg-luxury-black/40 border border-white/10 rounded-xl text-xs text-white uppercase font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Expiração (MM/AA)
                        </label>
                        <input
                          type="text"
                          required
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="block w-full p-2.5 bg-luxury-black/40 border border-white/10 rounded-xl text-xs text-center text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Código CVC
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={3}
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          className="block w-full p-2.5 bg-luxury-black/40 border border-white/10 rounded-xl text-xs text-center text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {payMethod === 'pix' && (
                  <div className="bg-luxury-black/40 border border-white/10 rounded-2xl p-4 text-center space-y-3 animate-fadeIn">
                    <div className="w-24 h-24 bg-white p-1 rounded-xl mx-auto flex items-center justify-center">
                      {/* Fake pixel QR Code visual using SVG */}
                      <svg className="w-20 h-20 text-slate-900" viewBox="0 0 100 100">
                        <rect x="5" y="5" width="25" height="25" fill="currentColor"/>
                        <rect x="10" y="10" width="15" height="15" fill="white"/>
                        <rect x="70" y="5" width="25" height="25" fill="currentColor"/>
                        <rect x="75" y="10" width="15" height="15" fill="white"/>
                        <rect x="5" y="70" width="25" height="25" fill="currentColor"/>
                        <rect x="10" y="75" width="15" height="15" fill="white"/>
                        {/* noise */}
                        <rect x="40" y="20" width="10" height="15" fill="currentColor"/>
                        <rect x="50" y="40" width="15" height="10" fill="currentColor"/>
                        <rect x="30" y="60" width="10" height="20" fill="currentColor"/>
                        <rect x="70" y="65" width="15" height="15" fill="currentColor"/>
                      </svg>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">PIX DINÂMICO GERADO VIA {gateway.toUpperCase()}</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed px-4">
                      Seu PIX expira em 15 minutos. Após a autorização simulada, o sistema atualizará seu plano de forma imediata via Webhook.
                    </p>
                    <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-[9px] font-mono select-all truncate text-slate-300">
                      00020101021226830014br.gov.bcb.pix2561caroconnect.pix.test.gateway
                    </div>
                  </div>
                )}

                {payMethod === 'boleto' && (
                  <div className="bg-luxury-black/40 border border-white/10 rounded-2xl p-4 text-center space-y-3 animate-fadeIn">
                    <div className="flex flex-col gap-1.5 items-center">
                      <div className="flex gap-0.5 justify-center py-2 bg-white px-4 rounded">
                        <span className="w-1.5 h-8 bg-slate-900 block"></span>
                        <span className="w-0.5 h-8 bg-slate-900 block"></span>
                        <span className="w-1 h-8 bg-slate-900 block"></span>
                        <span className="w-0.5 h-8 bg-slate-900 block"></span>
                        <span className="w-2 h-8 bg-slate-900 block"></span>
                        <span className="w-0.5 h-8 bg-slate-900 block"></span>
                        <span className="w-1 h-8 bg-slate-900 block"></span>
                        <span className="w-1.5 h-8 bg-slate-900 block"></span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">34191.79001 01043.513184 91020.150008 7 982300000{originalPrice}00</span>
                    </div>
                    <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-wider block">BOLETO REGISTRADO</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed px-4">
                      Emissão instantânea em formato PDF de cobrança automática recorrente. O prazo de compensação do boleto simulado é de 1 minuto na nossa Sandbox.
                    </p>
                  </div>
                )}

                {/* Submit Action Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-black text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-luxury-gold/5"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Confirmar R$ {currentPrice.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
