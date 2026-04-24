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
  Divider,
  Modal,
  ActionIcon,
  Tooltip,
  SimpleGrid,
  ThemeIcon,
  Box,
  Collapse,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconExternalLink,
  IconChevronDown,
  IconChevronUp,
  IconLayoutGrid,
  IconBriefcase,
  IconCode,
  IconCalendar,
} from '@tabler/icons-react';
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

function VacancyForm({ initial, onSubmit, onCancel, isLoading, templates }: VacancyFormProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [skillsInput, setSkillsInput] = useState(initial?.required_skills?.join(', ') ?? '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const handleTemplateChange = (value: string | null) => {
    setSelectedTemplateId(value);
    if (!value || !templates?.length) return;
    const tmpl = templates.find((t) => t.id === Number(value));
    if (!tmpl) return;
    setTitle(tmpl.title);
    setDescription(tmpl.description);
    setSkillsInput(tmpl.required_skills.join(', '));
    setIsActive(tmpl.is_active);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const required_skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    onSubmit({ title, description, required_skills, is_active: isActive });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {templates && templates.length > 0 && (
          <Box>
            <Group gap="xs" mb={6}>
              <ThemeIcon size="xs" variant="light" color="violet">
                <IconLayoutGrid size={12} />
              </ThemeIcon>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                Использовать шаблон
              </Text>
            </Group>
            <Select
              placeholder="Не использовать шаблон"
              data={templates.map((t) => ({ value: String(t.id), label: t.name }))}
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              clearable
            />
          </Box>
        )}

        <Divider />

        <TextInput
          label="Название вакансии"
          placeholder="Например: Senior Python Developer"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
          leftSection={<IconBriefcase size={16} />}
        />
        <Textarea
          label="Описание"
          placeholder="Опишите обязанности и требования..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={4}
          autosize
        />
        <TextInput
          label="Требуемые навыки (через запятую)"
          placeholder="Python, FastAPI, PostgreSQL, Docker"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.currentTarget.value)}
          leftSection={<IconCode size={16} />}
        />
        <Switch
          label="Вакансия активна"
          description="Кандидаты смогут видеть и откликаться на неё"
          checked={isActive}
          onChange={(e) => setIsActive(e.currentTarget.checked)}
          color="violet"
        />
        <Group justify="flex-end" pt={4}>
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" loading={isLoading} leftSection={<IconBriefcase size={16} />}>
            {initial ? 'Сохранить изменения' : 'Создать вакансию'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// ─── Карточка вакансии ────────────────────────────────────────────────────────

function VacancyCard({ vacancy }: { vacancy: HRVacancy }) {
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [skillsExpanded, { toggle: toggleSkills }] = useDisclosure(false);
  const update = useUpdateVacancy();
  const remove = useDeleteVacancy();
  const navigate = useNavigate();

  const visibleSkills = vacancy.required_skills.slice(0, 4);
  const hiddenSkills = vacancy.required_skills.slice(4);

  return (
    <>
      {/* Модальное окно редактирования */}
      <Modal
        opened={editOpened}
        onClose={closeEdit}
        title={
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="violet">
              <IconPencil size={14} />
            </ThemeIcon>
            <Text fw={600}>Редактировать вакансию</Text>
          </Group>
        }
        size="lg"
        radius="md"
      >
        <VacancyForm
          initial={vacancy}
          isLoading={update.isPending}
          onSubmit={(values) =>
            update.mutate({ id: vacancy.id, ...values }, { onSuccess: closeEdit })
          }
          onCancel={closeEdit}
        />
      </Modal>

      {/* Подтверждение удаления */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title={
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="red">
              <IconTrash size={14} />
            </ThemeIcon>
            <Text fw={600}>Удалить вакансию?</Text>
          </Group>
        }
        size="sm"
        radius="md"
      >
        <Text size="sm" c="dimmed" mb="md">
          Вакансия <b>«{vacancy.title}»</b> будет удалена без возможности восстановления.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={closeDelete}>Отмена</Button>
          <Button
            color="red"
            loading={remove.isPending}
            onClick={() => remove.mutate(vacancy.id, { onSuccess: closeDelete })}
          >
            Удалить
          </Button>
        </Group>
      </Modal>

      <Card withBorder p="lg" radius="md">
        <Group justify="space-between" align="flex-start" mb="sm">
          <Box style={{ flex: 1 }}>
            <Group gap="sm" mb={6}>
              <ThemeIcon size="md" variant="light" color={vacancy.is_active ? 'violet' : 'gray'} radius="sm">
                <IconBriefcase size={16} />
              </ThemeIcon>
              <Title order={5} style={{ lineHeight: 1.3 }}>{vacancy.title}</Title>
              <Badge
                size="sm"
                variant={vacancy.is_active ? 'light' : 'outline'}
                color={vacancy.is_active ? 'green' : 'gray'}
              >
                {vacancy.is_active ? 'Активна' : 'Неактивна'}
              </Badge>
            </Group>

            {vacancy.description && (
              <Text size="sm" c="dimmed" lineClamp={2} mb={8}>
                {vacancy.description}
              </Text>
            )}

            {/* Навыки */}
            {vacancy.required_skills.length > 0 && (
              <Box>
                <Group gap={6} wrap="wrap">
                  {visibleSkills.map((s) => (
                    <Badge key={s} variant="light" size="sm" color="violet" radius="sm">
                      {s}
                    </Badge>
                  ))}
                  {hiddenSkills.length > 0 && (
                    <Tooltip label={skillsExpanded ? 'Скрыть' : `Показать ещё ${hiddenSkills.length}`} withArrow>
                      <Badge
                        variant="outline"
                        size="sm"
                        color="gray"
                        radius="sm"
                        style={{ cursor: 'pointer' }}
                        onClick={toggleSkills}
                        rightSection={skillsExpanded ? <IconChevronUp size={10} /> : <IconChevronDown size={10} />}
                      >
                        +{hiddenSkills.length}
                      </Badge>
                    </Tooltip>
                  )}
                </Group>
                <Collapse in={skillsExpanded}>
                  <Group gap={6} wrap="wrap" mt={6}>
                    {hiddenSkills.map((s) => (
                      <Badge key={s} variant="light" size="sm" color="violet" radius="sm">{s}</Badge>
                    ))}
                  </Group>
                </Collapse>
              </Box>
            )}

            <Group gap={4} mt={8}>
              <IconCalendar size={12} color="gray" />
              <Text size="xs" c="dimmed">
                {new Date(vacancy.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            </Group>
          </Box>

          {/* Кнопки действий */}
          <Group gap="xs" align="flex-start">
            <Tooltip label="Открыть страницу" withArrow>
              <ActionIcon variant="light" color="violet" onClick={() => navigate(`/hr/vacancies/${vacancy.id}`)}
                aria-label="Open vacancy">
                <IconExternalLink size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Редактировать" withArrow>
              <ActionIcon variant="light" color="blue" onClick={openEdit} aria-label="Edit vacancy">
                <IconPencil size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Удалить" withArrow>
              <ActionIcon variant="light" color="red" onClick={openDelete} aria-label="Delete vacancy">
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Card>
    </>
  );
}

// ─── Вкладка вакансий ─────────────────────────────────────────────────────────

export function VacanciesTab() {
  const { data: vacancies, isLoading } = useHRVacancies();
  const create = useCreateVacancy();
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const { data: templates } = useHRTemplates();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;

  const activeCount = vacancies?.filter((v) => v.is_active).length ?? 0;
  const totalCount = vacancies?.length ?? 0;

  return (
    <Stack mt="md" gap="lg">
      {/* Шапка */}
      <Group justify="space-between" align="flex-end">
        <Box>
          <Title order={4} mb={2}>Мои вакансии</Title>
          <Group gap="md">
            <Text size="sm" c="dimmed">
              Всего: <b>{totalCount}</b>
            </Text>
            <Text size="sm" c="dimmed">
              Активных: <b style={{ color: 'var(--mantine-color-green-6)' }}>{activeCount}</b>
            </Text>
          </Group>
        </Box>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreate}
          variant="filled"
        >
          Создать вакансию
        </Button>
      </Group>

      {/* Модальное окно создания */}
      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title={
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="violet">
              <IconPlus size={14} />
            </ThemeIcon>
            <Text fw={600}>Новая вакансия</Text>
          </Group>
        }
        size="lg"
        radius="md"
      >
        <VacancyForm
          initial={null}
          templates={templates ?? []}
          isLoading={create.isPending}
          onSubmit={(values) =>
            create.mutate(values, { onSuccess: closeCreate })
          }
          onCancel={closeCreate}
        />
      </Modal>

      {!totalCount && (
        <Card withBorder p="xl" radius="md" ta="center">
          <ThemeIcon size={48} variant="light" color="violet" radius="xl" mb="md" mx="auto">
            <IconBriefcase size={24} />
          </ThemeIcon>
          <Text fw={600} mb={4}>Вакансий пока нет</Text>
          <Text size="sm" c="dimmed" mb="lg">
            Создайте первую вакансию, чтобы начать получать отклики
          </Text>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate} mx="auto">
            Создать первую вакансию
          </Button>
        </Card>
      )}

      <SimpleGrid cols={{ base: 1, md: 1 }} spacing="md">
        {vacancies?.map((v) => (
          <VacancyCard key={v.id} vacancy={v} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
