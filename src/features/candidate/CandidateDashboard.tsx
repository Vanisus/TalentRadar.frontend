// src/features/candidate/CandidateDashboard.tsx
import { useEffect, useState } from 'react';
import {
  Tabs, Container, Stack, Title, Text, Card, Badge,
  Group, Loader, Center, Button, Textarea, NumberInput, TextInput, Anchor,
  ThemeIcon, Timeline, Divider,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  IconCircleDot,
  IconSearch,
  IconCalendarEvent,
  IconGift,
  IconX,
  IconClock,
  IconCheck,
} from '@tabler/icons-react';
import type { ApplicationStatus } from './api';
import { useCandidateProfile, useUpdateCandidateProfile } from './profileApi';
import { PortfolioList } from './portfolio/PortfolioList';
import { CertificateList } from './certificates/CertificateList';
import { useResumeRecommendations, useUploadResume, useResumeStatus } from './resumeApi';
import { useSkills, useAddSkill, useDeleteSkill } from './portfolio/skillsApi';
import { useCandidateVacancies, useCandidateApplications, useApplyToVacancy } from './api';
import { ExperienceList } from './experience/ExperienceList';
import { EducationList } from './education/EducationList';
import { Link } from 'react-router-dom';
import { MatchScoreBadge } from '../../shared/MatchScoreBadge';

// ─── Конфиг статусов ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; icon: React.ReactNode; description: string }
> = {
  new: {
    label: 'Отправлен',
    color: 'blue',
    icon: <IconClock size={14} />,
    description: 'Отклик получен, ждёт рассмотрения HR',
  },
  under_review: {
    label: 'На рассмотрении',
    color: 'yellow',
    icon: <IconSearch size={14} />,
    description: 'HR изучает ваш профиль',
  },
  accepted: {
    label: 'Принят',
    color: 'green',
    icon: <IconCheck size={14} />,
    description: 'Поздравляем! Вас пригласили к следующему этапу',
  },
  rejected: {
    label: 'Отказ',
    color: 'red',
    icon: <IconX size={14} />,
    description: 'К сожалению, кандидатура не подошла',
  },
};

const PIPELINE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  new:        { label: 'Новый',              icon: <IconCircleDot size={14} />,    color: 'blue' },
  screening:  { label: 'Скрининг',           icon: <IconSearch size={14} />,        color: 'violet' },
  interview:  { label: 'Интервью',           icon: <IconCalendarEvent size={14} />, color: 'teal' },
  offer:      { label: 'Оффер',              icon: <IconGift size={14} />,          color: 'green' },
  rejected:   { label: 'Отказ',              icon: <IconX size={14} />,             color: 'red' },
};

function pipelineLabel(stage: string | null | undefined) {
  if (!stage) return null;
  return PIPELINE_CONFIG[stage] ?? { label: stage, icon: <IconCircleDot size={14} />, color: 'gray' };
}

// ─── Вакансии ────────────────────────────────────────────────────────────────

function VacanciesTab() {
  const { data, isLoading, isError, error } = useCandidateVacancies();
  const { data: applications } = useCandidateApplications();
  const applyMutation = useApplyToVacancy();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">{(error as Error).message}</Text>;
  if (!data || data.length === 0) return <Text mt="md" c="dimmed">Пока нет доступных вакансий.</Text>;

  return (
    <Stack mt="md">
      {data.map((v) => {
        const app = applications?.find((a) => a.vacancy_id === v.id);
        const isApplied = !!app;
        const cfg = app ? STATUS_CONFIG[app.status] : null;

        return (
          <Card key={v.id} withBorder shadow="sm" radius="md" p="md">
            <Group justify="space-between" mb={6} align="flex-start">
              <Stack gap={4} style={{ flex: 1 }}>
                <Anchor component={Link} to={`/candidate/vacancies/${v.id}`} fw={600} size="sm">
                  {v.title}
                </Anchor>
                <Group gap="xs">
                  <Badge color={v.is_active ? 'green' : 'gray'} size="xs" variant="light">
                    {v.is_active ? 'Активна' : 'Неактивна'}
                  </Badge>
                  {!isApplied && <MatchScoreBadge score={v.match_score} size="xs" />}
                </Group>
              </Stack>

              {isApplied && cfg ? (
                <Badge
                  color={cfg.color}
                  variant="light"
                  size="sm"
                  leftSection={
                    <ThemeIcon size={12} color={cfg.color} variant="transparent">
                      {cfg.icon}
                    </ThemeIcon>
                  }
                >
                  {cfg.label}
                </Badge>
              ) : (
                <Button
                  size="xs"
                  variant="light"
                  disabled={!v.is_active || applyMutation.isPending}
                  loading={applyMutation.isPending}
                  onClick={() => applyMutation.mutate({ vacancy_id: v.id })}
                >
                  Откликнуться
                </Button>
              )}
            </Group>

            <Text size="xs" c="dimmed" mb={6} lineClamp={2}>
              {v.description}
            </Text>

            {v.required_skills.length > 0 && (
              <Group gap={4}>
                {v.required_skills.slice(0, 6).map((s) => (
                  <Badge key={s} variant="outline" size="xs" color="gray">{s}</Badge>
                ))}
                {v.required_skills.length > 6 && (
                  <Text size="xs" c="dimmed">+{v.required_skills.length - 6}</Text>
                )}
              </Group>
            )}
          </Card>
        );
      })}
    </Stack>
  );
}

// ─── Мои отклики ─────────────────────────────────────────────────────────────

function ApplicationCard({ app, vacancyTitle }: { app: ReturnType<typeof useCandidateApplications>['data'] extends Array<infer T> ? T : never; vacancyTitle?: string }) {
  const cfg = STATUS_CONFIG[app.status];
  const pipeline = pipelineLabel(app.pipeline_stage);

  // Определяем шаги воронки для Timeline
  const stages = [
    { key: 'new',       label: 'Отклик отправлен' },
    { key: 'screening', label: 'Скрининг' },
    { key: 'interview', label: 'Интервью' },
    { key: 'offer',     label: 'Оффер' },
  ];
  const currentStageIdx = stages.findIndex((s) => s.key === app.pipeline_stage);
  const isRejected = app.status === 'rejected';

  return (
    <Card withBorder shadow="sm" radius="md" p="md">
      {/* Шапка */}
      <Group justify="space-between" align="flex-start" mb="xs">
        <Stack gap={2}>
          <Text fw={600} size="sm">
            {vacancyTitle ?? `Вакансия #${app.vacancy_id}`}
          </Text>
          <Text size="xs" c="dimmed">
            Отклик от{' '}
            {new Date(app.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        </Stack>

        <Badge
          color={cfg.color}
          variant="light"
          size="md"
          leftSection={
            <ThemeIcon size={14} color={cfg.color} variant="transparent">
              {cfg.icon}
            </ThemeIcon>
          }
        >
          {cfg.label}
        </Badge>
      </Group>

      {/* Описание статуса */}
      <Text size="xs" c="dimmed" mb="sm">{cfg.description}</Text>

      {/* Этап воронки (pipeline) */}
      {pipeline && (
        <Group gap="xs" mb="sm">
          <Badge
            size="xs"
            color={pipeline.color}
            variant="dot"
            leftSection={
              <ThemeIcon size={10} color={pipeline.color} variant="transparent">
                {pipeline.icon}
              </ThemeIcon>
            }
          >
            Этап: {pipeline.label}
          </Badge>
        </Group>
      )}

      {/* Прогресс воронки (только если не rejected и есть pipeline_stage) */}
      {!isRejected && app.pipeline_stage && app.pipeline_stage !== 'new' && (
        <>
          <Divider my="xs" />
          <Timeline
            active={currentStageIdx}
            bulletSize={18}
            lineWidth={2}
            color="teal"
          >
            {stages.map((s, i) => (
              <Timeline.Item
                key={s.key}
                title={
                  <Text size="xs" fw={i <= currentStageIdx ? 600 : 400} c={i <= currentStageIdx ? undefined : 'dimmed'}>
                    {s.label}
                  </Text>
                }
                bullet={
                  i <= currentStageIdx
                    ? <IconCheck size={10} />
                    : <IconCircleDot size={10} />
                }
                color={i <= currentStageIdx ? 'teal' : 'gray'}
              />
            ))}
          </Timeline>
        </>
      )}

      {/* Оценка HR */}
      {app.rating != null && (
        <>
          <Divider my="xs" />
          <Group gap="xs">
            <Text size="xs" c="dimmed">Оценка HR:</Text>
            <Text size="xs">{'★'.repeat(app.rating)}{'☆'.repeat(5 - app.rating)}</Text>
          </Group>
        </>
      )}

      {/* match_score */}
      {app.match_score > 0 && (
        <Group gap="xs" mt="xs">
          <Text size="xs" c="dimmed">Совпадение:</Text>
          <Badge size="xs" color={app.match_score >= 70 ? 'green' : app.match_score >= 40 ? 'yellow' : 'red'} variant="light">
            {Math.round(app.match_score)}%
          </Badge>
        </Group>
      )}
    </Card>
  );
}

function ApplicationsTab() {
  const { data: applications, isLoading: appsLoading } = useCandidateApplications();
  const { data: vacancies, isLoading: vacsLoading } = useCandidateVacancies();

  if (appsLoading || vacsLoading) return <Center mt="xl"><Loader /></Center>;

  if (!applications || applications.length === 0) {
    return (
      <Stack mt="md" align="center" py="xl">
        <Text c="dimmed">Вы ещё не откликались ни на одну вакансию.</Text>
      </Stack>
    );
  }

  // Сортировка: сначала активные (не rejected), потом rejected
  const sorted = [...applications].sort((a, b) => {
    if (a.status === 'rejected' && b.status !== 'rejected') return 1;
    if (a.status !== 'rejected' && b.status === 'rejected') return -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <Stack mt="md">
      {sorted.map((app) => {
        const vacancy = vacancies?.find((v) => v.id === app.vacancy_id);
        return (
          <ApplicationCard
            key={app.id}
            app={app}
            vacancyTitle={vacancy?.title}
          />
        );
      })}
    </Stack>
  );
}

// ─── Навыки ───────────────────────────────────────────────────────────────────

function SkillsSection() {
  const { data, isLoading } = useSkills();
  const addMutation = useAddSkill();
  const deleteMutation = useDeleteSkill();
  const [newSkill, setNewSkill] = useState('');

  const handleAdd = async () => {
    const name = newSkill.trim();
    if (!name) return;
    await addMutation.mutateAsync({ name });
    setNewSkill('');
  };

  return (
    <Stack mt="xl">
      <Title order={4}>Навыки</Title>
      {isLoading ? (
        <Loader size="sm" />
      ) : !data || data.length === 0 ? (
        <Text size="sm" c="dimmed">Навыки ещё не добавлены.</Text>
      ) : (
        <Group gap="xs">
          {data.map((skill) => (
            <Badge
              key={skill.id}
              rightSection={
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  loading={deleteMutation.isPending && deleteMutation.variables === skill.id}
                  onClick={() => deleteMutation.mutate(skill.id)}
                  px={4}
                >
                  ×
                </Button>
              }
            >
              {skill.name}
            </Badge>
          ))}
        </Group>
      )}
      <Group align="flex-end">
        <TextInput
          label="Добавить навык"
          placeholder="Например, Python, React"
          value={newSkill}
          onChange={(e) => setNewSkill(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button onClick={handleAdd} loading={addMutation.isPending}>
          Добавить
        </Button>
      </Group>
    </Stack>
  );
}

// ─── Резюме ───────────────────────────────────────────────────────────────────

function ResumeSection() {
  const { data: status } = useResumeStatus();
  const { data, isLoading, isError, error } = useResumeRecommendations();
  const uploadMutation = useUploadResume();
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadMutation.mutateAsync(file);
    e.target.value = '';
    setIsEditing(false);
  };

  return (
    <Stack mt="xl">
      <Title order={4}>Резюме</Title>

      <Card withBorder p="sm" radius="md">
        {status?.has_resume_file ? (
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Badge color="green">Резюме загружено</Badge>
            </Group>
            {!isEditing ? (
              <Button size="xs" variant="subtle" onClick={() => setIsEditing(true)}>Обновить</Button>
            ) : (
              <Group gap="xs">
                <Text size="sm" c="dimmed">Выберите новый файл:</Text>
                <Button
                  size="xs"
                  variant="filled"
                  loading={uploadMutation.isPending}
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                >
                  Выбрать файл
                </Button>
                <Button size="xs" variant="subtle" color="gray" onClick={() => setIsEditing(false)}>Отмена</Button>
                <input id="resume-file-input" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
              </Group>
            )}
          </Group>
        ) : (
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Badge color="orange" variant="light">Резюме не загружено</Badge>
              <Text size="xs" c="dimmed">Загрузите резюме, чтобы получать подбор вакансий</Text>
            </Group>
            <Button size="xs" loading={uploadMutation.isPending} onClick={() => document.getElementById('resume-file-input')?.click()}>Загрузить</Button>
            <input id="resume-file-input" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
          </Group>
        )}

        {uploadMutation.isError && (
          <Text c="red" size="sm" mt="xs">{(uploadMutation.error as Error).message}</Text>
        )}
      </Card>

      <Title order={5} mt="lg">Рекомендации по резюме</Title>
      {isLoading ? (
        <Loader size="sm" />
      ) : isError ? (
        <Text c="red" size="sm">{(error as Error).message}</Text>
      ) : !data || data.length === 0 ? (
        <Text size="sm" c="dimmed">Пока нет рекомендаций. Загрузите резюме.</Text>
      ) : (
        <Stack>
          {data.map((rec, index) => (
            <Card key={index} withBorder><Text size="sm">{rec}</Text></Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

// ─── Профиль ──────────────────────────────────────────────────────────────────

function ProfileTab() {
  const { data, isLoading, isError, error } = useCandidateProfile();
  const updateMutation = useUpdateCandidateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    initialValues: {
      about_me: '',
      desired_position: '',
      desired_salary: undefined as number | undefined,
      city: '',
      phone: '',
      telegram: '',
      birth_date: null as string | null,
    },
  });

  useEffect(() => {
    if (!data) return;
    form.setValues({
      about_me: data.about_me ?? '',
      desired_position: data.desired_position ?? '',
      desired_salary: data.desired_salary ?? undefined,
      city: data.city ?? '',
      phone: data.phone ?? '',
      telegram: data.telegram ?? '',
      birth_date: data.birth_date ?? null,
    });
  }, [data]);

  const handleSubmit = form.onSubmit(async (values) => {
    const payload = {
      about_me: values.about_me || null,
      desired_position: values.desired_position || null,
      desired_salary: values.desired_salary ?? null,
      city: values.city || null,
      phone: values.phone || null,
      telegram: values.telegram || null,
      birth_date: values.birth_date || null,
    };
    await updateMutation.mutateAsync(payload);
    setIsEditing(false);
  });

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">{(error as Error).message}</Text>;

  return (
    <>
      <Card withBorder p="md" radius="md" mt="md" maw={600}>
        {!isEditing ? (
          <Stack gap="xs">
            <Group justify="space-between" mb="xs">
              <Title order={4}>Основная информация</Title>
              <Button size="xs" variant="subtle" onClick={() => setIsEditing(true)}>Редактировать</Button>
            </Group>
            <ProfileRow label="Город" value={data?.city} />
            <ProfileRow label="Желаемая должность" value={data?.desired_position} />
            <ProfileRow label="Желаемая зарплата" value={data?.desired_salary ? `${data.desired_salary.toLocaleString('ru-RU')} ₽` : undefined} />
            <ProfileRow label="Телефон" value={data?.phone} />
            <ProfileRow label="Telegram" value={data?.telegram} />
            <ProfileRow label="Дата рождения" value={data?.birth_date ? data.birth_date.split('-').reverse().join('.') : undefined} />
            {data?.about_me && (
              <Stack gap={2} mt="xs">
                <Text size="sm" c="dimmed" fw={500}>О себе</Text>
                <Text size="sm">{data.about_me}</Text>
              </Stack>
            )}
          </Stack>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack>
              <Group justify="space-between" mb="xs">
                <Title order={4}>Редактирование профиля</Title>
              </Group>
              <TextInput label="Город" {...form.getInputProps('city')} />
              <TextInput label="Желаемая должность" {...form.getInputProps('desired_position')} />
              <NumberInput label="Желаемая зарплата" {...form.getInputProps('desired_salary')} min={0} />
              <TextInput label="Телефон" {...form.getInputProps('phone')} />
              <TextInput label="Telegram" {...form.getInputProps('telegram')} />
              <DateInput label="Дата рождения" valueFormat="DD.MM.YYYY" value={form.values.birth_date} onChange={(value) => form.setFieldValue('birth_date', value)} />
              <Textarea label="О себе" minRows={3} autosize {...form.getInputProps('about_me')} />
              {updateMutation.isError && (
                <Text c="red" size="sm">{(updateMutation.error as Error).message}</Text>
              )}
              <Group>
                <Button type="submit" loading={updateMutation.isPending}>Сохранить</Button>
                <Button variant="subtle" color="gray" onClick={() => setIsEditing(false)} disabled={updateMutation.isPending}>Отмена</Button>
              </Group>
            </Stack>
          </form>
        )}
      </Card>

      <ResumeSection />
      <ExperienceList />
      <EducationList />
      <PortfolioList />
      <CertificateList />
      <SkillsSection />
    </>
  );
}

function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <Group gap="xs">
      <Text size="sm" c="dimmed" fw={500} w={180}>{label}:</Text>
      <Text size="sm">{value}</Text>
    </Group>
  );
}

// ─── Главный дашборд ──────────────────────────────────────────────────────────

export function CandidateDashboard() {
  const [tab, setTab] = useState<string | null>('vacancies');
  const { data: applications } = useCandidateApplications();

  // Счётчик активных откликов (не rejected) для таба
  const activeApps = applications?.filter((a) => a.status !== 'rejected').length ?? 0;

  return (
    <Container fluid py="md">
      <Group justify="space-between" mb="md">
        <Title order={2}>Личный кабинет</Title>
      </Group>
      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="vacancies">Вакансии</Tabs.Tab>
          <Tabs.Tab
            value="applications"
            rightSection={
              activeApps > 0
                ? <Badge size="xs" color="blue" variant="filled" circle>{activeApps}</Badge>
                : undefined
            }
          >
            Мои отклики
          </Tabs.Tab>
          <Tabs.Tab value="profile">Профиль</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="vacancies"><VacanciesTab /></Tabs.Panel>
        <Tabs.Panel value="applications"><ApplicationsTab /></Tabs.Panel>
        <Tabs.Panel value="profile"><ProfileTab /></Tabs.Panel>
      </Tabs>
    </Container>
  );
}
