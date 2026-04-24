/**
 * Converts simple LLM markdown output to clean readable text.
 * Removes **, *, converts bullet points to readable format.
 */
export function parseLLMMarkdown(raw: string): ParsedLLMSummary {
  const lines = raw.split('\n');
  const items: { type: 'positive' | 'negative' | 'neutral'; text: string }[] = [];
  let score: number | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Score line: "Оценка: 0.85" or "Score: 85"
    const scoreMatch = trimmed.match(/[Оо]ценка[:\s]+([\d.,]+)/);
    if (scoreMatch) {
      const val = parseFloat(scoreMatch[1].replace(',', '.'));
      score = val <= 1 ? Math.round(val * 100) : val;
      continue;
    }

    // Strip leading markdown symbols: *, **, ###, ##, -
    let text = trimmed
      .replace(/^#{1,6}\s*/, '')
      .replace(/^[*-]\s*/, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .trim();

    if (!text) continue;

    // Classify bullet by content keywords
    const lowerText = text.toLowerCase();
    const isNegative =
      lowerText.includes('отсутств') ||
      lowerText.includes('нет опыт') ||
      lowerText.includes('несоответств') ||
      lowerText.includes('молодой') ||
      lowerText.includes('слабый') ||
      lowerText.includes('недостаточн') ||
      lowerText.includes('минус') ||
      lowerText.includes('проблем');

    const isPositive =
      lowerText.includes('высок') ||
      lowerText.includes('уверен') ||
      lowerText.includes('опыт') ||
      lowerText.includes('владеет') ||
      lowerText.includes('подтвержд') ||
      lowerText.includes('хорош') ||
      lowerText.includes('соответств');

    items.push({
      type: isNegative ? 'negative' : isPositive ? 'positive' : 'neutral',
      text,
    });
  }

  return { score, items };
}

export interface ParsedLLMSummary {
  score: number | null;
  items: { type: 'positive' | 'negative' | 'neutral'; text: string }[];
}
