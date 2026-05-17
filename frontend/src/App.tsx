import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { TopNav, MobileNav, BottomTab, FAB } from './components/layout';
import HomePage from './pages/Home';
import CheckinPage from './pages/Checkin';
import KRPage from './pages/KR';
import AdvicePage from './pages/Advice';
import InternshipPage from './pages/Internship';
import { CheckinSuccess } from './pages/Checkin';
import { OP_DATA } from './data';
import type { CheckinResult } from './types';

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function routeTitle(pathname: string, name: string): string {
  if (pathname === '/') return '早安，' + name;
  if (pathname === '/checkin') return '今日打卡';
  if (pathname === '/kr') return 'KR 看板';
  if (pathname === '/advice') return '建议中心';
  if (pathname === '/internship') return '实习推荐';
  return '';
}

function pathToRoute(pathname: string): string {
  if (pathname === '/') return 'home';
  return pathname.slice(1);
}

export default function App() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [success, setSuccess] = useState<CheckinResult | null>(null);

  const data = OP_DATA.soph;
  const route = pathToRoute(location.pathname);

  const setRoute = (r: string) => navigate(r === 'home' ? '/' : '/' + r);
  const openCheckin = () => navigate('/checkin');
  const openSuccess = (result: CheckinResult) => setSuccess(result);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.add('font-modern', 'variant-calm');
  }, []);

  const showFAB = route !== 'checkin';
  const title = routeTitle(location.pathname, data.name);
  const pageProps = { data, isMobile, setRoute, openCheckin };

  return (
    <div className="op-app" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {isMobile
        ? <MobileNav route={route} setRoute={setRoute} data={data} title={title} />
        : <TopNav route={route} setRoute={setRoute} data={data} />
      }
      <div key={location.pathname} style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0 }}>
        <Routes>
          <Route path="/" element={<HomePage {...pageProps} />} />
          <Route path="/checkin" element={<CheckinPage {...pageProps} openSuccess={openSuccess} />} />
          <Route path="/kr" element={<KRPage {...pageProps} />} />
          <Route path="/advice" element={<AdvicePage {...pageProps} />} />
          <Route path="/internship" element={<InternshipPage {...pageProps} />} />
        </Routes>
      </div>
      {isMobile && <BottomTab route={route} setRoute={setRoute} />}
      {showFAB && !isMobile && <FAB onClick={openCheckin} />}

      {success && (
        <CheckinSuccess
          result={success}
          data={data}
          onClose={() => { setSuccess(null); navigate('/'); }}
          onViewAdvice={() => { setSuccess(null); navigate('/advice'); }}
        />
      )}
    </div>
  );
}
