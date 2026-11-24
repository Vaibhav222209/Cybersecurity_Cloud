import { useCallback, useMemo, useState } from "react";
import { NavCtx, StoreProvider, useStore, type NavOpts, type NavState, type Page, type Session } from "./store";
import Landing from "./Landing";
import Shell from "./Shell";
import Home from "./pages/Home";
import Resources from "./pages/Resources";
import Create from "./pages/Create";
import Services from "./pages/Services";
import Security from "./pages/Security";
import Discover from "./pages/Discover";
import Cost from "./pages/Cost";
import CloudShell from "./pages/CloudShell";
import About from "./pages/About";

function Portal() {
  const { state, set, log, toast } = useStore();
  const [nav, setNav] = useState<NavState>({ page: "home" });

  const go = useCallback((page: Page, o?: NavOpts) => setNav({ page, ...o }), []);
  const ctx = useMemo(() => ({ nav, go }), [nav, go]);

  const enter = (s: Session, page: Page = "home") => {
    set((st) => ({ ...st, session: s }));
    setNav({ page });
    setTimeout(() => {
      log(s.guest ? "Signed in as guest" : `Signed in as ${s.email} (MFA verified)`, "security");
      toast(`Welcome to Ramzure, ${s.name.split(" ")[0]}!`, "info");
    }, 50);
  };
  const signOut = () => { set((st) => ({ ...st, session: null })); setNav({ page: "home" }); };

  if (!state.session) return <Landing onEnter={enter} />;

  const pages: Record<Page, React.ReactNode> = {
    home: <Home />,
    resources: <Resources />,
    create: <Create />,
    services: <Services />,
    security: <Security />,
    discover: <Discover />,
    cost: <Cost />,
    shell: <CloudShell />,
    about: <About />,
  };

  return (
    <NavCtx.Provider value={ctx}>
      <Shell onSignOut={signOut}>
        <div key={nav.page} className="animate-fade-up">{pages[nav.page]}</div>
      </Shell>
    </NavCtx.Provider>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Portal />
    </StoreProvider>
  );
}
