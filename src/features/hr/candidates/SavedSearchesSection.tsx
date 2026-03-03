import { useState } from 'react';
import {
  Card,
  Stack,
  Group,
  Text,
  TextInput,
  Button,
  Loader,
  Center,
  Switch,
  NumberInput,
  Badge,
} from '@mantine/core';
import {
  useSavedSearches,
  useCreateSavedSearch,
  useDeleteSavedSearch,
  useRunSavedSearch,
} from './candidatesApi';
import type { HRSavedSearch, HRCandidate } from '../types';

export function SavedSearchesSection() {
  const { data: searches, isLoading, isError } = useSavedSearches();
  const createSearch = useCreateSavedSearch();
  const deleteSearch = useDeleteSavedSearch();
  const runSearch = useRunSavedSearch();

  const [name, setName] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [city, setCity] = useState('');
  const [searchText, setSearchText] = useState('');
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [minMatch, setMinMatch] = useState<number | null>(null);

  const [activeSearch, setActiveSearch] = useState<HRSavedSearch | null>(null);
  const [results, setResults] = useState<HRCandidate[] | null>(null);

  const handleCreate = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    createSearch.mutate(
      {
        name: trimmedName,
        skills,
        city: city || null,
        has_resume: hasResume,
        is_active: isActive,
        is_blocked: null,
        vacancy_id: null,
        min_match_score: minMatch,
        search_text: searchText || null,
      },
      {
        onSuccess: () => {
          setName('');
          setSkillsInput('');
          setCity('');
          setSearchText('');
          setHasResume(null);
          setIsActive(null);
          setMinMatch(null);
        },
      },
    );
  };

  const handleRun = (search: HRSavedSearch) => {
    setActiveSearch(search);
    setResults(null);
    runSearch.mutate(search.id, {
      onSuccess: (data) => setResults(data),
    });
  };

  const formatFlags = (s: HRSavedSearch) => {
    const items: string[] = [];
    if (s.has_resume === true) items.push('с резюме');
    if (s.has_resume === false) items.push('без резюме');
    if (s.is_active === true) items.push('активные');
    if (s.is_active === false) items.push('неактивные');
    if (s.min_match_score != null) items.push(`match ≥ ${s.min_match_score}%`);
    return items.join(' · ');
  };

  if (isLoading) {
    return (
      <Center mt="md">
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Text mt="md" c="red">
        Ошибка загрузки сохранённых поисков
      </Text>
    );
  }

  return (
    <Stack mt="md">
      <Text fw={600} size="lg">
        Сохранённые поиски
      </Text>

      {/* Форма создания сохранённого поиска */}
      <Card withBorder p="md" radius="md">
        <Stack gap="sm">
          <TextInput
            label="Название поиска"
            placeholder="Например: Senior backend в Москве"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <TextInput
            label="Навыки (через запятую)"
            placeholder="Python, Django, PostgreSQL"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.currentTarget.value)}
          />
          <Group grow>
            <TextInput
              label="Город"
              placeholder="Москва"
              value={city}
              onChange={(e) => setCity(e.currentTarget.value)}
            />
            <NumberInput
              label="Минимальный match score"
              placeholder="0–100"
              min={0}
              max={100}
              value={minMatch}
              onChange={(value) =>
                setMinMatch(typeof value === 'number' ? value : null)
              }
            />
          </Group>
          <TextInput
            label="Поиск по тексту (email/имя)"
            placeholder="ivan@example.com, Иван"
            value={searchText}
            onChange={(e) => setSearchText(e.currentTarget.value)}
          />
          <Group>
            <Switch
                label="Только кандидаты с резюме"
                checked={hasResume === true}
                onChange={(e) => setHasResume(e.currentTarget.checked ? true : null)}
                />
            <Switch
                label="Только активные кандидаты"
                checked={isActive === true}
                onChange={(e) => setIsActive(e.currentTarget.checked ? true : null)}
                />
          </Group>
          <Group justify="flex-end">
            <Button
              size="sm"
              onClick={handleCreate}
              loading={createSearch.isPending}
              disabled={!name.trim()}
            >
              Сохранить поиск
            </Button>
          </Group>
        </Stack>
      </Card>

      {!searches?.length && (
        <Text size="sm" c="dimmed">
          Сохранённых поисков пока нет.
        </Text>
      )}

      {/* Список сохранённых поисков */}
      {searches?.map((s) => (
        <Card key={s.id} withBorder p="md" radius="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text fw={500}>{s.name}</Text>
              <Group gap="xs">
                {s.skills?.length > 0 && (
                  <Badge variant="light" color="blue">
                    {s.skills.join(', ')}
                  </Badge>
                )}
                {s.city && (
                  <Badge variant="light" color="grape">
                    {s.city}
                  </Badge>
                )}
              </Group>
              {formatFlags(s) && (
                <Text size="sm" c="dimmed">
                  {formatFlags(s)}
                </Text>
              )}
              {s.search_text && (
                <Text size="sm" c="dimmed">
                  Текст: {s.search_text}
                </Text>
              )}
              <Text size="xs" c="dimmed">
                Создан:{' '}
                {new Date(s.created_at).toLocaleString('ru-RU')}
              </Text>
            </Stack>
            <Stack gap="xs" align="flex-end">
              <Button
                size="xs"
                variant="light"
                onClick={() => handleRun(s)}
                loading={runSearch.isPending && activeSearch?.id === s.id}
              >
                Запустить
              </Button>
              <Button
                size="xs"
                variant="subtle"
                color="red"
                onClick={() => deleteSearch.mutate(s.id)}
                loading={deleteSearch.isPending}
              >
                Удалить
              </Button>
            </Stack>
          </Group>
        </Card>
      ))}

      {/* Результаты выполнения поиска */}
      {activeSearch && (
        <Card withBorder p="md" radius="md">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={500}>
                Результаты поиска: {activeSearch.name}
              </Text>
              {runSearch.isPending && <Loader size="xs" />}
            </Group>

            {!runSearch.isPending && (!results || results.length === 0) && (
              <Text size="sm" c="dimmed">
                Кандидатов по этому поиску не найдено.
              </Text>
            )}

            {results &&
              results.map((c) => (
                <Group key={c.id} justify="space-between">
                  <Stack gap={0}>
                    <Text size="sm" fw={500}>
                      {c.full_name ?? 'Имя не указано'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {c.email}
                    </Text>
                  </Stack>
                  {c.city && (
                    <Text size="xs" c="dimmed">
                      {c.city}
                    </Text>
                  )}
                </Group>
              ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
