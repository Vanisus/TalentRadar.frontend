// src/features/notifications/NotificationsBell.tsx
import {
  ActionIcon,
  Badge,
  Divider,
  Group,
  Indicator,
  Loader,
  Popover,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { IconBell, IconBellCheck, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { useCurrentUser } from '@/shared/auth';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../shared/notificationsApi';

function notificationIcon(msg: string) {
  if (msg.includes('пригласили') || msg.includes('скрининг') || msg.includes('интервью'))
    return '📅';
  if (msg.includes('отказано') || msg.includes('Отклонён'))
    return '❌';
  if (msg.includes('взят в работу') || msg.includes('рассмотрении'))
    return '🔍';
  if (msg.includes('обновлён') || msg.includes('обновлен'))
    return '🔄';
  return '🔔';
}

export function NotificationsBell() {
  const [opened, setOpened] = useState(false);
  const { data: user } = useCurrentUser();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  // Для админа уведомлений пока нет — не показываем колокол
  if (user?.role === 'admin') return null;

  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.is_read);
  const unreadCount = unread.length;

  const handleOpen = (o: boolean) => {
    setOpened(o);
  };

  return (
    <Popover
      opened={opened}
      onChange={handleOpen}
      width={340}
      position="bottom-end"
      withinPortal
      shadow="md"
    >
      <Popover.Target>
        <Indicator
          disabled={unreadCount === 0}
          label={unreadCount > 9 ? '9+' : String(unreadCount)}
          size={16}
          color="red"
          offset={4}
          processing={unreadCount > 0}
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => handleOpen(!opened)}
            aria-label="Уведомления"
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        {/* Шапка */}
        <Group justify="space-between" px="md" py="sm">
          <Group gap="xs">
            <IconBell size={16} />
            <Text fw={600} size="sm">Уведомления</Text>
            {unreadCount > 0 && (
              <Badge size="xs" color="red" variant="filled">{unreadCount}</Badge>
            )}
          </Group>
          {unreadCount > 0 && (
            <Tooltip label="Отметить все прочитанными" withArrow>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                loading={markAll.isPending}
                onClick={() => markAll.mutate(notifications)}
              >
                <IconBellCheck size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>

        <Divider />

        {/* Список */}
        <ScrollArea h={Math.min(notifications.length * 72, 360)} type="auto">
          {isLoading && (
            <Group justify="center" p="md">
              <Loader size="sm" />
            </Group>
          )}

          {!isLoading && notifications.length === 0 && (
            <Stack align="center" py="xl" gap="xs">
              <IconBellCheck size={32} color="var(--mantine-color-dimmed)" />
              <Text size="sm" c="dimmed">Уведомлений нет</Text>
            </Stack>
          )}

          {!isLoading &&
            notifications.map((n) => (
              <UnstyledButton
                key={n.id}
                w="100%"
                px="md"
                py="sm"
                style={{
                  borderBottom: '1px solid var(--mantine-color-default-border)',
                  background: n.is_read
                    ? 'transparent'
                    : 'var(--mantine-color-blue-light)',
                  cursor: n.is_read ? 'default' : 'pointer',
                  transition: 'background 150ms',
                }}
                onClick={() => {
                  if (!n.is_read) markRead.mutate(n.id);
                }}
              >
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <Text size="lg" style={{ lineHeight: 1, flexShrink: 0 }}>
                    {notificationIcon(n.message)}
                  </Text>
                  <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      size="sm"
                      fw={n.is_read ? 400 : 600}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {n.message}
                    </Text>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        {new Date(n.created_at).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {!n.is_read && (
                        <Group gap={4}>
                          <IconCheck size={10} color="var(--mantine-color-blue-6)" />
                          <Text size="xs" c="blue">Прочитать</Text>
                        </Group>
                      )}
                    </Group>
                  </Stack>
                </Group>
              </UnstyledButton>
            ))}
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
  );
}
