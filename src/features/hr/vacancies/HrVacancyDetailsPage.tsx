import { useParams, useNavigate } from 'react-router-dom';
import { Card, Stack, Group, Title, Text, Badge, Button, Loader, Center } from '@mantine/core';
import { useHRVacancies } from '../hrApi';
import { VacancyApplicationsSection } from '../applications/VacancyApplicationsSection';

export function HrVacancyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vacancyId = id ? Number(id) : NaN;

  const { data: vacancies, isLoading, isError } = useHRVacancies();

  if (!id || Number.isNaN(vacancyId)) {
    return (
      <Center mt="xl">
        <Text>Неверный ID вакансии</Text>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center mt="xl">
        <Text c="red">Ошибка загрузки вакансий</Text>
      </Center>
    );
  }

  const vacancy = vacancies?.find((v) => v.id === vacancyId);

  if (!vacancy) {
    return (
      <Center mt="xl">
        <Stack align="center">
          <Text>Вакансия не найдена</Text>
          <Button variant="subtle" onClick={() => navigate(-1)}>
            Назад
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack p="md">
      <Button variant="subtle" size="xs" onClick={() => navigate(-1)}>
        ← Назад
      </Button>

      <Card withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Group gap="xs">
                <Title order={3}>{vacancy.title}</Title>
                <Badge color={vacancy.is_active ? 'green' : 'gray'}>
                  {vacancy.is_active ? 'Активна' : 'Неактивна'}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                ID: {vacancy.id}
              </Text>
            </Stack>
          </Group>

          {vacancy.description && (
            <Text size="sm">{vacancy.description}</Text>
          )}

          {vacancy.required_skills?.length > 0 && (
            <Group gap="xs">
              {vacancy.required_skills.map((s) => (
                <Badge key={s} variant="light" size="sm">
                  {s}
                </Badge>
              ))}
            </Group>
          )}

          <Text size="xs" c="dimmed">
            Создана:{' '}
            {new Date(vacancy.created_at).toLocaleDateString('ru-RU')}
          </Text>
        </Stack>
      </Card>

      <VacancyApplicationsSection vacancyId={vacancy.id} />
    </Stack>
  );
}
