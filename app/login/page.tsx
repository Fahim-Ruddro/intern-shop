import { LoginForm } from '@/components/AuthForms'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>
}) {
  const { error, message, next } = await searchParams

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <LoginForm nextPath={next} initialMessage={message} initialError={error} />
    </div>
  )
}