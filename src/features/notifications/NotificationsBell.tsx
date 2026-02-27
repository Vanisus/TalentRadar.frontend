import { ActionIcon, Badge, Menu, Text, Loader, Group } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import {
  useGetCandidateNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from '../../shared/api/candidateApi'; // путь поправь под свой

export function NotificationsBell() {
  const { data, isLoading } = useGetCandidateNotificationsQuery();
  const [markRead] = useMarkNotificationAsReadMutation();

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleClickNotification = (id: number, isRead: boolean) => {
    if (!isRead) {
      markRead(id);
    }
  };

  return (
    <Menu withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" size="lg" style={{ position: 'relative' }}>
          <IconBell size={20} />
          {unreadCount > 0 && (
            <Badge
              color="red"
              size="xs"
              style={{ position: 'absolute', top: -4, right: -4 }}
            >
              {unreadCount}
            </Badge>
          )}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown miw={280}>
        {isLoading && (
          <Group p="sm" justify="center">
            <Loader size="sm" />
          </Group>
        )}

        {!isLoading && notifications.length === 0 && (
          <Text size="sm" p="sm">
            Уведомлений нет
          </Text>
        )}

        {!isLoading &&
          notifications.map((n) => (
            <Menu.Item
              key={n.id}
              onClick={() => handleClickNotification(n.id, n.is_read)}
            >
              <Text size="sm" fw={n.is_read ? 400 : 600}>
                {n.message}
              </Text>
              <Text size="xs" c="dimmed">
                {new Date(n.created_at).toLocaleString()}
              </Text>
            </Menu.Item>
          ))}
      </Menu.Dropdown>
    </Menu>
  );
}
