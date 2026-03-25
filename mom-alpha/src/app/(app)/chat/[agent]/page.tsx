import { AgentChatClient } from "@/components/chat/AgentChatClient";
import type { AgentType } from "@/types/api-contracts";

export function generateStaticParams() {
  return [
    { agent: "calendar_whiz" },
    { agent: "grocery_guru" },
    { agent: "budget_buddy" },
    { agent: "school_event_hub" },
    { agent: "tutor_finder" },
    { agent: "health_hub" },
    { agent: "sleep_tracker" },
    { agent: "self_care_reminder" },
  ];
}

export default async function AgentChatPage({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent } = await params;
  return <AgentChatClient agentType={agent as AgentType} />;
}
