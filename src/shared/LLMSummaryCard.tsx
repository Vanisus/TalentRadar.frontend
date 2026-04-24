import { Stack, Text, ThemeIcon, Group, Paper, Badge } from '@mantine/core';
import { parseLLMMarkdown } from './markdownUtils';

interface LLMSummaryCardProps {
  summary: string;
  score?: number | null;
}

export function LLMSummaryCard({ summary, score }: LLMSummaryCardProps) {
  const parsed = parseLLMMarkdown(summary);
  const displayScore = score ?? parsed.score;

  if (!parsed.items.length) {
    return (
      <Text size="sm" c="dimmed" fs="italic">
        {summary}
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {displayScore !== null && (
        <Group gap="xs" mb={4}>
          <Text size="sm" fw={600} c="dimmed">Оценка LLM:</Text>
          <Badge
            color={displayScore >= 80 ? 'green' : displayScore >= 60 ? 'teal' : displayScore >= 40 ? 'yellow' : 'red'}
            variant="filled"
            size="sm"
          >
            {displayScore.toFixed(0)}%
          </Badge>
        </Group>
      )}

      {parsed.items.map((item, i) => (
        <Paper key={i} p="xs" radius="sm" withBorder
          style={{
            borderLeftWidth: 3,
            borderLeftColor:
              item.type === 'positive' ? 'var(--mantine-color-teal-5)'
              : item.type === 'negative' ? 'var(--mantine-color-red-5)'
              : 'var(--mantine-color-gray-4)',
          }}
        >
          <Group gap="xs" align="flex-start" wrap="nowrap">
            <ThemeIcon
              size="xs"
              variant="transparent"
              color={item.type === 'positive' ? 'teal' : item.type === 'negative' ? 'red' : 'gray'}
              mt={2}
            >
              {item.type === 'positive' ? '✓' : item.type === 'negative' ? '✗' : '·'}
            </ThemeIcon>
            <Text size="sm" style={{ lineHeight: 1.5 }}>{item.text}</Text>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
