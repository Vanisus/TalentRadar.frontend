import { useState } from 'react';
import {
  Stack,
  Card,
  Group,
  Title,
  Text,
  Badge,
  Button,
  TextInput,
  Textarea,
  Switch,
  Loader,
  Center,
  Select,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {
  useHRVacancies,
  useCreateVacancy,
  useUpdateVacancy,
  useDeleteVacancy,
  useHRTemplates,
  type HRVacancy,
  type HRVacancyCreate,
} from '../hrApi';

// ─── Форма вакансии ───────────────────────────────────────────────────────────

interface VacancyFormProps {
  initial?: HRVacancy | null;
  onSubmit: (values: HRVacancyCreate) => void;
  onCancel: () => void;
  isLoading?: boolean;
  templates?: {
    id: number;
    name: string;
    title: string;
    description: string;
    required_skills: string[];
    is_active: boolean;
  }[];
}

function VacancyForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
  templates,
}: VacancyFormProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [skillsInput, setSkillsInput] = useState(
    initial?.required_skills?.join(', ') ?? '',
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const handleTemplateChange = (value: string | null) => {
    setSelectedTemplateId(value);
    if (!value || !templates?.length) return;

    const id = Number(value);
    const tmpl = templates.find((t) => t.id === id);
    if (!tmpl) return;

    setTitle(tmpl.title);
    setDescription(tmpl.description);
    setSkillsInput(tmpl.required_skills.join(', '));
    setIsActive(tmpl.is_active);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const required_skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({ title, description, required_skills, is_active: isActive });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        {templates && templates.length > 0 && (
          <Select
            label="Создать из шаблона"
            placeholder="Не использовать шаблон"
            data={templates.map((t) => ({
              value: String(t.id),
              label: t.name,
            }))}
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            clearable
          />
        )}

        <TextInput
          label="Название вакансии"
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
          label="Активна"
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

// ─── Карточка вакансии ────────────────────────────────────────────────────────

function VacancyCard({ vacancy }: { vacancy: HRVacancy }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateVacancy();
  const remove = useDeleteVacancy();
  const navigate = useNavigate();

  if (editing) {
    return (
      <Card withBorder p="md" radius="md">
        <VacancyForm
          initial={vacancy}
          isLoading={update.isPending}
          onSubmit={(values) =>
            update.mutate(
              { id: vacancy.id, ...values },
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
        <Stack gap={4}>
          <Group gap="xs">
            <Title order={5}>{vacancy.title}</Title>
            <Badge color={vacancy.is_active ? 'green' : 'gray'}>
              {vacancy.is_active ? 'Активна' : 'Неактивна'}
            </Badge>
          </Group>
          <Text size="sm">{vacancy.description}</Text>
          <Group gap="xs" mt={4}>
            {vacancy.required_skills.map((s) => (
              <Badge key={s} variant="light" size="sm">
                {s}
              </Badge>
            ))}
          </Group>
          <Text size="xs" c="dimmed" mt={4}>
            Создана: {new Date(vacancy.created_at).toLocaleDateString('ru-RU')}
          </Text>
        </Stack>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            onClick={() => navigate(`/hr/vacancies/${vacancy.id}`)}
          >
            Открыть
          </Button>
          <Button size="xs" variant="subtle" onClick={() => setEditing(true)}>
            Редактировать
          </Button>
          <Button
            size="xs"
            color="red"
            variant="subtle"
            loading={remove.isPending}
            onClick={() => remove.mutate(vacancy.id)}
          >
            Удалить
          </Button>
        </Group>
      </Group>
    </Card>
  );
}

// ─── Вкладка вакансии ─────────────────────────────────────────────────────────

export function VacanciesTab() {
  const { data: vacancies, isLoading } = useHRVacancies();
  const create = useCreateVacancy();
  const [creating, setCreating] = useState(false);

  const { data: templates } = useHRTemplates();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;

  return (
    <Stack mt="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">
          Мои вакансии
        </Text>
        <Button size="sm" onClick={() => setCreating(true)} disabled={creating}>
          + Создать вакансию
        </Button>
      </Group>

      {creating && (
        <Card withBorder p="md" radius="md">
          <VacancyForm
            initial={null}
            templates={templates ?? []}
            isLoading={create.isPending}
            onSubmit={(values) =>
              create.mutate(values, {
                onSuccess: () => {
                  setCreating(false);
                },
              })
            }
            onCancel={() => setCreating(false)}
          />
        </Card>
      )}

      {!vacancies?.length && !creating && (
        <Text size="sm" c="dimmed">
          Вакансий пока нет. Создайте первую!
        </Text>
      )}

      {vacancies?.map((v) => (
        <VacancyCard key={v.id} vacancy={v} />
      ))}
    </Stack>
  );
}
