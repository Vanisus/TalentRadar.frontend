import { useState } from 'react';
import { Card, Group, Text, Button, Stack } from '@mantine/core';
import {
  useExperiences,
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
  type WorkExperienceRead,
  type WorkExperienceCreate,
} from './experienceApi';
import { ExperienceForm } from './ExperienceForm';
import { formatDateDisplay } from '@/shared/dateUtils';

function ExperienceItem({ exp }: { exp: WorkExperienceRead }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateExperience();
  const remove = useDeleteExperience();

  const period = exp.is_current
    ? `${formatMonthYear(exp.start_date)} — по настоящее время`
    : exp.end_date
    ? `${formatMonthYear(exp.start_date)} — ${formatMonthYear(exp.end_date)}`
    : formatMonthYear(exp.start_date);


  if (editing) {
    return (
      <Card withBorder p="md" radius="md">
        <ExperienceForm
          initial={exp}
          isLoading={update.isLoading}
          onSubmit={(values) =>
            update.mutate(
              { id: exp.id, ...values },
              { onSuccess: () => setEditing(false) },
            )
          }
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Text fw={500}>{exp.position}</Text>
          <Text size="sm">{exp.company}</Text>
          <Text size="xs" c="dimmed">{period}</Text>
          {exp.description && <Text size="sm" mt={4}>{exp.description}</Text>}
        </Stack>
        <Group gap="xs">
          <Button size="xs" variant="subtle" onClick={() => setEditing(true)}>
            Редактировать
          </Button>
          <Button
            size="xs"
            color="red"
            variant="subtle"
            loading={remove.isLoading}
            onClick={() => remove.mutate(exp.id)}
          >
            Удалить
          </Button>
        </Group>
      </Group>
    </Card>
  );
}

export function ExperienceList() {
  const { data: experiences } = useExperiences();
  const add = useAddExperience();
  const [creating, setCreating] = useState(false);

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={600} size="lg">Опыт работы</Text>
        <Button size="xs" onClick={() => setCreating(true)} disabled={creating}>
          + Добавить
        </Button>
      </Group>

      {creating && (
        <Card withBorder p="md" radius="md">
          <ExperienceForm
            initial={null}
            isLoading={add.isLoading}
            onSubmit={(values) =>
              add.mutate(values, { onSuccess: () => setCreating(false) })
            }
            onCancel={() => setCreating(false)}
          />
        </Card>
      )}

      {experiences?.map((exp) => (
        <ExperienceItem key={exp.id} exp={exp} />
      ))}

      {!experiences?.length && !creating && (
        <Text size="sm" c="dimmed">Опыт работы не добавлен</Text>
      )}
    </Stack>
  );
}

function formatMonthYear(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months: Record<string, string> = {
    '01': 'Январь', '02': 'Февраль', '03': 'Март',
    '04': 'Апрель', '05': 'Май', '06': 'Июнь',
    '07': 'Июль', '08': 'Август', '09': 'Сентябрь',
    '10': 'Октябрь', '11': 'Ноябрь', '12': 'Декабрь',
  };
  return `${months[month] ?? month} ${year}`;
}
