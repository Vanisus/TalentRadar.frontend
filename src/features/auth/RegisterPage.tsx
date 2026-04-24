import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, TextInput, PasswordInput, Button, Stack, Title } from '@mantine/core';
import { useRegisterMutation } from './api';
import { notifyError } from '../../shared/notifications';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const registerMutation = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      notifyError('Пароли не совпадают.', 'Ошибка');
      return;
    }
    try {
      await registerMutation.mutateAsync({
        full_name: fullName,
        email,
        password,
        password_confirm: passwordConfirm,
      });
      navigate('/', { replace: true });
    } catch (err) {
      notifyError(err, 'Ошибка регистрации');
    }
  };

  return (
    <Stack align="center" justify="center" sx={{ minHeight: '100vh' }}>
      <Paper withBorder shadow="md" p="xl" radius="md" w={360}>
        <Title order={3} mb="md">
          Регистрация
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="ФИО"
              placeholder="Фамилия Имя Отчество"
              value={fullName}
              onChange={(e) => setFullName(e.currentTarget.value)}
              required
            />
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
            <PasswordInput
              label="Подтверждение пароля"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={registerMutation.isPending}>
              Зарегистрироваться
            </Button>
            <Button variant="subtle" onClick={() => navigate('/login')} disabled={registerMutation.isPending}>
              Уже есть аккаунт? Войти
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
