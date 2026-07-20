"use client";

import React, { useState } from "react";
import { Loader } from "lucide-react";
import type { ChatMessage as ChatMessageT } from "@/lib/types";
import { Avatar, Button } from "./ui";

export function SwarmMark({ size = 24, spin }: { size?: number; spin?: boolean }) {
  return (
    <span
      className={`lb-swarm${spin ? " lb-swarm--spin" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export function ChatMessage({ msg, userName }: { msg: ChatMessageT; userName: string }) {
  const agent = msg.author === "agent";
  const cls = ["lb-msg", agent ? "lb-msg--agent" : "lb-msg--user", msg.thinking ? "lb-msg--thinking" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls}>
      <span className="lb-msg__avatar">
        {agent ? <SwarmMark size={32} spin={!!msg.thinking} /> : <Avatar name={userName} size={32} />}
      </span>
      <div className="lb-msg__bubble">
        {msg.thinking ? <Loader /> : null}
        {msg.body}
      </div>
    </div>
  );
}

export function Composer({
  placeholder,
  onSend,
  disabled,
}: {
  placeholder: string;
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const send = () => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue("");
    onSend(text);
  };
  return (
    <div className="lb-composer">
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        aria-label="Message your agent"
      />
      <Button variant="gradient" size="sm" onClick={send} disabled={disabled} iconRight="ArrowUp">
        Send
      </Button>
    </div>
  );
}
