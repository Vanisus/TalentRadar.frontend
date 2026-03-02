import { Button, Group, Stack, TextInput, Textarea } from '@mantine/core';
import { useState } from 'react';
import type { PortfolioItem, PortfolioItemCreate } from './portfolioApi';

interface Props {
  initial?: PortfolioItem | null;
  onSubmit: (values: PortfolioItemCreate) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PortfolioForm({ initial, onSubmit, onCancel, isLoading }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onSubmit({
      title,
      url: url || null,
      description: description || null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Название"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Ссылка (GitHub, Behance и т.п.)"
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
        />
        <Textarea
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" loading={isLoading}>
            Сохранить
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
