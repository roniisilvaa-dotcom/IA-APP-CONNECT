import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Trash,
  Edit2,
  Check,
  X,
  Sparkles,
  TrendingUp,
  Activity,
  Users,
  AlertTriangle,
  FileText,
  BadgePercent,
  Download,
  Coins,
  Receipt,
  RefreshCw,
  Crown,
  Layers,
  ChevronRight,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import StripeCheckoutModal from "./StripeCheckoutModal";

interface SubscriptionsViewProps {
  tenant: any;
  onUpdateTenant: (updatedTenant: any) => void;
}

// 10 Requested Add-ons with original specs
interface AddOn {
  id: string;
  name: string;
  price: number;
}

export default function SubscriptionsView({ tenant, onUpdateTenant }: SubscriptionsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'my-plan' | 'admin-panel'>('my-plan');
  
  // Modals / Flow states
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<'starter' | 'pro' | 'business' | 'enterprise'>('pro');
  const [showAddOnsManager, setShowAddOnsManager] = useState(false);
  const [showCardUpdater, setShowCardUpdater] = useState(false);
  const [showCancellationAlert, setShowCancellationAlert] = useState(false);

  // Card details mock state
  const [ccNumber, setCcNumber] = useState("4242 •••• •••• 4242");
  const [ccBrand, setCcBrand] = useState("Visa Signature");
  const [ccName, setCcName] = useState(tenant.name ? tenant.name.toUpperCase() : "MARIANA COSTA");

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // State initialization for Tenant defaults if not present
  useEffect(() => {
    let changed = false;
    const updated = { ...tenant };

    if (!updated.addOns) {
      updated.addOns = ["addon_crm_adv", "addon_commercial_ia"]; // seed default add-ons (CRM Avançado & Agente Comercial IA)
      changed = true;
    }
    if (!updated.billingHistory) {
      updated.billingHistory = [
        { id: "inv_1023", date: "06/06/2026", amount: 197.00, method: "Cartão (Stripe)", status: "Paga" },
        { id: "inv_1012", date: "06/05/2026", amount: 197.00, method: "Cartão (Stripe)", status: "Paga" },
        { id: "inv_0991", date: "06/04/2026", amount: 97.00, method: "PIX (Mercado Pago)", status: "Paga" }
      ];
      changed = true;
    }
    if (!updated.upgradeHistory) {
      updated.upgradeHistory = [
        { date: "06/06/2026", description: "Upgrade do plano START para PRO" },
        { date: "06/06/2026", description: "Contratação do complemento: CRM Avançado" },
        { date: "06/06/2026", description: "Contratação do complemento: Agente Comercial IA" },
        { date: "06/04/2026", description: "Ativação de conta - Plano START" }
      ];
      changed = true;
    }
    if (!updated.paymentMethod) {
      updated.paymentMethod = "Cartão de Crédito (•••• 4242)";
      changed = true;
    }
    if (!updated.gatewaySelected) {
      updated.gatewaySelected = "stripe";
      changed = true;
    }
    if (!updated.nextBilling) {
      updated.nextBilling = "06/08/2026";
      changed = true;
    }

    if (changed) {
      onUpdateTenant(updated);
    }
  }, [tenant]);

  // Pricing values helper
  const planCosts = {
    starter: 97,
    pro: 197,
    business: 397,
    enterprise: 0, // customized / sob consulta
  };

  const getPlanPriceString = (p: string) => {
    if (p === 'starter') return "R$ 97,00";
    if (p === 'pro') return "R$ 197,00";
    if (p === 'business') return "R$ 397,00";
    return "Sob Consulta";
  };

  // Full 10 Add-ons lists from prompt specifications
  const ALL_ADDONS: AddOn[] = [
    { id: "addon_ig_extra", name: "Instagram adicional", price: 49 },
    { id: "addon_crm_adv", name: "CRM Avançado", price: 39 },
    { id: "addon_commercial_ia", name: "Agente Comercial IA", price: 49 },
    { id: "addon_financial_ia", name: "Agente Financeiro IA", price: 39 },
    { id: "addon_marketing_ia", name: "Agente Marketing IA", price: 49 },
    { id: "addon_analytics_adv", name: "Analytics Avançado", price: 29 },
    { id: "addon_bio_premium", name: "Smart Bio Premium", price: 29 },
    { id: "addon_user_extra", name: "Usuário adicional", price: 19 },
    { id: "addon_storage_extra", name: "Armazenamento extra", price: 19 },
    { id: "addon_training_premium", name: "Treinamento Premium da IA", price: 59 }
  ];

  // Helper calculation for total Add-on costs
  const activeAddOnsList = ALL_ADDONS.filter(a => tenant.addOns?.includes(a.id));
  const addOnsTotalMonthly = activeAddOnsList.reduce((acc, curr) => acc + curr.price, 0);
  const corePlanCost = planCosts[tenant.plan as keyof typeof planCosts] || 0;
  const grandTotalMonthly = corePlanCost + addOnsTotalMonthly;

  // Toggle single add-on simulated action
  const handleToggleAddOn = (addonId: string) => {
    const updated = { ...tenant };
    const currentList = updated.addOns ? [...updated.addOns] : [];
    const index = currentList.indexOf(addonId);
    
    let actionDesc = "";
    const addonObj = ALL_ADDONS.find(a => a.id === addonId);

    if (index !== -1) {
      currentList.splice(index, 1);
      actionDesc = `Remoção do complemento: ${addonObj?.name}`;
    } else {
      currentList.push(addonId);
      actionDesc = `Contratação do complemento: ${addonObj?.name}`;
    }

    updated.addOns = currentList;
    updated.upgradeHistory = [
      { date: new Date().toLocaleDateString('pt-BR'), description: actionDesc },
      ...(updated.upgradeHistory || [])
    ];

    onUpdateTenant(updated);
    showToast(`Módulo "${addonObj?.name}" atualizado com sucesso!`);
  };

  // Upgrading/Downgrading Plan handler
  const triggerPlanChangeFlow = (targetPlan: 'starter' | 'pro' | 'business' | 'enterprise') => {
    if (targetPlan === tenant.plan) {
      showToast("Você já está utilizando este plano atualmente.");
      return;
    }
    setCheckoutPlan(targetPlan);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (updatedTenant: any) => {
    // Add custom logs for upgrade/downgrade
    const prevPlan = tenant.plan.toUpperCase();
    const nextPlan = updatedTenant.plan.toUpperCase();
    const actionDesc = `Alteração de Plano: ${prevPlan} → ${nextPlan}`;
    
    const loggedTenant = {
      ...updatedTenant,
      upgradeHistory: [
        { date: new Date().toLocaleDateString('pt-BR'), description: actionDesc },
        ...(updatedTenant.upgradeHistory || [])
      ],
      billingHistory: [
        {
          id: `inv_${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toLocaleDateString('pt-BR'),
          amount: planCosts[updatedTenant.plan as keyof typeof planCosts] || 0,
          method: updatedTenant.paymentMethod || "Cartão (Stripe)",
          status: "Paga"
        },
        ...(updatedTenant.billingHistory || [])
      ]
    };

    onUpdateTenant(loggedTenant);
    setShowCheckout(false);
    showToast(`Upgrade para o Plano ${nextPlan} efetuado com sucesso!`);
  };

  // Simulated billing operations
  const triggerCancellation = () => {
    const updated = { ...tenant };
    updated.status = "inactive";
    updated.upgradeHistory = [
      { date: new Date().toLocaleDateString('pt-BR'), description: "Assinatura CANCELADA pelo usuário" },
      ...(updated.upgradeHistory || [])
    ];
    onUpdateTenant(updated);
    setShowCancellationAlert(false);
    showToast("Assinatura cancelada com sucesso. Lamentamos sua saída.");
  };

  const triggerReactivation = () => {
    const updated = { ...tenant };
    updated.status = "active";
    updated.upgradeHistory = [
      { date: new Date().toLocaleDateString('pt-BR'), description: "Assinatura REATIVADA pelo usuário" },
      ...(updated.upgradeHistory || [])
    ];
    onUpdateTenant(updated);
    showToast("Excelente escolha! Sua assinatura foi reativada com sucesso.");
  };

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...tenant };
    updated.paymentMethod = `Cartão de Crédito (•••• ${ccNumber.slice(-4)})`;
    onUpdateTenant(updated);
    setShowCardUpdater(false);
    showToast("Dados do cartão de faturamento atualizados com sucesso!");
  };

  const triggerDownload2ndInvoice = (invId: string) => {
    showToast(`Iniciando download da segunda via do documento ${invId}...`);
    setTimeout(() => {
      showToast(`Documento ${invId} baixado em formato PDF com sucesso!`);
    }, 1200);
  };


  // ==========================================
  // ADMIN PANEL SIMULATION STATE
  // ==========================================
  const [adminPlans, setAdminPlans] = useState<any[]>([
    { id: "starter", name: "Plano START", price: 97, status: "Active" },
    { id: "pro", name: "Plano PRO", price: 197, status: "Active" },
    { id: "business", name: "Plano BUSINESS", price: 397, status: "Active" },
    { id: "enterprise", name: "Plano ENTERPRISE", price: 997, status: "Active" }
  ]);

  const [adminAddons, setAdminAddons] = useState<any[]>([
    ...ALL_ADDONS
  ]);

  const [adminCoupons, setAdminCoupons] = useState<any[]>([
    { code: "CONECT10", discount: 10, count: 48 },
    { code: "WELCOME50", discount: 50, count: 124 },
    { code: "CARO99", discount: 99, count: 3 }
  ]);

  // Form states for creating plan
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  // Form states for creating add-on
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");
  // Form states for creating coupon
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName || !newPlanPrice) return;
    const newPlan = {
      id: `custom_${Math.random().toString(36).substring(2, 6)}`,
      name: newPlanName,
      price: parseFloat(newPlanPrice),
      status: "Active"
    };
    setAdminPlans([...adminPlans, newPlan]);
    setNewPlanName("");
    setNewPlanPrice("");
    showToast(`Plano Administrativo "${newPlanName}" criado com sucesso!`);
  };

  const handleCreateAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonName || !newAddonPrice) return;
    const newAdd = {
      id: `addon_custom_${Math.random().toString(36).substring(2, 6)}`,
      name: newAddonName,
      price: parseFloat(newAddonPrice)
    };
    setAdminAddons([...adminAddons, newAdd]);
    setNewAddonName("");
    setNewAddonPrice("");
    showToast(`Complemento "${newAddonName}" criado com sucesso!`);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;
    const newCoup = {
      code: newCouponCode.trim().toUpperCase(),
      discount: parseInt(newCouponDiscount),
      count: 0
    };
    setAdminCoupons([...adminCoupons, newCoup]);
    setNewCouponCode("");
    setNewCouponDiscount("");
    showToast(`Cupom de Desconto "${newCoup.code}" criado com sucesso!`);
  };

  const handleDeletePlan = (id: string) => {
    setAdminPlans(adminPlans.filter(p => p.id !== id));
    showToast("Plano removido das opções do painel.");
  };

  const handleDeleteAddon = (id: string) => {
    setAdminAddons(adminAddons.filter(a => a.id !== id));
    showToast("Complemento removido das opções do painel.");
  };

  const handleDeleteCoupon = (code: string) => {
    setAdminCoupons(adminCoupons.filter(c => c.code !== code));
    showToast("Cupom removido das opções do painel.");
  };


  return (
    <div className="space-y-6 flex-1 animate-fadeIn">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-luxury-blue border border-luxury-gold/50 text-white font-bold text-xs px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2 animate-slideIn">
          <Sparkles className="w-4.5 h-4.5 text-luxury-gold animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title block */}
      <div className="border-b border-slate-100 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-luxury-gold" />
            Planos, Assinaturas e Complementos
          </h2>
          <p className="text-xs text-slate-500">
            Monte a arquitetura ideal de crescimento para sua empresa, ative complementos ou gerencie métricas de receita.
          </p>
        </div>

        {/* Outer Tab switcher: Client vs Admin (Seguindo UX de Stripe) */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-stretch md:self-auto">
          <button
            onClick={() => setActiveSubTab('my-plan')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'my-plan'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Minha Assinatura
          </button>
          <button
            onClick={() => setActiveSubTab('admin-panel')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'admin-panel'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-luxury-gold" />
            Painel Administrativo
          </button>
        </div>
      </div>

      {/* ==========================================================
          CLIENT WORKSPACE: MY PLAN & ADDONS MANAGEMENT
          ========================================================== */}
      {activeSubTab === 'my-plan' && (
        <div className="space-y-8">
          
          {/* Upgrade Alert Banner (Incentivo do Upgrade de 95%) */}
          <div className="bg-gradient-to-r from-luxury-blue-dark via-luxury-blue to-luxury-blue-dark border border-luxury-gold/30 rounded-2xl p-4.5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-luxury-gold/15 text-luxury-gold mt-0.5 animate-pulse">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div className="text-left space-y-0.5">
                <span className="text-[10px] text-luxury-gold-light font-extrabold uppercase tracking-widest block">Alerta de Operação</span>
                <span className="text-xs font-black block text-slate-50">Você está utilizando 95% do limite de inteligência do seu plano.</span>
                <p className="text-[10px] text-slate-400">Evite gargalos no atendimento e libere canais adicionais efetuando um upgrade para continuar crescendo.</p>
              </div>
            </div>
            <button
              onClick={() => triggerPlanChangeFlow('business')}
              className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-black font-black uppercase text-[10px] tracking-wider px-4 py-2.5 rounded-lg shrink-0 transition-all cursor-pointer shadow-sm"
            >
              Liberar Recursos Now
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CARD 1: Plano Atual e Status */}
            <div className="lg:col-span-1 bg-white text-slate-800 rounded-3xl p-6 border border-slate-200 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-luxury-gold/5 rounded-full blur-2xl"></div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] text-amber-600 font-bold uppercase tracking-widest block">Assinatura Ativa</span>
                    <h3 className="text-2xl font-black capitalize mt-1 tracking-tight text-slate-900">{tenant.plan === 'starter' ? 'START' : tenant.plan === 'pro' ? 'PRO' : tenant.plan === 'business' ? 'BUSINESS' : 'ENTERPRISE'}</h3>
                  </div>
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    tenant.status === 'active'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {tenant.status === 'active' ? '● Ativo' : '● Suspenso'}
                  </span>
                </div>

                <div className="space-y-3.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valor Mensal Base:</span>
                    <span className="font-mono text-slate-950 font-bold">{getPlanPriceString(tenant.plan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total de Adicionais:</span>
                    <span className="font-mono text-amber-600 font-bold">R$ {addOnsTotalMonthly.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-100 my-2"></div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 font-bold">Cobrança Total:</span>
                    <span className="text-base font-black text-slate-950 font-mono">R$ {grandTotalMonthly.toFixed(2)} /mês</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[10px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span>Próxima Fatura:</span>
                    <span className="text-slate-800 font-semibold font-mono">{tenant.nextBilling}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gateway Ativo:</span>
                    <span className="text-slate-800 font-semibold capitalize font-mono">{tenant.gatewaySelected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Forma:</span>
                    <span className="text-slate-800 font-semibold font-mono truncate max-w-[120px]">{tenant.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Lower Buttons */}
              <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
                {tenant.status === 'active' ? (
                  <button
                    onClick={() => setShowCancellationAlert(true)}
                    className="w-full bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar Assinatura
                  </button>
                ) : (
                  <button
                    onClick={triggerReactivation}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Reativar Assinatura Agora
                  </button>
                )}
              </div>

            </div>

            {/* CARD 2: Módulos Contratados Atualmente */}
            <div className="lg:col-span-2 border border-slate-200 rounded-3xl p-6 bg-white shadow-sm flex flex-col justify-between">
              
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Módulos & Complementos Ativos</h3>
                    <p className="text-[11px] text-slate-400">Gerencie a contratação avulsa de novos recursos adicionais.</p>
                  </div>
                  <button
                    onClick={() => setShowAddOnsManager(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Gerenciar
                  </button>
                </div>

                {/* List of currently active Add-ons */}
                {activeAddOnsList.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <p className="text-xs font-bold">Nenhum complemento contratado.</p>
                    <p className="text-[10px]">Clique em "Gerenciar" para turbinar seus canais e IA.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {activeAddOnsList.map((add) => (
                      <div key={add.id} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{add.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">R$ {add.price.toFixed(2)}/mês</span>
                        </div>
                        <button
                          onClick={() => handleToggleAddOn(add.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Remover complemento"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Simulated Limit meters */}
                <div className="border-t border-slate-100 pt-4 space-y-3.5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Metas e Capacidade Operacional</span>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                      <span>Canais Conectados:</span>
                      <span>{tenant.plan === 'starter' ? '1 / 1 canal' : tenant.plan === 'pro' ? '2 / 2 canais' : 'Ilimitados'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 rounded-full" style={{ width: tenant.plan === 'starter' ? '100%' : '100%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                      <span>Usuários no Painel:</span>
                      <span>{tenant.plan === 'starter' ? '1 / 1' : tenant.plan === 'pro' ? '3 / 3' : 'Ilimitados'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Primary Actions Grid */}
              <div className="grid grid-cols-2 gap-3.5 mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowAddOnsManager(true)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center"
                >
                  Contratar Módulos
                </button>
                <button
                  onClick={() => setShowCardUpdater(true)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center"
                >
                  Atualizar Cartão
                </button>
              </div>

            </div>

          </div>

          {/* LOWER SECTION GRID: INVOICES & UPGRADE HISTORY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Billing Invoices history */}
            <div className="border border-slate-200 rounded-3xl p-6 bg-white shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <Receipt className="w-4.5 h-4.5 text-slate-500" />
                Histórico de Cobranças
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Veja e faça o download da segunda via das faturas geradas pelos provedores.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 font-bold">Identificação</th>
                      <th className="py-2.5 font-bold">Vencimento</th>
                      <th className="py-2.5 font-bold">Valor Pago</th>
                      <th className="py-2.5 font-bold">Status</th>
                      <th className="py-2.5 text-right font-bold">Documento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenant.billingHistory?.map((inv: any) => (
                      <tr key={inv.id} className="text-slate-700 hover:bg-slate-50/50">
                        <td className="py-3 font-bold font-mono">{inv.id}</td>
                        <td className="py-3 text-slate-500">{inv.date}</td>
                        <td className="py-3 font-bold text-slate-900 font-mono">R$ {inv.amount.toFixed(2)}</td>
                        <td className="py-3">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md font-bold text-[9px]">
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => triggerDownload2ndInvoice(inv.id)}
                            className="text-slate-500 hover:text-slate-900 transition-colors p-1"
                            title="Download 2ª Via PDF"
                          >
                            <Download className="w-4.5 h-4.5 inline-block" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upgrades & Downgrades Log list */}
            <div className="border border-slate-200 rounded-3xl p-6 bg-white shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <Clock className="w-4.5 h-4.5 text-slate-500" />
                Histórico de Upgrades e Ativações
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Auditoria e controle operacional de alterações de planos e faturamentos da empresa.</p>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                {tenant.upgradeHistory?.map((log: any, index: number) => (
                  <div key={index} className="flex gap-3 text-xs leading-relaxed items-start">
                    <span className="font-mono text-[10px] text-slate-400 mt-0.5 shrink-0 bg-slate-50 px-1.5 py-0.5 rounded">{log.date}</span>
                    <div className="bg-slate-50/60 p-2 rounded-xl flex-1 border border-slate-100">
                      <p className="text-slate-700 font-medium">{log.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* TELA DE COMPARAÇÃO / ALTERAÇÃO DE PLANOS DISPONÍVEIS */}
          <div className="border border-slate-200 rounded-3xl p-6 bg-white shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Mudar o Escopo do seu Plano</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Ajuste os canais de atendimento e limites de inteligência para comportar o crescimento operacional.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* START CARD */}
              <div className={`p-4 border rounded-2xl flex flex-col justify-between text-left ${tenant.plan === 'starter' ? 'border-luxury-gold bg-luxury-gold/5' : 'border-slate-100 bg-slate-50/50'}`}>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Plano Start</span>
                  <span className="text-lg font-black block text-slate-900 mt-1">R$ 97,00<span className="text-xs text-slate-400">/mês</span></span>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Ideal para começar no WhatsApp ou Instagram com 1 usuário único e IA básica.</p>
                </div>
                <button
                  onClick={() => triggerPlanChangeFlow('starter')}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg cursor-pointer text-center"
                >
                  {tenant.plan === 'starter' ? 'Atual' : 'Mudar para Start'}
                </button>
              </div>

              {/* PRO CARD */}
              <div className={`p-4 border rounded-2xl flex flex-col justify-between text-left ${tenant.plan === 'pro' ? 'border-luxury-gold bg-luxury-gold/5 animate-pulse' : 'border-slate-100 bg-slate-50/50'}`}>
                <div>
                  <span className="text-[9px] font-bold text-luxury-gold uppercase block">Plano Pro (Popular)</span>
                  <span className="text-lg font-black block text-slate-900 mt-1">R$ 197,00<span className="text-xs text-slate-400">/mês</span></span>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Comporta WhatsApp + Instagram, 3 usuários, CRM, funis completos e IA avançada.</p>
                </div>
                <button
                  onClick={() => triggerPlanChangeFlow('pro')}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg cursor-pointer text-center"
                >
                  {tenant.plan === 'pro' ? 'Atual' : 'Mudar para Pro'}
                </button>
              </div>

              {/* BUSINESS CARD */}
              <div className={`p-4 border rounded-2xl flex flex-col justify-between text-left ${tenant.plan === 'business' ? 'border-luxury-gold bg-luxury-gold/5' : 'border-slate-100 bg-slate-50/50'}`}>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Plano Business</span>
                  <span className="text-lg font-black block text-slate-900 mt-1">R$ 397,00<span className="text-xs text-slate-400">/mês</span></span>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Acesso à API, webhooks, múltiplos agentes autônomos, integrações e usuários ilimitados.</p>
                </div>
                <button
                  onClick={() => triggerPlanChangeFlow('business')}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg cursor-pointer text-center"
                >
                  {tenant.plan === 'business' ? 'Atual' : 'Mudar para Business'}
                </button>
              </div>

              {/* ENTERPRISE CARD */}
              <div className={`p-4 border rounded-2xl flex flex-col justify-between text-left ${tenant.plan === 'enterprise' ? 'border-luxury-gold bg-luxury-gold/5' : 'border-slate-100 bg-slate-50/50'}`}>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Plano Enterprise</span>
                  <span className="text-lg font-black block text-slate-900 mt-1">Customizado</span>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Infraestrutura em nuvem dedicada, SLA garantido, gerente de contas dedicado e API customizada.</p>
                </div>
                <button
                  onClick={() => triggerPlanChangeFlow('enterprise')}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg cursor-pointer text-center"
                >
                  {tenant.plan === 'enterprise' ? 'Atual' : 'Falar com Consultoria'}
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ==========================================================
          ADMINISTRATIVE WORKSPACE: METRICS AND PLANS MANAGEMENT
          ========================================================== */}
      {activeSubTab === 'admin-panel' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Live metrics indicator cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
              <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">MRR Ativo</div>
              <h3 className="text-xl font-black text-slate-950 mt-1 font-mono">R$ 48.500</h3>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center mt-0.5"><ArrowUpRight className="w-3 h-3" /> +14.2%</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
              <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">ARR Projetado</div>
              <h3 className="text-xl font-black text-slate-950 mt-1 font-mono">R$ 582.000</h3>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center mt-0.5"><ArrowUpRight className="w-3 h-3" /> +12.0%</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
              <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Taxa de Churn</div>
              <h3 className="text-xl font-black text-slate-950 mt-1 font-mono">1.2%</h3>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center mt-0.5"><ArrowDownRight className="w-3 h-3" /> -0.4%</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
              <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Cancelamentos</div>
              <h3 className="text-xl font-black text-red-600 mt-1 font-mono">4</h3>
              <span className="text-[9px] text-slate-500 mt-0.5 block">Últimos 30 dias</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
              <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Upgrades</div>
              <h3 className="text-xl font-black text-emerald-600 mt-1 font-mono">18</h3>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center mt-0.5"><ArrowUpRight className="w-3 h-3" /> +8.2%</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
              <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Downgrades</div>
              <h3 className="text-xl font-black text-yellow-600 mt-1 font-mono">3</h3>
              <span className="text-[9px] text-slate-400 mt-0.5 block">Estável</span>
            </div>

          </div>

          {/* Dynamic management grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form list and creation (7 columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Plans setup admin management */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Gerenciador de Planos</span>
                  <span className="text-[9px] text-slate-400 font-mono">4 Planos Padrão</span>
                </div>

                {/* Create/Edit plan inline form */}
                <form onSubmit={handleCreatePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-100 pb-4">
                  <input
                    type="text"
                    required
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="Nome do Novo Plano"
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    required
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(e.target.value)}
                    placeholder="Valor Mensal (R$)"
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Criar Plano
                  </button>
                </form>

                {/* List of plans */}
                <div className="space-y-2">
                  {adminPlans.map((pl) => (
                    <div key={pl.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{pl.name}</span>
                        <span className="ml-2 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono">{pl.status}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-slate-900">R$ {pl.price.toFixed(2)}/mês</span>
                        {pl.id !== 'starter' && pl.id !== 'pro' && pl.id !== 'business' && pl.id !== 'enterprise' ? (
                          <button
                            onClick={() => handleDeletePlan(pl.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider font-mono">Estático</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons setup admin management */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Gerenciador de Complementos</span>
                  <span className="text-[9px] text-slate-400 font-mono">10 Complementos Ativos</span>
                </div>

                {/* Create addon form */}
                <form onSubmit={handleCreateAddon} className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-100 pb-4">
                  <input
                    type="text"
                    required
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    placeholder="Nome do Complemento"
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    required
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(e.target.value)}
                    placeholder="Valor Mensal (R$)"
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Novo Complemento
                  </button>
                </form>

                {/* List of custom and standard add-ons */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                  {adminAddons.map((ad) => (
                    <div key={ad.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100/80 text-xs">
                      <span className="font-bold text-slate-800">{ad.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-slate-900">R$ {ad.price.toFixed(2)}/mês</span>
                        {ad.id.startsWith('addon_custom') ? (
                          <button
                            onClick={() => handleDeleteAddon(ad.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 animate-fadeIn"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[8px] text-slate-400 uppercase font-mono font-bold">Standard</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Coupons management and Active subscribers (5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Coupons management */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <BadgePercent className="w-4 h-4 text-luxury-gold" />
                    Cupons de Desconto
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Simulado</span>
                </div>

                {/* Create coupon form */}
                <form onSubmit={handleCreateCoupon} className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      placeholder="CUPOM_CODE"
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs uppercase font-mono"
                    />
                    <input
                      type="number"
                      required
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      placeholder="Porcentagem %"
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Criar Novo Cupom
                  </button>
                </form>

                {/* List of active Coupons */}
                <div className="space-y-1.5">
                  {adminCoupons.map((c) => (
                    <div key={c.code} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 font-mono">{c.code}</span>
                        <span className="ml-2 bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded text-[8px] font-bold font-mono">-{c.discount}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400">{c.count} usos</span>
                        <button
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated active subscriptions summary list */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Empresas Ativas Recentes</span>
                  <span className="text-[9px] text-slate-400 font-mono">Total: 124</span>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                  {[
                    { company: "Camargo Negócios Imob.", plan: "pro", mrr: 197, joined: "06/06/2026", email: "rodrigo@camargo.com" },
                    { company: "Clínica Bella Pelle", plan: "business", mrr: 397, joined: "05/06/2026", email: "andrea@bellapelle.com" },
                    { company: "Alpha Gym Studios", plan: "starter", mrr: 97, joined: "03/06/2026", email: "thiago@alphagym.com" },
                    { company: "EcoModas Brasil S.A.", plan: "enterprise", mrr: 997, joined: "28/05/2026", email: "suporte@ecomodas.com" }
                  ].map((sub, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800 text-[11px] truncate max-w-[150px]">{sub.company}</span>
                        <span className="text-[8px] font-mono font-black uppercase tracking-wider bg-slate-900 text-white px-1.5 py-0.5 rounded">
                          {sub.plan}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{sub.email}</span>
                        <span className="font-mono text-slate-800">R$ {sub.mrr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}


      {/* ==========================================================
          MODALS AREA
          ========================================================== */}

      {/* STRIPE CHECKOUT MODAL */}
      {showCheckout && (
        <StripeCheckoutModal
          tenant={tenant}
          plan={checkoutPlan}
          onClose={() => setShowCheckout(false)}
          onPaymentSuccess={handleCheckoutSuccess}
        />
      )}

      {/* DYNAMIC COMPLEMENTOS (ADDONS) MANAGER MODAL */}
      {showAddOnsManager && (
        <div className="fixed inset-0 bg-luxury-blue-dark/85 backdrop-blur-sm flex items-center justify-center z-[150] px-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-zoomIn">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Módulos e Complementos CA.RO Connect</h3>
                <p className="text-[10px] text-luxury-gold font-bold">Selecione apenas as peças que sua operação comercial necessita.</p>
              </div>
              <button
                onClick={() => setShowAddOnsManager(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              <p className="text-xs text-slate-500">Cada complemento contratado de forma avulsa será adicionado à sua cobrança mensal atual de R$ {grandTotalMonthly.toFixed(2)}. Cancele a qualquer momento.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_ADDONS.map((add) => {
                  const isActive = tenant.addOns?.includes(add.id);
                  return (
                    <div
                      key={add.id}
                      onClick={() => handleToggleAddOn(add.id)}
                      className={`p-3.5 border rounded-2xl text-left flex justify-between items-center cursor-pointer transition-all ${
                        isActive
                          ? 'border-luxury-gold bg-luxury-gold/5 ring-1 ring-luxury-gold/20'
                          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-slate-900 block">{add.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">R$ {add.price},00 /mês</span>
                      </div>
                      
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isActive
                          ? 'bg-luxury-gold border-luxury-gold text-luxury-black'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-left">
                <span className="text-slate-400 text-[10px] block">Novo Total do Faturamento:</span>
                <span className="font-bold text-slate-900 font-mono">R$ {grandTotalMonthly.toFixed(2)} /mês</span>
              </div>
              <button
                onClick={() => setShowAddOnsManager(false)}
                className="bg-slate-900 hover:bg-black text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Salvar Configuração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARD DETAIL UPDATER MODAL */}
      {showCardUpdater && (
        <div className="fixed inset-0 bg-luxury-blue-dark/85 backdrop-blur-sm flex items-center justify-center z-[150] px-4 animate-fadeIn">
          <form onSubmit={handleUpdateCard} className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-zoomIn">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-luxury-gold" />
                Atualizar Método de Pagamento
              </span>
              <button
                type="button"
                onClick={() => setShowCardUpdater(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Número do Cartão de Crédito
                </label>
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  value={ccNumber}
                  onChange={(e) => setCcNumber(e.target.value)}
                  className="block w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nome impresso no Cartão
                </label>
                <input
                  type="text"
                  required
                  placeholder="MARIANA SANTOS"
                  value={ccName}
                  onChange={(e) => setCcName(e.target.value.toUpperCase())}
                  className="block w-full p-2.5 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Expiração (MM/AA)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12/29"
                    className="block w-full p-2.5 border border-slate-200 rounded-xl font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    className="block w-full p-2.5 border border-slate-200 rounded-xl font-mono text-center"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowCardUpdater(false)}
                className="px-3 py-2 font-bold text-slate-500 hover:text-slate-800"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-black text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Salvar Cartão
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CANCELLATION EXPLANATION ALERT MODAL */}
      {showCancellationAlert && (
        <div className="fixed inset-0 bg-luxury-blue-dark/85 backdrop-blur-sm flex items-center justify-center z-[150] px-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-zoomIn p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">Deseja realmente suspender sua operação?</h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                O cancelamento suspenderá o processamento autônomo da assistente Carol, e seus canais WhatsApp e Instagram serão desconectados do sistema na próxima data de vencimento.
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setShowCancellationAlert(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Manter Assinatura
              </button>
              <button
                onClick={triggerCancellation}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-red-100"
              >
                Sim, Cancelar Assinatura
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
