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
  IconLayoutGrid,
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
          leftSection={<IconLayoutGrid size={16} />}
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
          <Button type="submit" loading={isLoading} leftSection={<IconLayoutGrid size={16} />}>
            {initial ? 'Сохранить изменения' : 'Создать шаблон'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// … остальной код TemplateCard и TemplatesTab без изменений

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
            <IconLayoutGrid size={24} />
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
