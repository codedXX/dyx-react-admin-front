import React, { useEffect, useState, useRef } from "react";
import { Card, Button } from "@/components/ui/LayoutComponents";
import { Send, User as UserIcon } from "lucide-react";
import { ChatMessage } from "@/types";
import { useAuthStore } from "@/store";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // 创建STOMP客户端
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws/chat"),
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("WebSocket连接成功");
        setIsConnected(true);
        setMessages((prev) => [
          ...prev,
          {
            id: "system-1",
            text: "已连接到聊天服务器。",
            sender: "system",
            timestamp: Date.now(),
          },
        ]);

        // 订阅消息主题
        client.subscribe("/topic/messages", (message) => {
          const receivedMsg = JSON.parse(message.body);
          console.log("收到消息:", receivedMsg);

          setMessages((prev) => [
            ...prev,
            {
              id: receivedMsg.id || Date.now().toString(),
              text: receivedMsg.text,
              sender: receivedMsg.sender || "other",
              timestamp: receivedMsg.timestamp || Date.now(),
            },
          ]);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP错误:", frame);
        setIsConnected(false);
        setMessages((prev) => [
          ...prev,
          {
            id: "system-error",
            text: "连接失败,请检查后端服务是否启动。",
            sender: "system",
            timestamp: Date.now(),
          },
        ]);
      },
      onWebSocketClose: () => {
        console.log("WebSocket连接关闭");
        setIsConnected(false);
        setMessages((prev) => [
          ...prev,
          {
            id: "system-2",
            text: "与服务器断开连接。",
            sender: "system",
            timestamp: Date.now(),
          },
        ]);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !stompClientRef.current?.connected) return;

    // 发送到服务器
    stompClientRef.current.publish({
      destination: "/app/chat/send",
      body: JSON.stringify({
        text: input,
        sender: user?.username || "me",
        timestamp: Date.now(),
      }),
    });

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  const isMe = (sender: string) => {
    return sender === user?.username || sender === "me";
  };

  return (
    <div className="h-[calc(100vh-140px)]">
      <Card
        className="h-full flex flex-col p-0 overflow-hidden"
        title="团队聊天"
      >
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            // 系统消息居中显示
            if (msg.sender === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  isMe(msg.sender) ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isMe(msg.sender)
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <UserIcon size={14} />
                </div>
                <div
                  className={`max-w-[70%] p-3 rounded-lg text-sm ${
                    isMe(msg.sender)
                      ? "bg-primary-600 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mb-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? "输入消息..." : "连接中..."}
            disabled={!isConnected}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50"
          />
          <Button
            onClick={sendMessage}
            variant="primary"
            className="!px-3"
            disabled={!isConnected}
          >
            <Send size={18} />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
