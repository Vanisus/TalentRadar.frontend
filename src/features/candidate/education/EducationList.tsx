import { useState } from 'react';
import { Card, Group, Text, Button, Stack } from '@mantine/core';
import {
  useEducations,
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
  type Education,
  type EducationCreate,
} from './educationApi';
import { EducationForm } from './EducationForm';
import { formatDateDisplay } from '@/shared/dateUtils';

function EducationItem({ edu }: { edu: Education }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateEducation();
  const remove = useDeleteEducation();

  // Заменить функцию period:
const period = edu.is_current
  ? `${edu.start_date?.slice(0, 4)} — по настоящее время`
  : edu.end_date
  ? `${edu.start_date?.slice(0, 4)} — ${edu.end_date?.slice(0, 4)}`
  : edu.start_date?.slice(0, 4) ?? '';


  if (editing) {
    return (
      <Card withBorder p="md" radius="md">
        <EducationForm
          initial={edu}
          isLoading={update.isLoading}
          onSubmit={(values) =>
            update.mutate(
              { id: edu.id, ...values },
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
          <Text fw={500}>{edu.institution}</Text>
          <Text size="sm">{edu.degree}</Text>
          {edu.field_of_study && (
            <Text size="sm" c="dimmed">{edu.field_of_study}</Text>
          )}
          <Text size="xs" c="dimmed">{period}</Text>
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
            onClick={() => remove.mutate(edu.id)}
          >
            Удалить
          </Button>
        </Group>
      </Group>
    </Card>
  );
}

export function EducationList() {
  const { data: educations } = useEducations();
  const add = useAddEducation();
  const [creating, setCreating] = useState(false);

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={600} size="lg">Образование</Text>
        <Button size="xs" onClick={() => setCreating(true)} disabled={creating}>
          + Добавить
        </Button>
      </Group>

      {creating && (
        <Card withBorder p="md" radius="md">
          <EducationForm
            initial={null}
            isLoading={add.isLoading}
            onSubmit={(values) =>
              add.mutate(values, { onSuccess: () => setCreating(false) })
            }
            onCancel={() => setCreating(false)}
          />
        </Card>
      )}

      {educations?.map((edu) => (
        <EducationItem key={edu.id} edu={edu} />
      ))}

      {!educations?.length && !creating && (
        <Text size="sm" c="dimmed">Образование не добавлено</Text>
      )}
    </Stack>
  );
}
