import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import OnboardingFlow from "./components/OnboardingFlow";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [view, setView] = useState<'landing' | 'auth'>('landing');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'business' | 'enterprise'>('pro');
  const [initializing, setInitializing] = useState(true);
  const [theme, setTheme] = useState<'sand-gold'>('sand-gold');

  // Sync theme to localStorage and body element
  useEffect(() => {
    document.body.className = "theme-sand-gold";
    localStorage.setItem("caro_theme", "sand-gold");
  }, []);

  // Restore session on boot
  useEffect(() => {
    const savedUser = localStorage.getItem("caro_user");
    const savedTenant = localStorage.getItem("caro_tenant");
    if (savedUser && savedTenant) {
      setUser(JSON.parse(savedUser));
      setTenant(JSON.parse(savedTenant));
    }
    setInitializing(false);
  }, []);

  // Save session helper
  const handleAuthSuccess = (loggedUser: any, loggedTenant: any) => {
    setUser(loggedUser);
    setTenant(loggedTenant);
    localStorage.setItem("caro_user", JSON.stringify(loggedUser));
    localStorage.setItem("caro_tenant", JSON.stringify(loggedTenant));
  };

  const handleLogout = () => {
    setUser(null);
    setTenant(null);
    setView('landing');
    localStorage.removeItem("caro_user");
    localStorage.removeItem("caro_tenant");
  };

  const handleUpdateTenant = (updatedTenant: any) => {
    setTenant(updatedTenant);
    localStorage.setItem("caro_tenant", JSON.stringify(updatedTenant));
  };

  const renderCurrentView = () => {
    if (initializing) {
      return (
        <motion.div
          key="initializing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen bg-slate-50 flex items-center justify-center font-sans"
        >
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto animate-bounce shadow-md">
              CA
            </div>
            <p className="text-xs text-slate-500 font-bold">Carregando CA.RO Connect...</p>
          </div>
        </motion.div>
      );
    }

    // If logged in, check if onboarding has been completed
    if (user && tenant) {
      const isOnboardingCompleted = tenant.businessSegment && tenant.businessDescription;

      if (!isOnboardingCompleted) {
        return (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="min-h-screen bg-slate-50"
          >
            <OnboardingFlow
              tenant={tenant}
              user={user}
              onOnboardingComplete={handleUpdateTenant}
            />
          </motion.div>
        );
      }

      return (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="min-h-screen bg-brand-bg transition-colors duration-300"
        >
          <Dashboard
            user={user}
            tenant={tenant}
            onLogout={handleLogout}
            onUpdateTenant={handleUpdateTenant}
            currentTheme={theme}
            onChangeTheme={setTheme}
          />
        </motion.div>
      );
    }

    // Not logged in: Show landing or login screen
    if (view === 'auth') {
      return (
        <motion.div
          key="auth"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="min-h-screen bg-slate-50"
        >
          <AuthScreen
            initialPlan={selectedPlan}
            onAuthSuccess={handleAuthSuccess}
            onBackToLanding={() => setView('landing')}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="landing"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="min-h-screen"
      >
        <LandingPage
          onStartAuth={(plan) => {
            setSelectedPlan(plan);
            setView('auth');
          }}
          onLogin={() => {
            setSelectedPlan('pro');
            setView('auth');
          }}
        />
      </motion.div>
    );
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {renderCurrentView()}
      </AnimatePresence>
    </div>
  );
}
