import { SetupProvider } from '@/lib/setup-context'

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SetupProvider>{children}</SetupProvider>
}
