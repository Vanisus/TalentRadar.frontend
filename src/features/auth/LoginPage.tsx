import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, TextInput, PasswordInput, Button, Stack, Title, Text } from '@mantine/core';
import { useLoginMutation } from './api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      // ошибка уже в mutation.error.message
    }
  };

  return (
    <Stack align="center" justify="center" sx={{ minHeight: '100vh' }}>
      <Paper withBorder shadow="md" p="xl" radius="md" w={360}>
        <Title order={3} mb="md">
          Вход в систему
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Пароль"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            {loginMutation.isError && (
              <Text c="red" size="sm">
                {loginMutation.error?.message}
              </Text>
            )}
            <Button type="submit" loading={loginMutation.isLoading}>
              Войти
            </Button>
            <Button variant="subtle" onClick={() => navigate('/register')} disabled={loginMutation.isLoading}>
              Нет аккаунта? Зарегистрироваться
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
