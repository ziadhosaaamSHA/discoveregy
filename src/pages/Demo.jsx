import { FloatingChatWidget } from "@/components/ui/floating-chat-widget"

export default function Demo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <FloatingChatWidget />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-secondary mb-4">Chat Widget Demo</h1>
        <p className="text-muted">Click the button in the bottom right corner to open the AI chat.</p>
      </div>
    </div>
  )
}
