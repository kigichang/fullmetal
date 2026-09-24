import { useEffect } from 'react'
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AcidBase from './tools/AcidBase/AcidBase'
import Balancer from './tools/Balancer/Balancer'
import PeriodicTable from './tools/PeriodicTable/PeriodicTable'
import Precipitation from './tools/Precipitation/Precipitation'
import { TOOLS } from './tools/registry'
import Stoichiometry from './tools/Stoichiometry/Stoichiometry'

const NAV = [
  { to: TOOLS.periodicTable.path, label: '週期表' },
  { to: TOOLS.balancer.path, label: '反應式平衡' },
  { to: TOOLS.stoichiometry.path, label: '莫耳計算' },
  { to: TOOLS.acidBase.path, label: '酸鹼' },
  { to: TOOLS.precipitation.path, label: '沉澱' },
]

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="min-h-dvh">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
            <Link to="/" className="shrink-0 font-bold">
              化學互動工具箱
            </Link>
            <nav className="-mr-4 flex gap-1 overflow-x-auto pr-4 text-sm">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `shrink-0 rounded-md px-2.5 py-1 ${isActive ? 'bg-accent-soft font-semibold text-accent' : 'text-ink-2 hover:text-ink'}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path={TOOLS.periodicTable.path} element={<PeriodicTable />} />
            <Route path={TOOLS.balancer.path} element={<Balancer />} />
            <Route path={TOOLS.stoichiometry.path} element={<Stoichiometry />} />
            <Route path={TOOLS.acidBase.path} element={<AcidBase />} />
            <Route path={TOOLS.precipitation.path} element={<Precipitation />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <footer className="mx-auto max-w-6xl px-4 pt-4 pb-8 text-xs text-ink-2">
          輔助課本學習用，數值為教學近似值；以學校課本與老師說明為準。
        </footer>
      </div>
    </HashRouter>
  )
}
