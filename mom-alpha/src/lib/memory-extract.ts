/**
 * Auto-extract insights from agent responses.
 *
 * When the backend includes a `memory_hints` field in ChatResponse,
 * those are saved directly. Additionally, this module does lightweight
 * keyword detection to surface potential family facts from agent replies.
 */

import type { AgentType } from "@/types/api-contracts";
import { addMemory } from "@/lib/memory-store";
import type { MemoryCategory } from "@/lib/memory-store";

interface ExtractedInsight {
  category: MemoryCategory;
  content: string;
}

/**
 * Keyword patterns that suggest the agent is stating a family fact.
 * Each pattern maps to a memory category.
 */
const EXTRACTION_PATTERNS: Array<{
  pattern: RegExp;
  category: MemoryCategory;
}> = [
  { pattern: /(?:allergic to|allergy|allergies)\s+(.+?)[\.\,\!]/i, category: "family_fact" },
  { pattern: /(?:birthday|born on)\s+(?:is\s+)?(.+?)[\.\,\!]/i, category: "important_date" },
  { pattern: /(?:every\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\s+(.+?)[\.\,\!]/i, category: "routine" },
  { pattern: /(?:recurring|weekly|daily|monthly)\s+(.+?)[\.\,\!]/i, category: "routine" },
  { pattern: /(?:appointment|doctor|dentist|checkup)\s+(?:on|at|scheduled)\s+(.+?)[\.\,\!]/i, category: "important_date" },
  { pattern: /(?:deadline|due date|expires?)\s+(?:is\s+)?(.+?)[\.\,\!]/i, category: "important_date" },
];

/**
 * Extract potential insights from an agent response.
 * Returns extracted items but does NOT auto-save — caller decides.
 */
export function extractInsights(content: string): ExtractedInsight[] {
  const insights: ExtractedInsight[] = [];
  const seen = new Set<string>();

  for (const { pattern, category } of EXTRACTION_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      const text = match[0].trim();
      if (!seen.has(text)) {
        seen.add(text);
        insights.push({ category, content: text });
      }
    }
  }

  return insights;
}

/**
 * Process an agent response: extract insights and save as agent_insight memories.
 * Called after each successful agent reply in the chat store.
 */
export async function processAgentResponse(
  agentType: AgentType,
  responseContent: string,
  memoryHints?: Array<{ category: string; content: string }>
): Promise<void> {
  // 1. Save any explicit memory hints from the backend
  if (memoryHints && memoryHints.length > 0) {
    for (const hint of memoryHints) {
      await addMemory({
        category: (hint.category as MemoryCategory) || "agent_insight",
        content: hint.content,
        tags: [agentType],
        source_agent: agentType,
        pinned: false,
      });
    }
  }

  // 2. Auto-extract from response text (lightweight, local-only)
  const extracted = extractInsights(responseContent);
  for (const insight of extracted) {
    await addMemory({
      category: insight.category,
      content: insight.content,
      tags: [agentType, "auto-extracted"],
      source_agent: agentType,
      pinned: false,
    });
  }
}
