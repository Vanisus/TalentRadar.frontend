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
  Modal,
  ActionIcon,
  Tooltip,
  ThemeIcon,
  Box,
  Title,
  SimpleGrid,
  Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconLayoutTemplate,
  IconBriefcase,
  IconCode,
  IconCalendar,
  IconCopy,
} from '@tabler/icons-react';
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
  const [skillsInput, setSkillsInput] = useState(initial?.required_skills?.join(', ') ?? '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const required_skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    onSubmit({ name, title, description, required_skills, is_active: isActive });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Название шаблона"
          description="Внутреннее название для идентификации"
          placeholder="Например: Backend разработчик (базовый)"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          leftSection={<IconLayoutTemplate size={16} />}
        />

        <Divider label="Данные вакансии" labelPosition="center" />

        <TextInput
          label="Название вакансии по умолчанию"
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
          label="Вакансия активна по умолчанию"
          description="При создании вакансии из шаблона она сразу будет активной"
          checked={isActive}
          onChange={(e) => setIsActive(e.currentTarget.checked)}
          color="violet"
        />
        <Group justify="flex-end" pt={4}>
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" loading={isLoading} leftSection={<IconLayoutTemplate size={16} />}>
            {initial ? 'Сохранить изменения' : 'Создать шаблон'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// ─── Карточка шаблона ────────────────────────────────────────────────────────

function TemplateCard({ template }: { template: HRVacancyTemplate }) {
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const update = useUpdateTemplate();
  const remove = useDeleteTemplate();
  const createFromTemplate = useCreateVacancyFromTemplate();

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
            <Text fw={600}>Редактировать шаблон</Text>
          </Group>
        }
        size="lg"
        radius="md"
      >
        <TemplateForm
          initial={template}
          isLoading={update.isPending}
          onSubmit={(values) =>
            update.mutate({ id: template.id, ...values }, { onSuccess: closeEdit })
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
            <Text fw={600}>Удалить шаблон?</Text>
          </Group>
        }
        size="sm"
        radius="md"
      >
        <Text size="sm" c="dimmed" mb="md">
          Шаблон <b>«{template.name}»</b> будет удалён без возможности восстановления.
          Ранее созданные из него вакансии останутся.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={closeDelete}>Отмена</Button>
          <Button
            color="red"
            loading={remove.isPending}
            onClick={() => remove.mutate(template.id, { onSuccess: closeDelete })}
          >
            Удалить
          </Button>
        </Group>
      </Modal>

      <Card withBorder p="lg" radius="md">
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            {/* Заголовок */}
            <Group gap="sm" mb={6}>
              <ThemeIcon size="md" variant="light" color="violet" radius="sm">
                <IconLayoutTemplate size={16} />
              </ThemeIcon>
              <Box>
                <Text fw={600} size="sm" style={{ lineHeight: 1.3 }}>{template.name}</Text>
                <Text size="xs" c="dimmed">→ {template.title}</Text>
              </Box>
              <Badge
                size="sm"
                variant={template.is_active ? 'light' : 'outline'}
                color={template.is_active ? 'green' : 'gray'}
                ml="auto"
              >
                {template.is_active ? 'Активен' : 'Неактивен'}
              </Badge>
            </Group>

            {template.description && (
              <Text size="sm" c="dimmed" lineClamp={2} mb={8}>
                {template.description}
              </Text>
            )}

            {/* Навыки */}
            {template.required_skills.length > 0 && (
              <Group gap={6} wrap="wrap" mb={8}>
                {template.required_skills.map((s) => (
                  <Badge key={s} variant="light" size="sm" color="indigo" radius="sm">
                    {s}
                  </Badge>
                ))}
              </Group>
            )}

            <Group gap={4}>
              <IconCalendar size={12} color="gray" />
              <Text size="xs" c="dimmed">
                {new Date(template.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            </Group>
          </Box>

          {/* Кнопки */}
          <Stack gap="xs" align="flex-end">
            <Tooltip label="Создать вакансию из шаблона" withArrow>
              <Button
                size="xs"
                variant="light"
                color="violet"
                leftSection={<IconCopy size={14} />}
                loading={createFromTemplate.isPending}
                onClick={() => createFromTemplate.mutate({ templateId: template.id, data: {} })}
              >
                Создать вакансию
              </Button>
            </Tooltip>
            <Group gap="xs">
              <Tooltip label="Редактировать" withArrow>
                <ActionIcon variant="light" color="blue" onClick={openEdit} aria-label="Edit">
                  <IconPencil size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Удалить" withArrow>
                <ActionIcon variant="light" color="red" onClick={openDelete} aria-label="Delete">
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Stack>
        </Group>
      </Card>
    </>
  );
}

// ─── Вкладка шаблонов ────────────────────────────────────────────────────────

export function TemplatesTab() {
  const { data: templates, isLoading, isError } = useHRTemplates();
  const create = useCreateTemplate();
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">Ошибка загрузки шаблонов</Text>;

  return (
    <Stack mt="md" gap="lg">
      {/* Шапка */}
      <Group justify="space-between" align="flex-end">
        <Box>
          <Title order={4} mb={2}>Шаблоны вакансий</Title>
          <Text size="sm" c="dimmed">
            Создайте шаблон один раз — используйте многократно
          </Text>
        </Box>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreate}
          variant="filled"
        >
          Создать шаблон
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
            <Text fw={600}>Новый шаблон</Text>
          </Group>
        }
        size="lg"
        radius="md"
      >
        <TemplateForm
          initial={null}
          isLoading={create.isPending}
          onSubmit={(values) =>
            create.mutate(values, { onSuccess: closeCreate })
          }
          onCancel={closeCreate}
        />
      </Modal>

      {!templates?.length && (
        <Card withBorder p="xl" radius="md" ta="center">
          <ThemeIcon size={48} variant="light" color="violet" radius="xl" mb="md" mx="auto">
            <IconLayoutTemplate size={24} />
          </ThemeIcon>
          <Text fw={600} mb={4}>Шаблонов пока нет</Text>
          <Text size="sm" c="dimmed" mb="lg">
            Шаблоны позволяют быстро создавать вакансии с готовыми полями
          </Text>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate} mx="auto">
            Создать первый шаблон
          </Button>
        </Card>
      )}

      <SimpleGrid cols={{ base: 1, md: 1 }} spacing="md">
        {templates?.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
