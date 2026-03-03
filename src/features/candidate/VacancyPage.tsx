import { useParams } from 'react-router-dom';
import { Container, Title, Text, Card, Badge, Group, Loader, Center, Stack } from '@mantine/core';
import { useCandidateVacancy } from './api';

export function VacancyPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data, isLoading, isError, error } = useCandidateVacancy(id);

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

  return (
    <Container size="md" py="md">
      <Card withBorder shadow="sm">
        <Group justify="space-between" mb="md">
          <Title order={2}>{v.title}</Title>
          <Badge color={v.is_active ? 'green' : 'gray'}>
            {v.is_active ? 'Активна' : 'Неактивна'}
          </Badge>
        </Group>

        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            ID вакансии: {v.id}
          </Text>

          <div>
            <Text fw={500} mb={4}>Описание</Text>
            <Text size="sm">{v.description}</Text>
          </div>

          {v.required_skills.length > 0 && (
            <div>
              <Text fw={500} mb={4}>Требуемые навыки</Text>
              <Group gap="xs">
                {v.required_skills.map((s) => (
                  <Badge key={s} variant="light">
                    {s}
                  </Badge>
                ))}
              </Group>
            </div>
          )}

          <Text size="xs" c="dimmed" mt="md">
            Создана: {new Date(v.created_at).toLocaleString('ru-RU')}
          </Text>
        </Stack>
      </Card>
    </Container>
  );
}
