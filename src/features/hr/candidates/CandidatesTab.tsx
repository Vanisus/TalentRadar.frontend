import {
  Stack,
  Card,
  Group,
  Text,
  Badge,
  Loader,
  Center,
  Button,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useHRCandidates } from './candidatesApi';
import { SavedSearchesSection } from './SavedSearchesSection';
import type { HRCandidate } from '../types';

// ─── Карточка кандидата ──────────────────────────────────────────────────────

function CandidateCard({ candidate }: { candidate: HRCandidate }) {
  const navigate = useNavigate();

  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text fw={500}>{candidate.full_name ?? 'Имя не указано'}</Text>
          <Text size="sm" c="dimmed">
            {candidate.email}
          </Text>
          {candidate.desired_position && (
            <Text size="sm">Желаемая должность: {candidate.desired_position}</Text>
          )}
          {candidate.city && (
            <Text size="sm" c="dimmed">
              Город: {candidate.city}
            </Text>
          )}
          {candidate.phone && <Text size="sm">Телефон: {candidate.phone}</Text>}
        </Stack>

        <Stack gap="xs" align="flex-end">
          {candidate.desired_salary != null && (
            <Badge variant="light" color="blue">
              {candidate.desired_salary.toLocaleString('ru-RU')} ₽
            </Badge>
          )}
          <Button
            size="xs"
            variant="light"
            onClick={() => navigate(`/hr/candidates/${candidate.id}`)}
          >
            Открыть
          </Button>
        </Stack>
      </Group>
    </Card>
  );
}

// ─── Вкладка Кандидаты ───────────────────────────────────────────────────────

export function CandidatesTab() {
  const { data: candidates, isLoading, isError } = useHRCandidates();

  if (isLoading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Text c="red" mt="md">
        Ошибка загрузки кандидатов
      </Text>
    );
  }

  if (!candidates?.length) {
    return (
      <Text mt="md" c="dimmed">
        Кандидатов пока нет.
      </Text>
    );
  }

  return (
    <Stack mt="md">
      <Text fw={600} size="lg">
        Кандидаты
      </Text>
      {candidates.map((c) => (
        <CandidateCard key={c.id} candidate={c} />
      ))}
      <SavedSearchesSection />

    </Stack>
  );
}
