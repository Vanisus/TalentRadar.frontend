// src/features/candidate/CandidateDashboard.tsx
import { useEffect, useState } from 'react';
import { Tabs, Container, Stack, Title, Text, Card, Badge, Group, Loader, Center, Button } from '@mantine/core';
import { useCandidateVacancies, useCandidateApplications } from './api';
import type { ApplicationStatus } from './api';
import { useCandidateProfile, useUpdateCandidateProfile } from './profileApi';
import { useExperiences, useAddExperience, useDeleteExperience } from './experienceApi';
import { usePortfolioItems, useAddPortfolioItem, useDeletePortfolioItem } from './portfolioApi';
import { useEducations, useAddEducation, useDeleteEducation } from './educationApi';

import { Checkbox } from '@mantine/core';

import { Textarea, NumberInput, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';

function VacanciesTab() {
  const { data, isLoading, isError, error } = useCandidateVacancies();

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
        {(error as Error).message}
      </Text>
    );
  }

  if (!data || data.length === 0) {
    return <Text mt="md">Пока нет доступных вакансий.</Text>;
  }

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
          <Text size="sm" mb="sm">
            {v.description}
          </Text>
          <Group gap="xs">
            {v.required_skills.map((s) => (
              <Badge key={s} variant="light">
                {s}
              </Badge>
            ))}
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

function statusLabel(status: ApplicationStatus) {
  switch (status) {
    case 'new':
      return 'Новая';
    case 'under_review':
      return 'В рассмотрении';
    case 'accepted':
      return 'Принята';
    case 'rejected':
      return 'Отклонена';
    default:
      return status;
  }
}

function ApplicationsTab() {
  const { data, isLoading, isError, error } = useCandidateApplications();

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
        {(error as Error).message}
      </Text>
    );
  }

  if (!data || data.length === 0) {
    return <Text mt="md">У вас пока нет заявок.</Text>;
  }

  return (
    <Stack mt="md">
      {data.map((app) => (
        <Card key={app.id} withBorder shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Заявка #{app.id}</Text>
            <Badge>
              {statusLabel(app.status)}
            </Badge>
          </Group>
          <Text size="sm" mb="xs">
            Vacancy ID: {app.vacancy_id}
          </Text>
          <Text size="sm">
            Match score: {app.match_score.toFixed(1)}%
          </Text>
          {app.pipeline_stage && (
            <Text size="sm" mt={4}>
              Этап: {app.pipeline_stage}
            </Text>
          )}
          {app.rating != null && (
            <Text size="sm" mt={4}>
              Оценка HR: {app.rating}/5
            </Text>
          )}
        </Card>
      ))}
    </Stack>
  );
}

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
                <Text size="sm" mt={4}>
                  {item.description}
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      )}

      <Card withBorder>
        <Title order={5} mb="sm">
          Добавить элемент портфолио
        </Title>
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
  );
}

function EducationSection() {
  const { data, isLoading } = useEducations();
  const addMutation = useAddEducation();
  const deleteMutation = useDeleteEducation();

  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCurrent, setIsCurrent] = useState(false);

  const handleAdd = async () => {
    if (!institution || !degree || !startDate) return;

    const payload = {
      institution,
      degree,
      field_of_study: fieldOfStudy || null,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: isCurrent || !endDate ? null : endDate.toISOString().slice(0, 10),
      is_current: isCurrent,
    };

    await addMutation.mutateAsync(payload);
    setInstitution('');
    setDegree('');
    setFieldOfStudy('');
    setStartDate(null);
    setEndDate(null);
    setIsCurrent(false);
  };

  return (
    <Stack mt="xl">
      <Title order={4}>Образование</Title>

      {isLoading ? (
        <Loader size="sm" />
      ) : !data || data.length === 0 ? (
        <Text size="sm">Записей об образовании ещё нет.</Text>
      ) : (
        <Stack>
          {data.map((edu) => (
            <Card key={edu.id} withBorder>
              <Group justify="space-between" mb="xs">
                <div>
                  <Text fw={500}>{edu.degree}</Text>
                  <Text size="sm" c="dimmed">
                    {edu.institution}
                  </Text>
                </div>
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  loading={deleteMutation.isPending && deleteMutation.variables === edu.id}
                  onClick={() => deleteMutation.mutate(edu.id)}
                >
                  Удалить
                </Button>
              </Group>
              <Text size="sm">
                {edu.start_date} — {edu.is_current ? 'по настоящее время' : edu.end_date || 'не указано'}
              </Text>
              {edu.field_of_study && (
                <Text size="sm" mt={4}>
                  Направление: {edu.field_of_study}
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      )}

      <Card withBorder>
        <Title order={5} mb="sm">
          Добавить образование
        </Title>
        <Stack>
          <TextInput
            label="Учебное заведение"
            value={institution}
            onChange={(e) => setInstitution(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Степень / программа"
            value={degree}
            onChange={(e) => setDegree(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Направление (специальность)"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.currentTarget.value)}
          />
          <Group grow>
            <DateInput
              label="Дата начала"
              value={startDate}
              onChange={setStartDate}
              required
            />
            <DateInput
              label="Дата окончания"
              value={endDate}
              onChange={setEndDate}
              disabled={isCurrent}
            />
          </Group>
          <Checkbox
            label="Учусь сейчас"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.currentTarget.checked)}
          />
          <Button onClick={handleAdd} loading={addMutation.isPending}>
            Сохранить образование
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}


function ExperienceSection() {
  const { data, isLoading } = useExperiences();
  const addMutation = useAddExperience();
  const deleteMutation = useDeleteExperience();

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCurrent, setIsCurrent] = useState(false);

  const handleAdd = async () => {
    if (!company || !position || !startDate) return;

    const payload = {
      company,
      position,
      description: description || null,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: isCurrent || !endDate ? null : endDate.toISOString().slice(0, 10),
      is_current: isCurrent,
    };

    await addMutation.mutateAsync(payload);
    setCompany('');
    setPosition('');
    setDescription('');
    setStartDate(null);
    setEndDate(null);
    setIsCurrent(false);
  };

  return (
    <Stack mt="xl">
      <Title order={4}>Опыт работы</Title>

      {isLoading ? (
        <Loader size="sm" />
      ) : !data || data.length === 0 ? (
        <Text size="sm">Опыт работы ещё не добавлен.</Text>
      ) : (
        <Stack>
          {data.map((exp) => (
            <Card key={exp.id} withBorder>
              <Group justify="space-between" mb="xs">
                <div>
                  <Text fw={500}>{exp.position}</Text>
                  <Text size="sm" c="dimmed">
                    {exp.company}
                  </Text>
                </div>
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  loading={deleteMutation.isPending && deleteMutation.variables === exp.id}
                  onClick={() => deleteMutation.mutate(exp.id)}
                >
                  Удалить
                </Button>
              </Group>
              <Text size="sm">
                {exp.start_date} — {exp.is_current ? 'по настоящее время' : exp.end_date || 'не указано'}
              </Text>
              {exp.description && (
                <Text size="sm" mt={4}>
                  {exp.description}
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      )}

      <Card withBorder>
        <Title order={5} mb="sm">
          Добавить опыт
        </Title>
        <Stack>
          <TextInput
            label="Компания"
            value={company}
            onChange={(e) => setCompany(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Должность"
            value={position}
            onChange={(e) => setPosition(e.currentTarget.value)}
            required
          />
          <Textarea
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
          <Group grow>
            <DateInput
              label="Дата начала"
              value={startDate}
              onChange={setStartDate}
              required
            />
            <DateInput
              label="Дата окончания"
              value={endDate}
              onChange={setEndDate}
              disabled={isCurrent}
            />
          </Group>
          <Checkbox
            label="Текущее место работы"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.currentTarget.checked)}
          />
          <Button onClick={handleAdd} loading={addMutation.isPending}>
            Сохранить опыт
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}


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
      birth_date: null as Date | null,
    },
  });

  // когда профиль загрузился — положим в форму
  useEffect(() => {
    if (!data) return;
    form.setValues({
      about_me: data.about_me ?? '',
      desired_position: data.desired_position ?? '',
      desired_salary: data.desired_salary ?? undefined,
      city: data.city ?? '',
      phone: data.phone ?? '',
      telegram: data.telegram ?? '',
      birth_date: data.birth_date ? new Date(data.birth_date) : null,
    });
  }, [data]);

  const handleSubmit = form.onSubmit(async (values) => {
    const birthDateValue = values.birth_date;

    let birth_date: string | null = null;
    if (birthDateValue instanceof Date) {
        birth_date = birthDateValue.toISOString().slice(0, 10);
    }

    const payload = {
        about_me: values.about_me || null,
        desired_position: values.desired_position || null,
        desired_salary: values.desired_salary ?? null,
        city: values.city || null,
        phone: values.phone || null,
        telegram: values.telegram || null,
        birth_date,
    };

    await updateMutation.mutateAsync(payload);
});


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
        {(error as Error).message}
      </Text>
    );
  }

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
      <EducationSection />
      <ExperienceSection />
      <PortfolioSection />

    </>
  );

}


export function CandidateDashboard() {
  const [tab, setTab] = useState<string | null>('vacancies');

  return (
    <Container fluid py="md">
      <Title order={2} mb="md">
        Личный кабинет кандидата
      </Title>
      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="vacancies">Вакансии</Tabs.Tab>
          <Tabs.Tab value="applications">Мои отклики</Tabs.Tab>
          <Tabs.Tab value="profile">Профиль</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="vacancies">
          <VacanciesTab />
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
