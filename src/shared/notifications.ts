// src/shared/notifications.ts
// Центральный модуль уведомлений. Используйте эти функции повсюду вместо notifications.show()
import { notifications } from '@mantine/notifications';

// ─── Перевод серверных сообщений на русский ─────────────────────────────────

const ERROR_MAP: Record<string, string> = {
  // Auth
  'Too many failed login attempts. Please try again in 15 minutes.':
    'Слишком много неудачных попыток входа. Пожалуйста, подождите 15 минут.',
  'Invalid email or password': 'Неверный email или пароль.',
  'Invalid credentials': 'Неверный email или пароль.',
  'Account is blocked': 'Аккаунт заблокирован администратором.',
  'User is blocked': 'Аккаунт заблокирован администратором.',
  'Email already registered': 'Пользователь с таким email уже зарегистрирован.',
  'Email already exists': 'Пользователь с таким email уже зарегистрирован.',
  'Passwords do not match': 'Пароли не совпадают.',
  'Password too short': 'Пароль слишком короткий (минимум 8 символов).',
  'UNAUTHORIZED': 'Сессия истекла. Пожалуйста, войдите снова.',
  // Vacancies
  'Vacancy not found': 'Вакансия не найдена.',
  'Vacancy is not active': 'Эта вакансия уже неактивна.',
  // Applications
  'Application already exists': 'Вы уже откликались на эту вакансию.',
  'Resume not found': 'Пожалуйста, сначала загрузите резюме.',
  'No resume uploaded': 'Пожалуйста, сначала загрузите резюме.',
  // HTTP
  'HTTP 400': 'Некорректный запрос.',
  'HTTP 401': 'Необходима авторизация.',
  'HTTP 403': 'Доступ запрещён.',
  'HTTP 404': 'Ресурс не найден.',
  'HTTP 409': 'Конфликт: такая запись уже существует.',
  'HTTP 422': 'Неверные данные в запросе.',
  'HTTP 429': 'Слишком много запросов. Подождите немного.',
  'HTTP 500': 'Ошибка сервера. Пожалуйста, попробуйте позже.',
  // Network
  'Failed to fetch': 'Нет связи с сервером. Проверьте интернет-соединение.',
  'NetworkError': 'Ошибка сети. Проверьте интернет-соединение.',
  'Load failed': 'Нет связи с сервером.',
};

/** Переводит серверное сообщение на русский. Если перевод не найден — возвращает оригинал. */
export function translateError(msg: string): string {
  // Точное совпадение
  if (ERROR_MAP[msg]) return ERROR_MAP[msg];
  // По началу (если сервер шлёт доп. текст после кода)
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg.startsWith(key)) return val;
  }
  // Уже на русском — оставляем как есть
  if (/[а-яёА-ЯЁ]/.test(msg)) return msg;
  return msg;
}

// ─── Быстрые хелперы ────────────────────────────────────────────────────────────────

export function showError(message: string, title = 'Ошибка') {
  notifications.show({
    title,
    message: translateError(message),
    color: 'red',
    autoClose: 6000,
    withBorder: true,
  });
}

export function showSuccess(message: string, title = 'Готово') {
  notifications.show({
    title,
    message,
    color: 'teal',
    autoClose: 4000,
    withBorder: true,
  });
}

export function showWarning(message: string, title = 'Внимание') {
  notifications.show({
    title,
    message: translateError(message),
    color: 'yellow',
    autoClose: 5000,
    withBorder: true,
  });
}

/** Универсальный обработчик: получает Error | unknown, показывает toast */
export function notifyError(err: unknown, title?: string) {
  let msg = 'Неизвестная ошибка';
  if (err instanceof Error) msg = err.message;
  else if (typeof err === 'string') msg = err;
  showError(msg, title);
}
