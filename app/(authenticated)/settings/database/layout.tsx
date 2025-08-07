import AuthGuard from '@/components/auth/auth-guard';

export default function DatabaseSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
