// ─── 하단 4탭: 지도 / 커뮤니티 / 내 마을 / 지갑 (기획 §6 확정) ────

import { type TabId, useUiStore } from '../../store/useUiStore';
import { useT } from '../../i18n';

function TabIcon({ tab, active }: { tab: TabId; active: boolean }) {
  const color = active ? '#4E9B58' : '#B4A99A';
  switch (tab) {
    case 'map':
      return (
        <svg width={26} height={26} viewBox="0 0 32 32">
          <path
            d="M16 3 a9.5 9.5 0 0 1 9.5 9.5 c0 6.8 -7 12.7 -9.5 15.5 c-2.5 -2.8 -9.5 -8.7 -9.5 -15.5 A9.5 9.5 0 0 1 16 3 Z"
            fill={color}
          />
          <circle cx={16} cy={12.5} r={4} fill="#FFFDF7" />
        </svg>
      );
    case 'community':
      return (
        <svg width={26} height={26} viewBox="0 0 32 32">
          <path d="M4 6 h16 a4 4 0 0 1 4 4 v6 a4 4 0 0 1 -4 4 h-8 l-5 5 v-5 h-3 a4 4 0 0 1 -4 -4 v-6 a4 4 0 0 1 4 -4 Z" fill={color} />
          <path d="M26 12 h1 a4 4 0 0 1 4 4 v4 a4 4 0 0 1 -4 4 h-1 v4 l-4 -4" fill={color} opacity={0.55} />
          <circle cx={9} cy={13} r={1.7} fill="#FFFDF7" />
          <circle cx={14} cy={13} r={1.7} fill="#FFFDF7" />
          <circle cx={19} cy={13} r={1.7} fill="#FFFDF7" />
        </svg>
      );
    case 'village':
      return (
        <svg width={26} height={26} viewBox="0 0 32 32">
          <path d="M4 15 L16 4 L28 15 Z" fill={active ? '#F2705E' : color} />
          <rect x={7} y={15} width={18} height={12} rx={2.5} fill={color} />
          <rect x={13} y={19} width={6} height={8} rx={1.5} fill="#FFFDF7" />
          <rect x={22} y={6} width={3.4} height={6} rx={1.2} fill={active ? '#F2705E' : color} />
        </svg>
      );
    case 'wallet':
      return (
        <svg width={26} height={26} viewBox="0 0 32 32">
          <rect x={3} y={7} width={26} height={19} rx={4.5} fill={color} />
          <rect x={3} y={11.5} width={26} height={4} fill="#FFFDF7" opacity={0.5} />
          <circle cx={23} cy={20} r={3.2} fill="#FFD66B" />
        </svg>
      );
  }
}

const TABS: { id: TabId; label: string; labelEn: string }[] = [
  { id: 'map', label: '지도', labelEn: 'Map' },
  { id: 'community', label: '커뮤니티', labelEn: 'Community' },
  { id: 'village', label: '내 마을', labelEn: 'My Town' },
  { id: 'wallet', label: '지갑', labelEn: 'Wallet' },
];

export function BottomNav() {
  const activeTab = useUiStore((s) => s.activeTab);
  const setTab = useUiStore((s) => s.setTab);
  const T = useT();

  return (
    <nav className="absolute inset-x-0 bottom-0 z-[800] border-t border-town-line bg-town-paper/95 pb-4 pt-1.5 backdrop-blur">
      <div className="grid grid-cols-4">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <span className={active ? 'pop-in' : ''}>
                <TabIcon tab={t.id} active={active} />
              </span>
              <span
                className={`text-[10.5px] ${
                  active ? 'font-extrabold text-town-leafDark' : 'font-medium text-[#B4A99A]'
                }`}
              >
                {T(t.label, t.labelEn)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
