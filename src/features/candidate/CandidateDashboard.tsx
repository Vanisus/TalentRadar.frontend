// src/features/candidate/CandidateDashboard.tsx
import { useEffect, useState } from 'react';
import {
  Tabs, Container, Stack, Title, Text, Card, Badge,
  Group, Loader, Center, Button, Textarea, NumberInput, TextInput
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useCandidateVacancies, useCandidateApplications, useRecommendedVacancies } from './api';
import type { ApplicationStatus } from './api';
import { useCandidateProfile, useUpdateCandidateProfile } from './profileApi';
import { PortfolioList } from './portfolio/PortfolioList';
import { CertificateList } from './certificates/CertificateList';
import { useResumeRecommendations, useUploadResume, useResumeStatus } from './resumeApi';
import { useSkills, useAddSkill, useDeleteSkill } from './portfolio/skillsApi';
import { NotificationsBell } from '@/features/notifications/NotificationsBell';
import { ExperienceList } from './experience/ExperienceList';
import { EducationList } from './education/EducationList';
import { API_BASE } from '@/shared/api';


// ─── Вакансии ────────────────────────────────────────────────────────────────

function VacanciesTab() {
  const { data, isLoading, isError, error } = useCandidateVacancies();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">{(error as Error).message}</Text>;
  if (!data || data.length === 0) return <Text mt="md">Пока нет доступных вакансий.</Text>;

  return (
    <Stack mt="md">
      {data.map((v) => (
        <Card key={v.id} withBorder shadow="sm">
          <Group justify="space-between" mb="xs">
            <Title order={4}>{v.title}</Title>
            <Badge color={v.is_active ? 'green' : 'gray'}>
              {v.is_active ? 'Активна' : 'Неактивна'}
            </Badge>
          </Group>
          <Text size="sm" mb="sm">{v.description}</Text>
          <Group gap="xs">
            {v.required_skills.map((s) => (
              <Badge key={s} variant="light">{s}</Badge>
            ))}
          </Group>
        </Card>
      ))}
    </Stack>
  );
}


// ─── Рекомендованные вакансии ─────────────────────────────────────────────────

function RecommendedVacanciesTab() {
  const [minScore, setMinScore] = useState<number>(0);
  const { data, isLoading, isError, error } = useRecommendedVacancies(minScore);

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">{(error as Error).message}</Text>;

  if (!data || data.length === 0) {
    return (
      <Stack mt="md">
        <Text>Пока нет рекомендованных вакансий.</Text>
        <Text size="sm" c="dimmed">
          Загрузите резюме и заполните профиль, чтобы мы могли подобрать подходящие вакансии.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack mt="md">
      <Group align="flex-end">
        <NumberInput
          label="Минимальный match-score"
          min={0}
          max={100}
          step={5}
          value={minScore}
          onChange={(value) => setMinScore(Number(value) || 0)}
        />
      </Group>
      {data.map((v) => (
        <Card key={v.id} withBorder shadow="sm">
          <Group justify="space-between" mb="xs">
            <div>
              <Title order={4}>{v.title}</Title>
              <Text size="sm" c="dimmed">Совпадение: {v.match_score.toFixed(1)}%</Text>
            </div>
            <Badge color={v.is_active ? 'green' : 'gray'}>
              {v.is_active ? 'Активна' : 'Неактивна'}
            </Badge>
          </Group>
          <Text size="sm" mb="sm">{v.description}</Text>
          <Group gap="xs">
            {v.required_skills.map((s) => (
              <Badge key={s} variant="light">{s}</Badge>
            ))}
          </Group>
        </Card>
      ))}
    </Stack>
  );
}


// ─── Статус заявки ────────────────────────────────────────────────────────────

function statusLabel(status: ApplicationStatus) {
  switch (status) {
    case 'new': return 'Новая';
    case 'under_review': return 'В рассмотрении';
    case 'accepted': return 'Принята';
    case 'rejected': return 'Отклонена';
    default: return status;
  }
}


// ─── Мои отклики ─────────────────────────────────────────────────────────────

function ApplicationsTab() {
  const { data, isLoading, isError, error } = useCandidateApplications();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">{(error as Error).message}</Text>;
  if (!data || data.length === 0) return <Text mt="md">У вас пока нет заявок.</Text>;

  return (
    <Stack mt="md">
      {data.map((app) => (
        <Card key={app.id} withBorder shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Заявка #{app.id}</Text>
            <Badge>{statusLabel(app.status)}</Badge>
          </Group>
          <Text size="sm" mb="xs">Vacancy ID: {app.vacancy_id}</Text>
          <Text size="sm">Match score: {app.match_score.toFixed(1)}%</Text>
          {app.pipeline_stage && (
            <Text size="sm" mt={4}>Этап: {app.pipeline_stage}</Text>
          )}
          {app.rating != null && (
            <Text size="sm" mt={4}>Оценка HR: {app.rating}/5</Text>
          )}
        </Card>
      ))}
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
        <Text size="sm">Навыки ещё не добавлены.</Text>
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


// ─── Сертификаты ──────────────────────────────────────────────────────────────

function CertificatesSection() {
  const { data, isLoading } = useCertificates();
  const uploadMutation = useUploadCertificate();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    await uploadMutation.mutateAsync({ file, title: title || undefined });
    setTitle('');
    setFile(null);
  };

  const resolveUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  };

  return (
    <Stack mt="xl">
      <Title order={4}>Сертификаты</Title>
      {isLoading ? (
        <Loader size="sm" />
      ) : !data || data.length === 0 ? (
        <Text size="sm">Сертификатов пока нет.</Text>
      ) : (
        <Stack>
          {data.map((cert) => {
            const previewUrl = resolveUrl(cert.preview_path || cert.file_path);
            return (
              <Card key={cert.id} withBorder>
                <Group justify="space-between" mb="xs">
                  <div>
                    <Text fw={500}>{cert.title}</Text>
                    {cert.issuer && <Text size="sm" c="dimmed">{cert.issuer}</Text>}
                    {cert.issue_date && (
                      <Text size="sm" c="dimmed">Дата выдачи: {cert.issue_date}</Text>
                    )}
                  </div>
                  {previewUrl && (
                    <Button
                      size="xs"
                      variant="light"
                      component="a"
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Открыть
                    </Button>
                  )}
                </Group>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={cert.title}
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                )}
              </Card>
            );
          })}
        </Stack>
      )}
      <Card withBorder>
        <Title order={5} mb="sm">Загрузить сертификат</Title>
        <Stack>
          <TextInput
            label="Название"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="Например, AWS Certified Developer"
          />
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {uploadMutation.isError && (
            <Text c="red" size="sm">{(uploadMutation.error as Error).message}</Text>
          )}
          <Button onClick={handleUpload} loading={uploadMutation.isPending} disabled={!file}>
            Загрузить
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}


// ─── Портфолио ────────────────────────────────────────────────────────────────

function PortfolioSection() {
  const { data, isLoading } = usePortfolioItems();
  const addMutation = useAddPortfolioItem();
  const deleteMutation = useDeletePortfolioItem();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
    if (!title) return;
    await addMutation.mutateAsync({
      title,
      url: url || null,
      description: description || null,
    });
    setTitle('');
    setUrl('');
    setDescription('');
  };

  return (
    <Stack mt="xl">
      <Title order={4}>Портфолио</Title>
      {isLoading ? (
        <Loader size="sm" />
      ) : !data || data.length === 0 ? (
        <Text size="sm">Элементов портфолио пока нет.</Text>
      ) : (
        <Stack>
          {data.map((item) => (
            <Card key={item.id} withBorder>
              <Group justify="space-between" mb="xs">
                <div>
                  <Text fw={500}>{item.title}</Text>
                  {item.url && (
                    <Text
                      size="sm"
                      c="blue"
                      component="a"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.url}
                    </Text>
                  )}
                </div>
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  loading={deleteMutation.isPending && deleteMutation.variables === item.id}
                  onClick={() => deleteMutation.mutate(item.id)}
                >
                  Удалить
                </Button>
              </Group>
              {item.description && (
                <Text size="sm" mt={4}>{item.description}</Text>
              )}
            </Card>
          ))}
        </Stack>
      )}
      <Card withBorder>
        <Title order={5} mb="sm">Добавить элемент портфолио</Title>
        <Stack>
          <TextInput
            label="Название"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Ссылка (GitHub, Behance и т.п.)"
            value={url}
            onChange={(e) => setUrl(e.currentTarget.value)}
          />
          <Textarea
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
          <Button onClick={handleAdd} loading={addMutation.isPending}>
            Сохранить элемент
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
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

      {/* Статус резюме */}
      <Card withBorder p="sm" radius="md">
        {status?.has_resume_file ? (
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Badge color="green">Резюме загружено</Badge>
            </Group>
            {!isEditing ? (
              <Button
                size="xs"
                variant="subtle"
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </Button>
            ) : (
              <Group gap="xs">
                <Text size="sm" c="dimmed">Хотите обновить резюме?</Text>
                <Button
                  size="xs"
                  variant="filled"
                  loading={uploadMutation.isPending}
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                >
                  Выбрать файл
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={() => setIsEditing(false)}
                >
                  Отмена
                </Button>
                <input
                  id="resume-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </Group>
            )}
          </Group>
        ) : (
          <Group justify="space-between" align="center">
            <Badge color="gray">Резюме не загружено</Badge>
            <Button
              size="xs"
              loading={uploadMutation.isPending}
              onClick={() => document.getElementById('resume-file-input')?.click()}
            >
              Загрузить
            </Button>
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Group>
        )}

        {uploadMutation.isError && (
          <Text c="red" size="sm" mt="xs">
            {(uploadMutation.error as Error).message}
          </Text>
        )}
      </Card>

      {/* Рекомендации */}
      <Title order={5} mt="lg">Рекомендации по резюме</Title>
      {isLoading ? (
        <Loader size="sm" />
      ) : isError ? (
        <Text c="red" size="sm">{(error as Error).message}</Text>
      ) : !data || data.length === 0 ? (
        <Text size="sm">Пока нет рекомендаций. Загрузите резюме и заполните профиль.</Text>
      ) : (
        <Stack>
          {data.map((rec, index) => (
            <Card key={index} withBorder>
              <Text size="sm">{rec}</Text>
            </Card>
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

  const form = useForm({
    initialValues: {
      about_me: '',
      desired_position: '',
      desired_salary: undefined as number | undefined,
      city: '',
      phone: '',
      telegram: '',
      birth_date: null as string | null,  // строка YYYY-MM-DD
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
      birth_date: data.birth_date ?? null,  // уже строка с бэка
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
      birth_date: values.birth_date || null,  // строка YYYY-MM-DD или null
    };
    await updateMutation.mutateAsync(payload);
  });

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">{(error as Error).message}</Text>;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack mt="md" maw={500}>
          <TextInput label="Город" {...form.getInputProps('city')} />
          <TextInput label="Желаемая должность" {...form.getInputProps('desired_position')} />
          <NumberInput
            label="Желаемая зарплата"
            {...form.getInputProps('desired_salary')}
            min={0}
          />
          <TextInput label="Телефон" {...form.getInputProps('phone')} />
          <TextInput label="Telegram" {...form.getInputProps('telegram')} />
          <DateInput
            label="Дата рождения"
            valueFormat="DD.MM.YYYY"
            value={form.values.birth_date}
            onChange={(value) => form.setFieldValue('birth_date', value)}
          />
          <Textarea
            label="О себе"
            minRows={3}
            autosize
            {...form.getInputProps('about_me')}
          />
          {updateMutation.isError && (
            <Text c="red" size="sm">
              {(updateMutation.error as Error).message}
            </Text>
          )}
          <Group>
            <Button type="submit" loading={updateMutation.isLoading}>
              Сохранить
            </Button>
          </Group>
        </Stack>
      </form>

      <ResumeSection />
      <ExperienceList />
      <EducationList />
      <PortfolioList /> 
      <CertificateList />
      <SkillsSection />
    </>
  );
}


// ─── Главный дашборд ──────────────────────────────────────────────────────────

export function CandidateDashboard() {
  const [tab, setTab] = useState<string | null>('vacancies');

  return (
    <Container fluid py="md">
      <Group justify="space-between" mb="md">
        <Title order={2}>Личный кабинет кандидата</Title>
        <NotificationsBell />
      </Group>
      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="vacancies">Вакансии</Tabs.Tab>
          <Tabs.Tab value="recommended">Рекомендованные</Tabs.Tab>
          <Tabs.Tab value="applications">Мои отклики</Tabs.Tab>
          <Tabs.Tab value="profile">Профиль</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="vacancies">
          <VacanciesTab />
        </Tabs.Panel>
        <Tabs.Panel value="recommended">
          <RecommendedVacanciesTab />
        </Tabs.Panel>
        <Tabs.Panel value="applications">
          <ApplicationsTab />
        </Tabs.Panel>
        <Tabs.Panel value="profile">
          <ProfileTab />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
