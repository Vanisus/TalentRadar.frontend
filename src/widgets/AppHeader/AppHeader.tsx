import { ActionIcon, Button, Group, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/shared/auth';
import { clearAuth } from '@/app/authSlice';
import { logoutRequest } from '@/shared/api/authApi';
import { NotificationsBell } from '@/features/notifications/NotificationsBell';

export function AppHeader() {
  const { data: user } = useCurrentUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
      // ignore
    } finally {
      dispatch(clearAuth());
      navigate('/login', { replace: true });
    }
  };

  const displayName = user?.full_name || user?.email || 'Пользователь';

  return (
    <Group justify="space-between" h="100%" px="md">
      <Group gap="xs">
        <Text fw={800} size="lg" variant="gradient" gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
          style={{ letterSpacing: '-0.5px' }}
        >
          TalentRadar
        </Text>
      </Group>

      <Group gap="sm">
        <NotificationsBell />

        <Tooltip label={colorScheme === 'dark' ? 'Светлая тема' : 'Тёмная тема'} withArrow>
          <ActionIcon
            variant="subtle"
            size="md"
            onClick={() => toggleColorScheme()}
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark'
              ? <IconSun size={18} />
              : <IconMoon size={18} />}
          </ActionIcon>
        </Tooltip>

        <Text size="sm" c="dimmed">{displayName}</Text>
        <Button variant="outline" size="xs" onClick={handleLogout}>
          Выйти
        </Button>
      </Group>
    </Group>
  );
}
