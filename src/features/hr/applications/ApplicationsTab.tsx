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
  Alert,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  useHRApplications,
  useUpdateApplicationStatus,
  useUpdateApplicationHR,
  useLLMAnalyzeApplication,
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

function AISummaryBlock({ app }: { app: HRApplication }) {
  const [open, { toggle }] = useDisclosure(false);
  const analyzeMutation = useLLMAnalyzeApplication();

  const hasSummary = !!app.match_summary;

  return (
    <>
      <Divider my="xs" />
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <ThemeIcon size="xs" variant="transparent" color="violet">❇</ThemeIcon>
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            Первичная информация (AI)
          </Text>
        </Group>

        <Group gap="xs">
          {!hasSummary && (
            <Tooltip label="Запустить AI-анализ кандидата" withArrow>
              <Button
                size="xs"
                variant="light"
                color="violet"
                loading={analyzeMutation.isPending}
                onClick={() => analyzeMutation.mutate({ id: app.id })}
              >
                Получить
              </Button>
            </Tooltip>
          )}
          {hasSummary && (
            <>
              <Tooltip label="Переанализировать" withArrow>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  loading={analyzeMutation.isPending}
                  onClick={() => analyzeMutation.mutate({ id: app.id })}
                >
                  ↑ Обновить
                </Button>
              </Tooltip>
              <Tooltip label={open ? 'Скрыть' : 'Показать'} withArrow>
                <ActionIcon size="sm" variant="subtle" onClick={toggle}>
                  {open ? '▲' : '▼'}
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>
      </Group>

      {!hasSummary && !analyzeMutation.isPending && (
        <Alert
          mt="xs"
          variant="light"
          color="gray"
          icon={<span style={{ fontSize: 14 }}>⏳</span>}
        >
          <Text size="xs" c="dimmed">
            AI-анализ ещё не запущен. Нажмите «Получить», чтобы нейросеть оценила кандидата.
          </Text>
        </Alert>
      )}

      {analyzeMutation.isPending && (
        <Group mt="xs" gap="xs">
          <Loader size="xs" color="violet" />
          <Text size="xs" c="dimmed">Анализируем кандидата…</Text>
        </Group>
      )}

      {hasSummary && (
        <Collapse in={open} mt="xs">
          <LLMSummaryCard summary={app.match_summary!} score={app.match_score} />
        </Collapse>
      )}

      {analyzeMutation.isError && (
        <Text size="xs" c="red" mt={4}>
          {`Ошибка: ${(analyzeMutation.error as Error).message}`}
        </Text>
      )}
    </>
  );
}

function ApplicationRow({ app }: { app: HRApplication }) {
  const updateStatus = useUpdateApplicationStatus();
  const updateHR = useUpdateApplicationHR();

  const isRejected = app.status === 'rejected';
  const isAccepted = app.status === 'accepted';

  const vacancyLabel = app.vacancy_title ?? `Вакансия #${app.vacancy_id}`;
  const candidateLabel = app.candidate_full_name
    ? `${app.candidate_full_name} (${app.candidate_email ?? app.candidate_id})`
    : (app.candidate_email ?? `Кандидат #${app.candidate_id}`);

  return (
    <Card
      withBorder
      p="md"
      radius="md"
      shadow="xs"
      style={isRejected ? { opacity: 0.7 } : undefined}
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Group gap="xs">
            <Text fw={600} size="sm">Отклик #{app.id}</Text>
            <Badge size="xs" variant="light" color="gray">
              {vacancyLabel}
            </Badge>
            <Badge size="xs" variant="light" color="gray">
              {candidateLabel}
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
              disabled={updateHR.isPending || isRejected || isAccepted}
            >
              Скрининг
            </Button>
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => updateHR.mutate({ id: app.id, data: { pipeline_stage: 'interview' } })}
              disabled={updateHR.isPending || isRejected || isAccepted}
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
              disabled={updateStatus.isPending || isAccepted}
            >
              Принять
            </Button>
            <Button
              size="xs"
              color="red"
              variant="subtle"
              onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected' })}
              loading={updateStatus.isPending}
              disabled={updateStatus.isPending || isRejected}
            >
              Отклонить
            </Button>
          </Group>
        </Stack>
      </Group>

      <AISummaryBlock app={app} />
    </Card>
  );
}

export function ApplicationsTab() {
  const { data: applications, isLoading, isError } = useHRApplications();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text mt="md" c="red">Ошибка загрузки откликов</Text>;

  return (
    <Stack mt="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">Все отклики</Text>
        {applications && (
          <Text size="sm" c="dimmed">
            {applications.length}&nbsp;отклик
            {applications.length === 1 ? '' : applications.length >= 2 && applications.length <= 4 ? 'а' : 'ов'}
          </Text>
        )}
      </Group>

      {!applications?.length && (
        <Text size="sm" c="dimmed" ta="center" py="xl">Откликов пока нет.</Text>
      )}

      {applications?.map((app) => (
        <ApplicationRow key={app.id} app={app} />
      ))}
    </Stack>
  );
}
