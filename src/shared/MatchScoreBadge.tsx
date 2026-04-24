import { Badge, Tooltip } from '@mantine/core';

interface MatchScoreBadgeProps {
  score: number;
  showAlways?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

function scoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'teal';
  if (score >= 40) return 'yellow';
  return 'red';
}

/**
 * Показывает badge с процентом совпадения резюме и вакансии.
 * По умолчанию скрывает если < 50% (логика кандидата).
 */
export function MatchScoreBadge({ score, showAlways = false, size = 'sm' }: MatchScoreBadgeProps) {
  if (!showAlways && score < 50) return null;

  return (
    <Tooltip label={`Совпадение резюме с вакансией: ${score.toFixed(1)}%`} withArrow>
      <Badge color={scoreColor(score)} size={size} variant="light">
        {score.toFixed(0)}% совпадение
      </Badge>
    </Tooltip>
  );
}
