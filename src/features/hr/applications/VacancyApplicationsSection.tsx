import { useState } from 'react';
import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Slider,
  Loader,
  Center,
  Button,
  Divider,
  Collapse,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  type HRApplication,
  useVacancyApplications,
  useVacancyApplicationsAnalysis,
  useUpdateApplicationStatus,
  useUpdateApplicationHR,
} from '../hrApi';
import { LLMSummaryCard } from '../../../shared/LLMSummaryCard';
import { MatchScoreBadge } from '../../../shared/MatchScoreBadge';

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  under_review: 'На рассмотрении',
  accepted: 'Принят',
  rejected: 'Отклонён',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'blue',
  under_review: 'yellow',
  accepted: 'green',
  rejected: 'red',
};

function ApplicationCard({ app }: { app: HRApplication }) {
  const updateStatus = useUpdateApplicationStatus();
  const updateHR = useUpdateApplicationHR();
  const [summaryOpen, { toggle: toggleSummary }] = useDisclosure(false);

  const handleSetStage = (stage: string) => {
    updateHR.mutate({ id: app.id, data: { pipeline_stage: stage } });
  };

  return (
    <Card withBorder p="md" radius="md" shadow="xs">
      {/* Заголовок карточки */}
      <Group justify="space-between" align="flex-start" mb="xs">
        <Stack gap={4}>
          <Group gap="xs">
            <Text fw={600} size="sm">Отклик #{app.id}</Text>
            <Badge size="xs" variant="light" color="gray">
              Кандидат #{app.candidate_id}
            </Badge>
            <Badge
              size="xs"
              variant="light"
              color={STATUS_COLORS[app.status] ?? 'gray'}
            >
              {STATUS_LABELS[app.status] ?? app.status}
            </Badge>
          </Group>

          <Group gap="xs">
            <MatchScoreBadge score={app.match_score} showAlways size="xs" />
            {app.pipeline_stage && (
              <Badge size="xs" variant="dot" color="violet">
                {app.pipeline_stage}
              </Badge>
            )}
            {app.rating != null && (
              <Text size="xs" c="dimmed">
                {'★'.repeat(app.rating)}{'☆'.repeat(5 - app.rating)}
              </Text>
            )}
          </Group>

          <Text size="xs" c="dimmed">
            {new Date(app.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        </Stack>

        {/* Кнопки действий */}
        <Stack gap="xs" align="flex-end">
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="violet"
              onClick={() => handleSetStage('screening')}
              disabled={updateHR.isPending}
            >
              Скрининг
            </Button>
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => handleSetStage('interview')}
              disabled={updateHR.isPending}
            >
              Интервью
            </Button>
          </Group>
          <Group gap="xs">
            <Button
              size="xs"
              color="green"
              onClick={() => updateStatus.mutate({ id: app.id, status: 'accepted' })}
              loading={updateStatus.isPending}
            >
              Принять
            </Button>
            <Button
              size="xs"
              color="red"
              variant="subtle"
              onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected' })}
              loading={updateStatus.isPending}
            >
              Отклонить
            </Button>
          </Group>
        </Stack>
      </Group>

      {/* LLM-анализ — раскрывающийся блок */}
      {app.match_summary && (
        <>
          <Divider my="xs" />
          <Group justify="space-between" align="center">
            <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              AI-анализ кандидата
            </Text>
            <Tooltip label={summaryOpen ? 'Скрыть' : 'Показать'} withArrow>
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={toggleSummary}
              >
                {summaryOpen ? '▲' : '▼'}
              </ActionIcon>
            </Tooltip>
          </Group>
          <Collapse in={summaryOpen} mt="xs">
            <LLMSummaryCard summary={app.match_summary} score={app.match_score} />
          </Collapse>
        </>
      )}
    </Card>
  );
}

export function VacancyApplicationsSection({ vacancyId }: { vacancyId: number }) {
  const [minScore, setMinScore] = useState(0);

  const { data: apps, isLoading: appsLoading } = useVacancyApplications(vacancyId, minScore);
  const { data: analysis, isLoading: analysisLoading } = useVacancyApplicationsAnalysis(vacancyId);

  if (appsLoading || analysisLoading) {
    return <Center mt="md"><Loader /></Center>;
  }

  const list = Array.isArray(apps) ? apps : [];

  return (
    <Stack mt="md">
      {/* Шапка с аналитикой */}
      <Group justify="space-between" align="flex-end">
        <Text fw={600} size="lg">Отклики</Text>
        {analysis && (
          <Group gap="lg">
            <Stack gap={0} align="center">
              <Text size="xl" fw={700}>{analysis.total_applications}</Text>
              <Text size="xs" c="dimmed">всего</Text>
            </Stack>
            {analysis.average_match_score != null && (
              <Stack gap={0} align="center">
                <Text size="xl" fw={700} c="teal">{analysis.average_match_score.toFixed(0)}%</Text>
                <Text size="xs" c="dimmed">средний score</Text>
              </Stack>
            )}
            {analysis.max_match_score != null && (
              <Stack gap={0} align="center">
                <Text size="xl" fw={700} c="green">{analysis.max_match_score.toFixed(0)}%</Text>
                <Text size="xs" c="dimmed">максимум</Text>
              </Stack>
            )}
          </Group>
        )}
      </Group>

      {/* Фильтр по score */}
      <Stack gap={4}>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Мин. совпадение</Text>
          <Text size="sm" fw={500}>{minScore}%</Text>
        </Group>
        <Slider min={0} max={100} step={5} value={minScore} onChange={setMinScore} />
      </Stack>

      {!list.length && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Откликов с совпадением ≥{minScore}% нет.
        </Text>
      )}

      {list.map((app) => (
        <ApplicationCard key={app.id} app={app} />
      ))}
    </Stack>
  );
}
