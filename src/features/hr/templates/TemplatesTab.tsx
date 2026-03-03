import { useState } from 'react';
import {
  Stack,
  Card,
  Group,
  Text,
  Badge,
  Button,
  TextInput,
  Textarea,
  Switch,
  Loader,
  Center,
} from '@mantine/core';
import {
  useHRTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useCreateVacancyFromTemplate,
  type HRVacancyTemplate,
  type HRVacancyTemplateCreate,
} from '../hrApi';

// ─── Форма шаблона ───────────────────────────────────────────────────────────

interface TemplateFormProps {
  initial?: HRVacancyTemplate | null;
  onSubmit: (values: HRVacancyTemplateCreate) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function TemplateForm({ initial, onSubmit, onCancel, isLoading }: TemplateFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [skillsInput, setSkillsInput] = useState(
    initial?.required_skills?.join(', ') ?? '',
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const required_skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({ name, title, description, required_skills, is_active: isActive });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
            label="Название шаблона"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            />

            <TextInput
            label="Название вакансии по умолчанию"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            required
            />
        <Textarea
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={3}
          autosize
        />
        <TextInput
          label="Требуемые навыки (через запятую)"
          placeholder="Python, FastAPI, PostgreSQL"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.currentTarget.value)}
        />
        <Switch
          label="Активен по умолчанию"
          checked={isActive}
          onChange={(e) => setIsActive(e.currentTarget.checked)}
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" loading={isLoading}>
            Сохранить
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// ─── Карточка шаблона ────────────────────────────────────────────────────────

function TemplateCard({ template }: { template: HRVacancyTemplate }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateTemplate();
  const remove = useDeleteTemplate();
  const createFromTemplate = useCreateVacancyFromTemplate();

  if (editing) {
    return (
      <Card withBorder p="md" radius="md">
        <TemplateForm
          initial={template}
          isLoading={update.isPending}
          onSubmit={(values) =>
            update.mutate(
              { id: template.id, ...values },
              { onSuccess: () => setEditing(false) },
            )
          }
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  const handleCreateVacancy = () => {
    createFromTemplate.mutate({ templateId: template.id, data: {} });
  };

  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Group gap="xs">
            <Text fw={500}>{template.name}</Text>
            <Badge variant="light" size="sm">{template.title}</Badge>
            <Badge color={template.is_active ? 'green' : 'gray'}>
                {template.is_active ? 'Активен' : 'Неактивен'}
            </Badge>
          </Group>
          <Text size="sm">{template.description}</Text>
          <Group gap="xs" mt={4}>
            {template.required_skills.map((s) => (
              <Badge key={s} variant="light" size="sm">
                {s}
              </Badge>
            ))}
          </Group>
          <Text size="xs" c="dimmed" mt={4}>
            Создан:{' '}
            {new Date(template.created_at).toLocaleDateString('ru-RU')}
          </Text>
        </Stack>
        <Stack gap="xs" align="flex-end">
          <Button
            size="xs"
            variant="light"
            onClick={handleCreateVacancy}
            loading={createFromTemplate.isPending}
          >
            Создать вакансию
          </Button>
          <Group gap="xs">
            <Button size="xs" variant="subtle" onClick={() => setEditing(true)}>
              Редактировать
            </Button>
            <Button
              size="xs"
              color="red"
              variant="subtle"
              loading={remove.isPending}
              onClick={() => remove.mutate(template.id)}
            >
              Удалить
            </Button>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}

// ─── Вкладка шаблонов ────────────────────────────────────────────────────────

export function TemplatesTab() {
  const { data: templates, isLoading, isError } = useHRTemplates();
  const create = useCreateTemplate();
  const [creating, setCreating] = useState(false);

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">Ошибка загрузки шаблонов</Text>;

  return (
    <Stack mt="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">Шаблоны вакансий</Text>
        <Button size="sm" onClick={() => setCreating(true)} disabled={creating}>
          + Создать шаблон
        </Button>
      </Group>

      {creating && (
        <Card withBorder p="md" radius="md">
          <TemplateForm
            initial={null}
            isLoading={create.isPending}
            onSubmit={(values) =>
              create.mutate(values, { onSuccess: () => setCreating(false) })
            }
            onCancel={() => setCreating(false)}
          />
        </Card>
      )}

      {!templates?.length && !creating && (
        <Text size="sm" c="dimmed">
          Шаблонов пока нет. Создайте первый!
        </Text>
      )}

      {templates?.map((t) => (
        <TemplateCard key={t.id} template={t} />
      ))}
    </Stack>
  );
}
