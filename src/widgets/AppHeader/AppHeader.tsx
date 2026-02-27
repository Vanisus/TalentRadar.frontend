import { Button, Group, Text } from '@mantine/core';
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

  const handleLogout = async () => {
    try {
      await logoutRequest(); // POST /auth/logout[file:2]
    } catch {
      // игнорируем ошибки бэка при логауте
    } finally {
      dispatch(clearAuth());
      navigate('/login', { replace: true });
    }
  };

  const displayName = user?.fullname || user?.email || 'Пользователь';

  return (
    <Group justify="space-between" h="100%" px="md">
      <Text fw={600}>TalentRadar</Text>
      <Group gap="md">
        <NotificationsBell />
        <Text size="sm">{displayName}</Text>
        <Button variant="outline" size="xs" onClick={handleLogout}>
          Выйти
        </Button>
      </Group>
    </Group>
  );
}
