import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Loader,
  Center,
  Divider,
  Collapse,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  useHRApplications,
  useUpdateApplicationStatus,
  useUpdateApplicationHR,
  type HRApplication,
} from './applicationsApi';
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

function ApplicationRow({ app }: { app: HRApplication }) {
  const updateStatus = useUpdateApplicationStatus();
  const updateHR = useUpdateApplicationHR();
  const [summaryOpen, { toggle: toggleSummary }] = useDisclosure(false);

  return (
    <Card withBorder p="md" radius="md" shadow="xs">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Group gap="xs">
            <Text fw={600} size="sm">Отклик #{app.id}</Text>
            <Badge size="xs" variant="light" color="gray">
              Вакансия #{app.vacancy_id}
            </Badge>
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
            {new Date(app.created_at).toLocaleString('ru-RU')}
          </Text>
        </Stack>

        <Stack gap="xs" align="flex-end">
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="violet"
              onClick={() => updateHR.mutate({ id: app.id, data: { pipeline_stage: 'screening' } })}
              disabled={updateHR.isPending}
            >
              Скрининг
            </Button>
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => updateHR.mutate({ id: app.id, data: { pipeline_stage: 'interview' } })}
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

      {app.match_summary && (
        <>
          <Divider my="xs" />
          <Group justify="space-between" align="center">
            <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              AI-анализ
            </Text>
            <Tooltip label={summaryOpen ? 'Скрыть' : 'Показать'} withArrow>
              <ActionIcon size="xs" variant="subtle" onClick={toggleSummary}>
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

export function ApplicationsTab() {
  const { data: applications, isLoading, isError } = useHRApplications();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;

  if (isError) {
    return <Text mt="md" c="red">Ошибка загрузки откликов</Text>;
  }

  return (
    <Stack mt="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">Все отклики</Text>
        {applications && (
          <Text size="sm" c="dimmed">{applications.length} отклик{applications.length === 1 ? '' : applications.length < 5 ? 'а' : 'ов'}</Text>
        )}
      </Group>

      {!applications?.length && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Откликов пока нет.
        </Text>
      )}

      {applications?.map((app) => (
        <ApplicationRow key={app.id} app={app} />
      ))}
    </Stack>
  );
}
