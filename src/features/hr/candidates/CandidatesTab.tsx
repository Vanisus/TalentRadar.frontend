import { Stack, Card, Group, Text, Badge, Loader, Center } from '@mantine/core';
import { useHRCandidates } from '../hrApi';

export function CandidatesTab() {
  const { data: candidates, isLoading, isError } = useHRCandidates();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">Ошибка загрузки кандидатов</Text>;
  if (!candidates?.length) {
    return <Text mt="md" c="dimmed">Кандидатов пока нет.</Text>;
  }

  return (
    <Stack mt="md">
      <Text fw={600} size="lg">Кандидаты</Text>
      {candidates.map((c) => (
        <Card key={c.id} withBorder p="md" radius="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
              <Text fw={500}>{c.full_name ?? 'Имя не указано'}</Text>
              <Text size="sm" c="dimmed">{c.email}</Text>
              {c.desired_position && (
                <Text size="sm">Желаемая должность: {c.desired_position}</Text>
              )}
              {c.city && (
                <Text size="sm" c="dimmed">Город: {c.city}</Text>
              )}
              {c.phone && (
                <Text size="sm">Телефон: {c.phone}</Text>
              )}
            </Stack>
            {c.desired_salary && (
              <Badge variant="light" color="blue">
                {c.desired_salary.toLocaleString('ru-RU')} ₽
              </Badge>
            )}
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
