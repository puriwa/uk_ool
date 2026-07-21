import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { CustomerDashboard, FreeConsult } from './p1-consult'
import { AdminDashboard, LawyerDashboard, LawyerProfile, Lawyers } from './p1-operations'
import { AuthCallback, ConsultHub, Guide, Home, Login, QuickConsult } from './p1-public'
import { Page, RequireAuth } from './p1-ui'

function NotFound() {
  return <Page><main className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="eyebrow">페이지를 찾을 수 없어요</p><h1 className="mt-4 text-3xl font-extrabold text-navy">주소를 다시 확인해 주세요.</h1><Link className="button-primary mt-7" to="/">홈으로 돌아가기</Link></main></Page>
}

export default function AppV2() {
  return <Routes>
    <Route element={<Home />} path="/" />
    <Route element={<Guide />} path="/guide/:topic" />
    <Route element={<Navigate replace to="/guide/insurance-dispute" />} path="/guide/insurance-dispute/checklist" />
    <Route element={<ConsultHub />} path="/consult" />
    <Route element={<QuickConsult />} path="/consult/quick" />
    <Route element={<RequireAuth><FreeConsult /></RequireAuth>} path="/consult/free" />
    <Route element={<Login />} path="/login" />
    <Route element={<AuthCallback />} path="/auth/callback" />
    <Route element={<RequireAuth><CustomerDashboard /></RequireAuth>} path="/app/*" />
    <Route element={<Lawyers />} path="/lawyers" />
    <Route element={<LawyerProfile />} path="/lawyers/:slug" />
    <Route element={<RequireAuth><LawyerDashboard /></RequireAuth>} path="/lawyer/dashboard" />
    <Route element={<AdminDashboard />} path="/admin/dashboard" />
    <Route element={<NotFound />} path="*" />
  </Routes>
}
