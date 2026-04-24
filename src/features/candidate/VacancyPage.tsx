import { useParams } from 'react-router-dom';
import {
  Container, Title, Text, Card, Badge, Group, Loader, Center,
  Stack, Button, Divider, ThemeIcon, Box,
} from '@mantine/core';
import { useCandidateVacancy, useCandidateApplications, useApplyToVacancy } from './api';
import { MatchScoreBadge } from '../../shared/MatchScoreBadge';

export function VacancyPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading, isError, error } = useCandidateVacancy(id);
  const { data: applications } = useCandidateApplications();
  const applyMutation = useApplyToVacancy();

  if (isNaN(id)) {
    return <Text mt="md">Некорректный идентификатор вакансии.</Text>;
  }

  if (isLoading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <Container mt="md">
        <Text c="red">{(error as Error)?.message || 'Вакансия не найдена'}</Text>
      </Container>
    );
  }

  const v = data;
  const app = applications?.find((a) => a.vacancy_id === v.id);
  const isApplied = !!app;

  const statusColors: Record<string, string> = {
    new: 'blue',
    under_review: 'yellow',
    accepted: 'green',
    rejected: 'red',
  };
  const statusLabels: Record<string, string> = {
    new: 'На рассмотрении',
    under_review: 'В обработке',
    accepted: 'Принято',
    rejected: 'Отклонено',
  };

  return (
    <Container size="md" py="xl">
      <Card withBorder shadow="md" radius="lg" p="xl">
        {/* Заголовок */}
        <Group justify="space-between" mb="md" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Title order={2} mb={6}>{v.title}</Title>
            <Group gap="xs">
              <Badge
                color={v.is_active ? 'green' : 'gray'}
                variant="light"
                size="sm"
              >
                {v.is_active ? '● Активна' : '○ Закрыта'}
              </Badge>
              <MatchScoreBadge score={v.match_score} size="sm" />
            </Group>
          </Box>
        </Group>

        <Divider mb="md" />

        {/* Описание */}
        <Stack gap="lg">
          <div>
            <Text fw={600} size="sm" c="dimmed" mb={6} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              Описание
            </Text>
            <Text size="sm" style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {v.description}
            </Text>
          </div>

          {/* Навыки */}
          {v.required_skills.length > 0 && (
            <div>
              <Text fw={600} size="sm" c="dimmed" mb={8} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                Требуемые навыки
              </Text>
              <Group gap="xs">
                {v.required_skills.map((s) => (
                  <Badge key={s} variant="light" size="md">
                    {s}
                  </Badge>
                ))}
              </Group>
            </div>
          )}

          <Divider />

          {/* Кнопка отклика */}
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              Создана: {new Date(v.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>

            {isApplied ? (
              <Group gap="xs">
                <ThemeIcon color={statusColors[app.status] ?? 'gray'} variant="light" size="sm" radius="xl">
                  ✓
                </ThemeIcon>
                <Text size="sm" c="dimmed">
                  {statusLabels[app.status] ?? app.status}
                </Text>
              </Group>
            ) : (
              <Button
                disabled={!v.is_active || applyMutation.isPending}
                loading={applyMutation.isPending}
                onClick={() => applyMutation.mutate({ vacancy_id: v.id })}
                radius="md"
              >
                Откликнуться
              </Button>
            )}
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
