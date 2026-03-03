import {
  Tabs,
  Stack,
  Group,
  Text,
  Card,
  Badge,
  Loader,
  Center,
} from '@mantine/core';
import { VacanciesTab } from './vacancies/VacanciesTab';
import { CandidatesTab } from './candidates/CandidatesTab';
import { ApplicationsTab } from './applications/ApplicationsTab';
import { TemplatesTab } from './templates/TemplatesTab';
import { useHRDashboardView } from './dashboard/dashboardApi';

function HRDashboardOverview() {
  const { data, isLoading, isError } = useHRDashboardView(1, 7);

  if (isLoading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <Text mt="md" c="red">
        Ошибка загрузки дашборда
      </Text>
    );
  }

  const { new_applications, unread_notifications, stale_vacancies, config } = data;

  return (
    <Stack mt="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">
          Обзор HR
        </Text>
        <Text size="sm" c="dimmed">
          Новые за {config.days_new} дн. · устаревшие за {config.days_stale} дн.
        </Text>
      </Group>

      {/* Новые отклики */}
      <Card withBorder p="md" radius="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={500}>Новые отклики</Text>
            <Badge variant="light" color="blue">
              {new_applications.length}
            </Badge>
          </Group>
          {new_applications.length === 0 ? (
            <Text size="sm" c="dimmed">
              Новых откликов за выбранный период нет.
            </Text>
          ) : (
            <Stack gap={4}>
              {new_applications.slice(0, 5).map((a) => (
                <Group key={a.application_id} justify="space-between">
                  <Stack gap={0}>
                    <Text size="sm" fw={500}>
                      {a.vacancy_title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Отклик #{a.application_id} · Кандидат #{a.candidate_id}
                    </Text>
                  </Stack>
                  <Text size="xs" c="dimmed">
                    {new Date(a.created_at).toLocaleString('ru-RU')}
                  </Text>
                </Group>
              ))}
              {new_applications.length > 5 && (
                <Text size="xs" c="dimmed">
                  И ещё {new_applications.length - 5} откликов…
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Непрочитанные уведомления */}
      <Card withBorder p="md" radius="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={500}>Непрочитанные уведомления</Text>
            <Badge variant="light" color="red">
              {unread_notifications.length}
            </Badge>
          </Group>
          {unread_notifications.length === 0 ? (
            <Text size="sm" c="dimmed">
              Все уведомления прочитаны.
            </Text>
          ) : (
            <Stack gap={4}>
              {unread_notifications.slice(0, 5).map((n) => (
                <Group key={n.id} justify="space-between">
                  <Text size="sm">{n.message}</Text>
                  <Text size="xs" c="dimmed">
                    {new Date(n.created_at).toLocaleString('ru-RU')}
                  </Text>
                </Group>
              ))}
              {unread_notifications.length > 5 && (
                <Text size="xs" c="dimmed">
                  И ещё {unread_notifications.length - 5} уведомлений…
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Устаревшие вакансии */}
      <Card withBorder p="md" radius="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={500}>Вакансии без откликов</Text>
            <Badge variant="light" color="orange">
              {stale_vacancies.length}
            </Badge>
          </Group>
          {stale_vacancies.length === 0 ? (
            <Text size="sm" c="dimmed">
              Нет вакансий без откликов за выбранный период.
            </Text>
          ) : (
            <Stack gap={4}>
              {stale_vacancies.slice(0, 5).map((v) => (
                <Group key={v.vacancy_id} justify="space-between" align="flex-start">
                  <Stack gap={0}>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>
                        {v.title}
                      </Text>
                      <Badge size="xs" color={v.is_active ? 'green' : 'gray'}>
                        {v.is_active ? 'Активна' : 'Неактивна'}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      Создана:{' '}
                      {new Date(v.created_at).toLocaleDateString('ru-RU')}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Последний отклик:{' '}
                      {v.last_application_at
                        ? new Date(v.last_application_at).toLocaleDateString('ru-RU')
                        : 'не было откликов'}
                    </Text>
                  </Stack>
                </Group>
              ))}
              {stale_vacancies.length > 5 && (
                <Text size="xs" c="dimmed">
                  И ещё {stale_vacancies.length - 5} вакансий…
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

export function HRDashboard() {
  return (
    <Tabs defaultValue="overview">
      <Tabs.List>
        <Tabs.Tab value="overview">Обзор</Tabs.Tab>
        <Tabs.Tab value="vacancies">Вакансии</Tabs.Tab>
        <Tabs.Tab value="candidates">Кандидаты</Tabs.Tab>
        <Tabs.Tab value="applications">Отклики</Tabs.Tab>
        <Tabs.Tab value="templates">Шаблоны</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview">
        <HRDashboardOverview />
      </Tabs.Panel>
      <Tabs.Panel value="vacancies">
        <VacanciesTab />
      </Tabs.Panel>
      <Tabs.Panel value="candidates">
        <CandidatesTab />
      </Tabs.Panel>
      <Tabs.Panel value="applications">
        <ApplicationsTab />
      </Tabs.Panel>
      <Tabs.Panel value="templates">
        <TemplatesTab />
      </Tabs.Panel>
    </Tabs>
  );
}
