import { Link } from 'react-router-dom'
import { Chem } from '../components/Chem'
import { TOOLS } from '../tools/registry'

const ORDER = [
  TOOLS.periodicTable,
  TOOLS.balancer,
  TOOLS.stoichiometry,
  TOOLS.acidBase,
  TOOLS.precipitation,
  TOOLS.redox,
  TOOLS.equilibrium,
]

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="space-y-2 py-4">
        <p className="text-sm font-medium text-accent">國中理化・化學單元</p>
        <h1 className="text-3xl font-bold sm:text-4xl">動手玩，看懂課本上的化學</h1>
        <p className="max-w-2xl text-ink-2">
          課本的圖是靜止的，這裡的每個工具都能讓你自己調整、立刻看到結果。遇到卡住的觀念時，花 5 分鐘來玩一下，再回去看課本會更清楚。
        </p>
        <p className="max-w-2xl text-sm text-ink-2">
          每個觀念都能從三個角度看：<strong className="text-ink">巨觀</strong>（看得到的現象）、
          <strong className="text-ink">微觀</strong>（粒子）、<strong className="text-ink">符號</strong>（化學式）。做完「診斷挑戰」後，到
          <Link to="/progress" className="mx-1 font-medium text-accent underline underline-offset-4">
            我的學習紀錄
          </Link>
          看看哪些觀念已經精熟、哪些還有迷思。
        </p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ORDER.map((t) => (
          <li key={t.path}>
            <Link
              to={t.path}
              className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition hover:border-accent"
            >
              <span className="text-xs font-medium text-ink-2">{t.unit}</span>
              <span className="mt-1 text-lg font-bold group-hover:text-accent">{t.title}</span>
              <span className="mt-1 flex-1 text-sm text-ink-2">{t.goal}</span>
              <span className="mt-4 overflow-x-auto rounded-lg bg-surface-2 px-3 py-2 text-center text-lg">
                <Chem>{t.preview}</Chem>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
