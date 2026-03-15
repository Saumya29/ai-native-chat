import { PasswordGate } from '@/components/password-gate'
import { ChatApp } from '@/components/chat-app'

export default function Page() {
  return (
    <PasswordGate>
      <ChatApp />
    </PasswordGate>
  )
}
