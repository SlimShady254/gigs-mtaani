import { useState } from "react";
import { AppLayout } from "../components/Layout";
import { ChatPanel, type ChatLaunchIntent } from "../components/ChatPanel";

export function ChatPage() {
  const [launchIntent, setLaunchIntent] = useState<ChatLaunchIntent | null>(null);

  return (
    <AppLayout title="Messages">
      <div className="dashboard-bottom-grid">
        <ChatPanel
          launchIntent={launchIntent}
          onLaunchHandled={() => setLaunchIntent(null)}
        />
      </div>
    </AppLayout>
  );
}

