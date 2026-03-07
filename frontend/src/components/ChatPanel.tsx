import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, MessageSquarePlus, RefreshCw, SendHorizontal } from "lucide-react";
import { chatApi } from "../lib/api";
import { getOrCreateIdentityKeyPair } from "../lib/e2ee";
import { useAuthStore } from "../state/authStore";
import { useChatStore, type ChatEnvelope } from "../state/chatStore";

export type ChatLaunchIntent = {
  requestId: number;
  gigId: string;
  gigTitle: string;
  posterName?: string;
  posterId?: string;
};

type ThreadParticipant = {
  userId: string;
  user?: {
    id?: string;
    profile?: {
      displayName?: string;
    };
  };
};

type ThreadRecord = {
  id: string;
  gigId?: string | null;
  gigTitle?: string | null;
  participants: ThreadParticipant[];
  latestMessage?: {
    id: string;
    senderId?: string;
    createdAt?: string;
    preview?: string;
  } | null;
  updatedAt?: string;
};

function encodeMessage(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeMessage(ciphertext: string) {
  try {
    const binary = atob(ciphertext);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "[Encrypted message]";
  }
}

function formatThreadTime(date?: string) {
  if (!date) return "";
  const ts = Date.parse(date);
  if (Number.isNaN(ts)) return "";

  const now = Date.now();
  const diffMinutes = Math.floor((now - ts) / 60000);
  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getPeerName(thread: ThreadRecord, currentUserId?: string) {
  const peer = thread.participants.find((participant) => participant.userId !== currentUserId);
  return peer?.user?.profile?.displayName ?? thread.gigTitle ?? "Conversation";
}

function getThreadPreview(thread: ThreadRecord) {
  return thread.latestMessage?.preview ?? "No messages yet";
}

type ChatPanelProps = {
  launchIntent?: ChatLaunchIntent | null;
  onLaunchHandled?: () => void;
  onStatusChange?: (message: string) => void;
};

export function ChatPanel({ launchIntent, onLaunchHandled, onStatusChange }: ChatPanelProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { activeThreadId, setActiveThread, messagesByThread, setMessages, appendMessage } = useChatStore();
  const keyPair = useMemo(() => getOrCreateIdentityKeyPair(), []);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const threadsQuery = useQuery<ThreadRecord[]>({
    queryKey: ["threads"],
    queryFn: async () => {
      const data = await chatApi.threads();
      return Array.isArray(data?.threads) ? data.threads : [];
    },
    refetchInterval: 15000
  });

  const threads = threadsQuery.data ?? [];

  const createThreadMutation = useMutation({
    mutationFn: async (payload: {
      gigId?: string;
      gigTitle?: string;
      participantId?: string;
      participantName?: string;
    }) => chatApi.createThread(payload),
    onSuccess: (data) => {
      const threadId = data?.thread?.id;
      if (threadId) {
        setActiveThread(threadId);
        queryClient.invalidateQueries({ queryKey: ["threads"] });
        onStatusChange?.("Conversation is ready. You can send a message now.");
      }
    },
    onError: () => {
      setErrorMessage("Unable to start conversation right now.");
      onStatusChange?.("Unable to start conversation. Please try again.");
    }
  });

  useEffect(() => {
    if (activeThreadId || !threads.length) return;
    setActiveThread(threads[0].id);
  }, [activeThreadId, setActiveThread, threads]);

  useEffect(() => {
    const requestId = launchIntent?.requestId;
    if (!requestId) return;

    const existingThread = threads.find((thread) => {
      if (launchIntent?.gigId && thread.gigId === launchIntent.gigId) return true;
      if (launchIntent?.posterId) {
        return thread.participants.some((participant) => participant.userId === launchIntent.posterId);
      }
      return false;
    });

    if (existingThread) {
      setActiveThread(existingThread.id);
      onStatusChange?.(`Opened chat for ${launchIntent?.gigTitle ?? "this gig"}.`);
      onLaunchHandled?.();
      return;
    }

    createThreadMutation.mutate(
      {
        gigId: launchIntent?.gigId,
        gigTitle: launchIntent?.gigTitle,
        participantId: launchIntent?.posterId,
        participantName: launchIntent?.posterName
      },
      {
        onSettled: () => {
          onLaunchHandled?.();
        }
      }
    );
  }, [
    createThreadMutation,
    launchIntent?.gigId,
    launchIntent?.gigTitle,
    launchIntent?.posterId,
    launchIntent?.posterName,
    launchIntent?.requestId,
    onLaunchHandled,
    onStatusChange,
    setActiveThread,
    threads
  ]);

  const messagesQuery = useQuery<ChatEnvelope[]>({
    queryKey: ["thread-messages", activeThreadId],
    enabled: Boolean(activeThreadId),
    queryFn: async () => {
      if (!activeThreadId) return [];
      const data = await chatApi.messages(activeThreadId);
      return Array.isArray(data?.messages) ? data.messages : [];
    }
  });

  useEffect(() => {
    if (!activeThreadId || !messagesQuery.data) return;
    setMessages(activeThreadId, messagesQuery.data);
  }, [activeThreadId, messagesQuery.data, setMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeThreadId, messagesByThread]);

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { threadId: string; text: string }) => {
      const encoded = encodeMessage(payload.text);
      return chatApi.sendMessage(payload.threadId, {
        ciphertext: encoded,
        nonce: `nonce-${Date.now()}`,
        ratchetHeader: JSON.stringify({ version: 1, mode: "demo-encoded" }),
        senderKeyId: keyPair.publicKey
      });
    },
    onSuccess: (_data, variables) => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["thread-messages", variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
    onError: (_error, variables) => {
      setErrorMessage("Message failed to send. Please retry.");
      onStatusChange?.("Message failed to send.");
      queryClient.invalidateQueries({ queryKey: ["thread-messages", variables.threadId] });
    }
  });

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, threads]
  );

  const activeMessages = activeThreadId ? messagesByThread[activeThreadId] ?? [] : [];

  function handleSendMessage() {
    if (!activeThreadId) {
      setErrorMessage("Select a conversation first.");
      return;
    }

    const text = draft.trim();
    if (!text) return;

    setErrorMessage(null);
    appendMessage(activeThreadId, {
      id: `temp-${Date.now()}`,
      threadId: activeThreadId,
      senderId: user?.id ?? "me",
      ciphertext: encodeMessage(text),
      nonce: `local-${Date.now()}`,
      ratchetHeader: "{}",
      senderKeyId: keyPair.publicKey,
      createdAt: new Date().toISOString()
    });

    sendMessageMutation.mutate({ threadId: activeThreadId, text });
  }

  return (
    <section className="panel chat-panel">
      <div className="chat-head">
        <div>
          <h3>Messaging Hub</h3>
          <p className="dashboard-subtle">Open real conversations from gigs and message instantly.</p>
        </div>
        <div className="dashboard-head-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              threadsQuery.refetch();
              if (activeThreadId) {
                queryClient.invalidateQueries({ queryKey: ["thread-messages", activeThreadId] });
              }
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      <div className="chat-layout">
        <aside className="threads">
          {threadsQuery.isLoading ? <p className="muted">Loading conversations...</p> : null}
          {!threadsQuery.isLoading && threads.length === 0 ? (
            <div className="chat-empty-threads">
              <p className="muted">No conversations yet.</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={createThreadMutation.isPending}
                onClick={() =>
                  createThreadMutation.mutate({
                    gigTitle: "General conversation",
                    participantName: "Support"
                  })
                }
              >
                {createThreadMutation.isPending ? (
                  <LoaderCircle className="spin" size={14} />
                ) : (
                  <MessageSquarePlus size={14} />
                )}
                Start Chat
              </button>
            </div>
          ) : null}

          {threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              className={activeThreadId === thread.id ? "thread active" : "thread"}
              onClick={() => setActiveThread(thread.id)}
            >
              <span className="thread-title">{getPeerName(thread, user?.id)}</span>
              <span className="thread-preview-line">{getThreadPreview(thread)}</span>
              <span className="thread-time-chip">
                {formatThreadTime(thread.latestMessage?.createdAt ?? thread.updatedAt)}
              </span>
            </button>
          ))}
        </aside>

        <div className="messages">
          <div className="message-list">
            {activeThread ? (
              <p className="chat-active-thread-label">
                {getPeerName(activeThread, user?.id)}
                {activeThread.gigTitle ? ` • ${activeThread.gigTitle}` : ""}
              </p>
            ) : null}

            {activeThreadId && messagesQuery.isLoading ? <p className="muted">Loading messages...</p> : null}

            {!activeThreadId ? <p className="muted">Select a conversation to start chatting.</p> : null}

            {activeThreadId && !messagesQuery.isLoading && activeMessages.length === 0 ? (
              <p className="muted">No messages yet. Send the first one.</p>
            ) : null}

            {activeMessages.map((message) => {
              const isMine = message.senderId === user?.id;
              return (
                <div key={message.id} className={isMine ? "bubble me" : "bubble them"}>
                  <p>{decodeMessage(message.ciphertext)}</p>
                  <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          <div className="send-box">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={activeThreadId ? "Type message" : "Select a thread to chat"}
              disabled={!activeThreadId || sendMessageMutation.isPending}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!activeThreadId || !draft.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? <LoaderCircle className="spin" size={14} /> : <SendHorizontal size={14} />}
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
