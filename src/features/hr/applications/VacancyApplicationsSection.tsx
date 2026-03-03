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
} from '@mantine/core';
import {
  type HRApplication,
  useVacancyApplications,
  useVacancyApplicationsAnalysis,
  useUpdateApplicationStatus,
  useUpdateApplicationHR,
} from '../hrApi';

interface VacancyApplicationsSectionProps {
  vacancyId: number;
}

function ApplicationCard({ app }: { app: HRApplication }) {
  const updateStatus = useUpdateApplicationStatus();
  const updateHR = useUpdateApplicationHR();

  const handleSetStage = (stage: string) => {
    updateHR.mutate({ id: app.id, data: { pipeline_stage: stage } });
  };

  const handleAccept = () => {
    updateStatus.mutate({ id: app.id, status: 'accepted' });
  };

  const handleReject = () => {
    updateStatus.mutate({ id: app.id, status: 'rejected' });
  };

  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Group gap="xs">
            <Text fw={500}>Отклик #{app.id}</Text>
            <Badge size="sm" variant="light">
              Кандидат #{app.candidate_id}
            </Badge>
          </Group>
          <Text size="sm">Match score: {app.match_score.toFixed(1)}%</Text>
          {app.pipeline_stage && (
            <Text size="sm" c="dimmed">
              Этап: {app.pipeline_stage}
            </Text>
          )}
          {app.rating != null && (
            <Text size="sm">Оценка: {app.rating}/5</Text>
          )}
          {app.match_summary && (
            <Text size="sm" c="dimmed">
              {app.match_summary}
            </Text>
          )}
          <Text size="xs" c="dimmed">
            {new Date(app.created_at).toLocaleDateString('ru-RU')}
          </Text>
        </Stack>

        <Stack gap="xs" align="flex-end">
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              onClick={() => handleSetStage('screening')}
              disabled={updateHR.isPending}
            >
              Скрининг
            </Button>
            <Button
              size="xs"
              variant="light"
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
              onClick={handleAccept}
              loading={updateStatus.isPending}
            >
              Принять
            </Button>
            <Button
              size="xs"
              color="red"
              variant="subtle"
              onClick={handleReject}
              loading={updateStatus.isPending}
            >
              Отклонить
            </Button>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}

export function VacancyApplicationsSection({ vacancyId }: VacancyApplicationsSectionProps) {
  const [minScore, setMinScore] = useState(0);

  const { data: apps, isLoading: appsLoading } = useVacancyApplications(
    vacancyId,
    minScore,
  );
  const { data: analysis, isLoading: analysisLoading } =
    useVacancyApplicationsAnalysis(vacancyId);

  if (appsLoading || analysisLoading) {
    return (
      <Center mt="md">
        <Loader />
      </Center>
    );
  }
  const list = Array.isArray(apps) ? apps : [];

  return (
    <Stack mt="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">
          Отклики по вакансии
        </Text>
        {analysis && (
          <Group gap="md">
            <Text size="sm" c="dimmed">
              Всего: {analysis.total_applications}
            </Text>
            {analysis.average_match_score != null && (
              <Text size="sm" c="dimmed">
                Средний match: {analysis.average_match_score.toFixed(1)}%
              </Text>
            )}
          </Group>
        )}
      </Group>

      <Stack gap={4}>
        <Group justify="space-between">
          <Text size="sm">Минимальный match score</Text>
          <Text size="sm" c="dimmed">
            {minScore}%
          </Text>
        </Group>
        <Slider
          min={0}
          max={100}
          step={5}
          value={minScore}
          onChange={setMinScore}
        />
      </Stack>

      {!list.length && (
        <Text size="sm" c="dimmed">
          Откликов, удовлетворяющих фильтру, нет.
        </Text>
      )}

      {list.map((app) => (
        <ApplicationCard key={app.id} app={app} />
      ))}
    </Stack>
  );
}


