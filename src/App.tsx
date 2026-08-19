// ─── TokTown 앱 루트 ──────────────────────────────────────────────
// 모바일 프레임(390×844) 안에서 온보딩 → 메인 셸(4탭)로 전환.
// 지도는 항상 마운트 유지(Leaflet 재초기화 방지), 다른 탭은
// 지도 위를 덮는 오버레이로 렌더링한다.

import { PhoneFrame } from './components/frame/PhoneFrame';
import { DemoPanel } from './components/frame/DemoPanel';
import { ToastHost } from './components/frame/ToastHost';
import { Onboarding } from './components/onboarding/Onboarding';
import { BottomNav } from './components/shell/BottomNav';
import { AttendanceModal } from './components/shell/AttendanceModal';
import { CommunityScreen } from './components/community/CommunityScreen';
import { VillageScreen } from './components/village/VillageScreen';
import { WalletScreen } from './components/wallet/WalletScreen';
import { MapScreen } from './components/map/MapScreen';
import { useProfileStore } from './store/useProfileStore';
import { useUiStore } from './store/useUiStore';
import { LangToggle } from './i18n';

function MainShell() {
  const activeTab = useUiStore((s) => s.activeTab);

  return (
    <div className="relative h-full">
      <MapScreen />
      {activeTab !== 'map' && (
        <div className="absolute inset-0 z-[600]">
          {activeTab === 'community' && <CommunityScreen />}
          {activeTab === 'village' && <VillageScreen />}
          {activeTab === 'wallet' && <WalletScreen />}
        </div>
      )}
      <BottomNav />
      <AttendanceModal />
      <ToastHost />
    </div>
  );
}

export default function App() {
  const onboarded = useProfileStore((s) => s.onboarded);

  return (
    <PhoneFrame panel={<DemoPanel />}>
      <div className="relative h-full">
        {onboarded ? <MainShell /> : <Onboarding />}
        {/* 전역 한/영 토글 — 상태바 영역(노치 옆), 온보딩부터 노출 */}
        <LangToggle />
      </div>
    </PhoneFrame>
  );
}
