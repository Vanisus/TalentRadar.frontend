// src/features/admin/AdminDashboard.tsx
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Code,
  Container,
  Divider,
  Group,
  Loader,
  NumberInput,
  RingProgress,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBan,
  IconBriefcase,
  IconCheck,
  IconChevronDown,
  IconCircleDot,
  IconClipboardList,
  IconDatabase,
  IconFileText,
  IconLock,
  IconLockOpen,
  IconRefresh,
  IconShield,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { UserRole } from './adminApi';
import {
  useAdminLogs,
  useAdminStats,
  useAdminSuspicious,
  useAdminUsers,
  useBlockUser,
  useUnblockUser,
} from './adminApi';

// ─── KPI карточка ─────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        <ThemeIcon size="sm" color={color} variant="light">
          {icon}
        </ThemeIcon>
      </Group>
      <Text fw={700} size="xl">
        {value}
      </Text>
      {sub && (
        <Text size="xs" c="dimmed" mt={2}>
          {sub}
        </Text>
      )}
    </Card>
  );
}

// ─── Таб: Обзор ───────────────────────────────────────────────────────────────

function StatsTab() {
  const { data, isLoading, isError, refetch, isFetching } = useAdminStats();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError || !data) return <Text c="red" mt="md">Не удалось загрузить статистику</Text>;

  const blockedPct = data.users.total > 0
    ? Math.round((data.users.blocked / data.users.total) * 100)
    : 0;
  const activeVacPct = data.vacancies.total > 0
    ? Math.round((data.vacancies.active / data.vacancies.total) * 100)
    : 0;

  return (
    <Stack mt="md">
      <Group justify="space-between">
        <Text fw={600}>Общая статистика</Text>
        <Tooltip label="Обновить" withArrow>
          <ActionIcon variant="subtle" onClick={() => refetch()} loading={isFetching}>
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* KPI grid */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>
        <KpiCard label="Пользователей" value={data.users.total} icon={<IconUsers size={14} />} color="blue" />
        <KpiCard label="Кандидаты" value={data.users.candidates} icon={<IconUser size={14} />} color="teal" />
        <KpiCard label="HR-менеджеры" value={data.users.hr_managers} icon={<IconBriefcase size={14} />} color="violet" />
        <KpiCard label="Админы" value={data.users.admins} icon={<IconShield size={14} />} color="orange" />
        <KpiCard
          label="Заблокировано"
          value={data.users.blocked}
          icon={<IconBan size={14} />}
          color="red"
          sub={`${blockedPct}% от всех`}
        />
        <KpiCard label="Вакансий всего" value={data.vacancies.total} icon={<IconClipboardList size={14} />} color="cyan" />
        <KpiCard
          label="Активных вакансий"
          value={data.vacancies.active}
          icon={<IconCircleDot size={14} />}
          color="green"
          sub={`${activeVacPct}% от всех`}
        />
        <KpiCard label="Откликов" value={data.applications.total} icon={<IconDatabase size={14} />} color="grape" />
      </SimpleGrid>

      {/* Ring-charts */}
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Card withBorder p="md" radius="md">
          <Text fw={500} mb="sm">Распределение пользователей</Text>
          <Group justify="center" gap="xl">
            <RingProgress
              size={120}
              thickness={14}
              label={<Text ta="center" size="xs" fw={600}>{data.users.total}<br />всего</Text>}
              sections={[
                { value: data.users.total ? (data.users.candidates / data.users.total) * 100 : 0, color: 'teal', tooltip: `Кандидаты: ${data.users.candidates}` },
                { value: data.users.total ? (data.users.hr_managers / data.users.total) * 100 : 0, color: 'violet', tooltip: `HR: ${data.users.hr_managers}` },
                { value: data.users.total ? (data.users.admins / data.users.total) * 100 : 0, color: 'orange', tooltip: `Админы: ${data.users.admins}` },
                { value: blockedPct, color: 'red', tooltip: `Заблокировано: ${data.users.blocked}` },
              ]}
            />
            <Stack gap={6}>
              {[
                { label: 'Кандидаты', val: data.users.candidates, color: 'teal' },
                { label: 'HR', val: data.users.hr_managers, color: 'violet' },
                { label: 'Админы', val: data.users.admins, color: 'orange' },
                { label: 'Заблокировано', val: data.users.blocked, color: 'red' },
              ].map((r) => (
                <Group key={r.label} gap="xs">
                  <Badge size="xs" color={r.color} variant="filled" circle />
                  <Text size="xs">{r.label}: {r.val}</Text>
                </Group>
              ))}
            </Stack>
          </Group>
        </Card>

        <Card withBorder p="md" radius="md">
          <Text fw={500} mb="sm">Вакансии</Text>
          <Group justify="center" gap="xl">
            <RingProgress
              size={120}
              thickness={14}
              label={<Text ta="center" size="xs" fw={600}>{data.vacancies.total}<br />всего</Text>}
              sections={[
                { value: activeVacPct, color: 'green', tooltip: `Активные: ${data.vacancies.active}` },
                { value: 100 - activeVacPct, color: 'gray', tooltip: `Неактивные: ${data.vacancies.total - data.vacancies.active}` },
              ]}
            />
            <Stack gap={6}>
              <Group gap="xs">
                <Badge size="xs" color="green" variant="filled" circle />
                <Text size="xs">Активные: {data.vacancies.active}</Text>
              </Group>
              <Group gap="xs">
                <Badge size="xs" color="gray" variant="filled" circle />
                <Text size="xs">Неактивные: {data.vacancies.total - data.vacancies.active}</Text>
              </Group>
              <Divider my={4} />
              <Group gap="xs">
                <Badge size="xs" color="grape" variant="filled" circle />
                <Text size="xs">Откликов: {data.applications.total}</Text>
              </Group>
            </Stack>
          </Group>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

// ─── Таб: Пользователи ───────────────────────────────────────────────────────

function UsersTab() {
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [blockedFilter, setBlockedFilter] = useState<string | null>(null);

  const filters = {
    role: roleFilter as UserRole | undefined,
    is_blocked: blockedFilter === null ? undefined : blockedFilter === 'true',
  };

  const { data, isLoading, isError } = useAdminUsers(filters);
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  return (
    <Stack mt="md">
      {/* Фильтры */}
      <Group gap="sm">
        <Select
          placeholder="Фильтр по роли"
          clearable
          value={roleFilter}
          onChange={setRoleFilter}
          data={[
            { value: 'candidate', label: 'Кандидаты' },
            { value: 'hr', label: 'HR-менеджеры' },
            { value: 'admin', label: 'Админы' },
          ]}
          size="xs"
          style={{ width: 160 }}
        />
        <Select
          placeholder="Статус аккаунта"
          clearable
          value={blockedFilter}
          onChange={setBlockedFilter}
          data={[
            { value: 'false', label: 'Активные' },
            { value: 'true', label: 'Заблокированные' },
          ]}
          size="xs"
          style={{ width: 180 }}
        />
        {(roleFilter || blockedFilter) && (
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            onClick={() => { setRoleFilter(null); setBlockedFilter(null); }}
          >
            Сбросить
          </Button>
        )}
        <Text size="xs" c="dimmed" ml="auto">
          Найдено: {data?.length ?? '—'}
        </Text>
      </Group>

      {isLoading && <Center mt="xl"><Loader /></Center>}
      {isError && <Text c="red">Ошибка загрузки пользователей</Text>}

      {!isLoading && data && data.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">Пользователи не найдены</Text>
      )}

      {!isLoading && data?.map((user) => (
        <Card key={user.id} withBorder p="sm" radius="md">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <ThemeIcon
                size="sm"
                variant="light"
                color={user.role === 'admin' ? 'orange' : user.role === 'hr' ? 'violet' : 'teal'}
              >
                {user.role === 'admin' ? <IconShield size={12} /> : user.role === 'hr' ? <IconBriefcase size={12} /> : <IconUser size={12} />}
              </ThemeIcon>
              <Stack gap={0} style={{ minWidth: 0 }}>
                <Text size="sm" fw={500} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </Text>
                <Group gap={4}>
                  <Badge size="xs" variant="light" color={user.role === 'admin' ? 'orange' : user.role === 'hr' ? 'violet' : 'teal'}>
                    {user.role === 'hr' ? 'HR' : user.role}
                  </Badge>
                  <Badge size="xs" variant="light" color={user.is_blocked ? 'red' : 'green'}>
                    {user.is_blocked ? 'заблокирован' : 'активен'}
                  </Badge>
                  {user.is_superuser && <Badge size="xs" color="orange" variant="filled">суперюзер</Badge>}
                </Group>
              </Stack>
            </Group>

            <Group gap="xs" wrap="nowrap">
              {user.is_blocked ? (
                <Tooltip label="Разблокировать" withArrow>
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="green"
                    loading={unblockMutation.isPending && unblockMutation.variables === user.id}
                    onClick={() => unblockMutation.mutate(user.id)}
                  >
                    <IconLockOpen size={14} />
                  </ActionIcon>
                </Tooltip>
              ) : (
                <Tooltip label="Заблокировать" withArrow>
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="red"
                    loading={blockMutation.isPending && blockMutation.variables === user.id}
                    onClick={() => blockMutation.mutate(user.id)}
                    disabled={user.is_superuser}
                  >
                    <IconLock size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

// ─── Таб: Логи ───────────────────────────────────────────────────────────────

function LogsTab() {
  const [lines, setLines] = useState<number | string>(200);
  const [committed, setCommitted] = useState(200);
  const { data, isLoading, isError, refetch, isFetching } = useAdminLogs(committed);

  function levelColor(line: string) {
    if (line.includes('ERROR')) return 'var(--mantine-color-red-6)';
    if (line.includes('WARNING') || line.includes('WARN')) return 'var(--mantine-color-yellow-7)';
    if (line.includes('INFO')) return 'var(--mantine-color-teal-6)';
    if (line.includes('DEBUG')) return 'var(--mantine-color-dimmed)';
    return undefined;
  }

  return (
    <Stack mt="md">
      <Group justify="space-between">
        <Group gap="sm">
          <NumberInput
            value={lines}
            onChange={setLines}
            min={10}
            max={1000}
            step={50}
            size="xs"
            style={{ width: 100 }}
            label="Кол-во строк"
          />
          <Button
            size="xs"
            variant="light"
            mt="auto"
            onClick={() => { setCommitted(Number(lines)); }}
          >
            Показать
          </Button>
        </Group>
        <Group gap="sm">
          {data && (
            <Text size="xs" c="dimmed">
              {data.returned_lines} / {data.total_lines} строк
            </Text>
          )}
          <Tooltip label="Обновить" withArrow>
            <ActionIcon variant="subtle" onClick={() => refetch()} loading={isFetching}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {isLoading && <Center mt="xl"><Loader /></Center>}
      {isError && <Text c="red">Ошибка загрузки логов</Text>}

      {data && (
        <ScrollArea
          h={520}
          style={{
            background: 'var(--mantine-color-dark-8, #1a1b1e)',
            borderRadius: 'var(--mantine-radius-md)',
            border: '1px solid var(--mantine-color-default-border)',
          }}
          p="sm"
        >
          <Stack gap={1}>
            {[...data.logs].reverse().map((line, i) => (
              <Text
                key={i}
                size="xs"
                ff="monospace"
                style={{
                  color: levelColor(line) ?? 'var(--mantine-color-dark-1, #c9c9c9)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {line}
              </Text>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Stack>
  );
}

// ─── Таб: Безопасность ───────────────────────────────────────────────────────

function SecurityTab() {
  const [minAttempts, setMinAttempts] = useState<number | string>(3);
  const [committed, setCommitted] = useState(3);
  const { data, isLoading, isError, refetch, isFetching } = useAdminSuspicious(committed);
  const blockMutation = useBlockUser();
  const { data: usersData } = useAdminUsers();

  function emailToUserId(email: string): number | undefined {
    return usersData?.find((u) => u.email === email)?.id;
  }

  return (
    <Stack mt="md">
      <Group justify="space-between">
        <Group gap="sm">
          <NumberInput
            value={minAttempts}
            onChange={setMinAttempts}
            min={1}
            max={100}
            size="xs"
            style={{ width: 100 }}
            label="Мин. попыток"
          />
          <Button
            size="xs"
            variant="light"
            mt="auto"
            onClick={() => setCommitted(Number(minAttempts))}
          >
            Применить
          </Button>
        </Group>
        <Group gap="sm">
          {data && (
            <Badge color={data.total > 0 ? 'red' : 'green'} variant="light">
              {data.total > 0 ? `${data.total} подозрительных` : 'Всё чисто'}
            </Badge>
          )}
          <Tooltip label="Обновить" withArrow>
            <ActionIcon variant="subtle" onClick={() => refetch()} loading={isFetching}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {isLoading && <Center mt="xl"><Loader /></Center>}
      {isError && <Text c="red">Ошибка загрузки</Text>}

      {data && data.total === 0 && (
        <Card withBorder p="xl" radius="md" ta="center">
          <ThemeIcon size="xl" color="green" variant="light" mx="auto" mb="sm">
            <IconCheck size={24} />
          </ThemeIcon>
          <Text fw={500}>Подозрительной активности нет</Text>
          <Text size="xs" c="dimmed">Нет аккаунтов с {committed}+ неудачными попытками входа</Text>
        </Card>
      )}

      {data?.users.map((u) => (
        <Card key={u.email} withBorder p="sm" radius="md">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm">
              <ThemeIcon size="sm" color={u.is_locked ? 'red' : 'orange'} variant="light">
                <IconAlertTriangle size={12} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text size="sm" fw={500}>{u.email}</Text>
                <Group gap={6}>
                  <Badge size="xs" color="red" variant="light">
                    {u.failed_attempts} неудачных попыток
                  </Badge>
                  {u.is_locked ? (
                    <Badge size="xs" color="red" variant="filled">
                      заблок. {Math.round(u.ttl_seconds / 60)} мин
                    </Badge>
                  ) : (
                    <Badge size="xs" color="yellow" variant="light">не заблокирован</Badge>
                  )}
                </Group>
              </Stack>
            </Group>
            <Tooltip label="Заблокировать аккаунт" withArrow>
              <ActionIcon
                size="sm"
                variant="light"
                color="red"
                loading={blockMutation.isPending}
                onClick={() => {
                  const id = emailToUserId(u.email);
                  if (id) blockMutation.mutate(id);
                }}
                disabled={!emailToUserId(u.email)}
              >
                <IconLock size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

// ─── Главный дашборд ─────────────────────────────────────────────────────────

export function AdminDashboard() {
  return (
    <Container fluid py="md">
      <Group mb="md" gap="sm">
        <ThemeIcon size="lg" color="orange" variant="light">
          <IconShield size={20} />
        </ThemeIcon>
        <Title order={2}>Административная панель</Title>
      </Group>

      <Tabs defaultValue="stats">
        <Tabs.List>
          <Tabs.Tab value="stats" leftSection={<IconDatabase size={14} />}>
            Обзор
          </Tabs.Tab>
          <Tabs.Tab value="users" leftSection={<IconUsers size={14} />}>
            Пользователи
          </Tabs.Tab>
          <Tabs.Tab value="logs" leftSection={<IconFileText size={14} />}>
            Логи
          </Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconAlertTriangle size={14} />}>
            Безопасность
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="stats"><StatsTab /></Tabs.Panel>
        <Tabs.Panel value="users"><UsersTab /></Tabs.Panel>
        <Tabs.Panel value="logs"><LogsTab /></Tabs.Panel>
        <Tabs.Panel value="security"><SecurityTab /></Tabs.Panel>
      </Tabs>
    </Container>
  );
}
