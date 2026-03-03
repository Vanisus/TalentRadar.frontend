import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Loader,
  Center,
} from '@mantine/core';
import { useHRCandidates } from './candidatesApi';
import { CandidateNotesSection } from './CandidateNotesSection';
import { CandidateTagsSection } from './CandidateTagsSection';

export function HrCandidatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidateId = id ? Number(id) : NaN;

  const { data: candidates, isLoading, isError } = useHRCandidates();

  if (!id || Number.isNaN(candidateId)) {
    return (
      <Center mt="xl">
        <Text>Неверный ID кандидата</Text>
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
        <Text c="red">Ошибка загрузки кандидатов</Text>
      </Center>
    );
  }

  const candidate = candidates?.find((c) => c.id === candidateId);

  if (!candidate) {
    return (
      <Center mt="xl">
        <Stack align="center">
          <Text>Кандидат не найден</Text>
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
                <Text fw={600} size="lg">
                  {candidate.full_name || candidate.email}
                </Text>
                {candidate.city && (
                  <Badge variant="light" size="sm">
                    {candidate.city}
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed">
                ID: {candidate.id} · Email: {candidate.email}
              </Text>
            </Stack>
          </Group>

          {candidate.desired_position && (
            <Text size="sm">
              Желаемая позиция: {candidate.desired_position}
            </Text>
          )}
          {candidate.desired_salary != null && (
            <Text size="sm">
              Ожидаемая зарплата: {candidate.desired_salary}
            </Text>
          )}
          {candidate.phone && (
            <Text size="sm">Телефон: {candidate.phone}</Text>
          )}
        </Stack>
      </Card>

      <CandidateTagsSection candidateId={candidate.id} />
      <CandidateNotesSection candidateId={candidate.id} />
    </Stack>
  );
}
