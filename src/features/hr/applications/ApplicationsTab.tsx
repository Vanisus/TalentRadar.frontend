import { useState } from 'react';
import {
  Stack, Card, Group, Text, Badge, Select,
  Loader, Center, Button
} from '@mantine/core';
import {
  useHRApplications,
  useUpdateApplicationStatus,
  type HRApplication,
  type ApplicationStatus,
} from '../hrApi';

function statusLabel(status: ApplicationStatus) {
  switch (status) {
    case 'new': return 'Новая';
    case 'under_review': return 'На рассмотрении';
    case 'accepted': return 'Принята';
    case 'rejected': return 'Отклонена';
    default: return status;
  }
}

function statusColor(status: ApplicationStatus) {
  switch (status) {
    case 'new': return 'blue';
    case 'under_review': return 'yellow';
    case 'accepted': return 'green';
    case 'rejected': return 'red';
    default: return 'gray';
  }
}

const statusOptions = [
  { value: 'new', label: 'Новая' },
  { value: 'under_review', label: 'На рассмотрении' },
  { value: 'accepted', label: 'Принята' },
  { value: 'rejected', label: 'Отклонена' },
];

function ApplicationCard({ app }: { app: HRApplication }) {
  const [editing, setEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(app.status);
  const updateStatus = useUpdateApplicationStatus();

  const handleSave = () => {
    updateStatus.mutate(
      { id: app.id, status: selectedStatus as ApplicationStatus },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text fw={500}>Отклик #{app.id}</Text>
          <Text size="sm">Вакансия #{app.vacancy_id}</Text>
          <Text size="sm">Кандидат #{app.candidate_id}</Text>
          <Text size="sm">Match score: {app.match_score.toFixed(1)}%</Text>
          {app.pipeline_stage && (
            <Text size="sm" c="dimmed">Этап: {app.pipeline_stage}</Text>
          )}
          {app.match_summary && (
            <Text size="sm" c="dimmed" mt={4}>{app.match_summary}</Text>
          )}
          {app.rating != null && (
            <Text size="sm">Оценка: {app.rating}/5</Text>
          )}
          <Text size="xs" c="dimmed">
            {new Date(app.created_at).toLocaleDateString('ru-RU')}
          </Text>
        </Stack>

        <Stack gap="xs" align="flex-end">
          {!editing ? (
            <>
              <Badge color={statusColor(app.status)}>
                {statusLabel(app.status)}
              </Badge>
              <Button size="xs" variant="subtle" onClick={() => setEditing(true)}>
                Изменить статус
              </Button>
            </>
          ) : (
            <>
              <Select
                data={statusOptions}
                value={selectedStatus}
                onChange={(v) => setSelectedStatus(v ?? app.status)}
                size="xs"
                w={160}
              />
              <Group gap="xs">
                <Button
                  size="xs"
                  loading={updateStatus.isPending}
                  onClick={handleSave}
                >
                  Сохранить
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={() => setEditing(false)}
                >
                  Отмена
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Group>
    </Card>
  );
}

export function ApplicationsTab() {
  const { data: applications, isLoading, isError } = useHRApplications();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">Ошибка загрузки откликов</Text>;
  if (!applications?.length) {
    return <Text mt="md" c="dimmed">Откликов пока нет.</Text>;
  }

  return (
    <Stack mt="md">
      <Text fw={600} size="lg">Отклики на вакансии</Text>
      {applications.map((app) => (
        <ApplicationCard key={app.id} app={app} />
      ))}
    </Stack>
  );
}
