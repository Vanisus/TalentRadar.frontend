import { useState } from 'react';
import { Card, Group, Text, Button, Stack } from '@mantine/core';
import {
  usePortfolioItems,
  useAddPortfolioItem,
  useUpdatePortfolioItem,
  useDeletePortfolioItem,
  type PortfolioItem,
  type PortfolioItemCreate,
} from './portfolioApi';
import { PortfolioForm } from './PortfolioForm';

function PortfolioItemCard({ item }: { item: PortfolioItem }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdatePortfolioItem();
  const remove = useDeletePortfolioItem();

  if (editing) {
    return (
      <Card withBorder p="md" radius="md">
        <PortfolioForm
          initial={item}
          isLoading={update.isPending}
          onSubmit={(values) =>
            update.mutate(
              { id: item.id, ...values },
              { onSuccess: () => setEditing(false) },
            )
          }
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Text fw={500}>{item.title}</Text>
          {item.url && (
            <Text
              size="sm"
              c="blue"
              component="a"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.url}
            </Text>
          )}
          {item.description && (
            <Text size="sm" mt={4}>{item.description}</Text>
          )}
        </Stack>
        <Group gap="xs">
          <Button size="xs" variant="subtle" onClick={() => setEditing(true)}>
            Редактировать
          </Button>
          <Button
            size="xs"
            color="red"
            variant="subtle"
            loading={remove.isPending}
            onClick={() => remove.mutate(item.id)}
          >
            Удалить
          </Button>
        </Group>
      </Group>
    </Card>
  );
}

export function PortfolioList() {
  const { data: items } = usePortfolioItems();
  const add = useAddPortfolioItem();
  const [creating, setCreating] = useState(false);

  return (
    <Stack mt="xl">
      <Group justify="space-between">
        <Text fw={600} size="lg">Портфолио</Text>
        <Button size="xs" onClick={() => setCreating(true)} disabled={creating}>
          + Добавить
        </Button>
      </Group>

      {creating && (
        <Card withBorder p="md" radius="md">
          <PortfolioForm
            initial={null}
            isLoading={add.isPending}
            onSubmit={(values) =>
              add.mutate(values, { onSuccess: () => setCreating(false) })
            }
            onCancel={() => setCreating(false)}
          />
        </Card>
      )}

      {items?.map((item) => (
        <PortfolioItemCard key={item.id} item={item} />
      ))}

      {!items?.length && !creating && (
        <Text size="sm" c="dimmed">Элементов портфолио пока нет.</Text>
      )}
    </Stack>
  );
}
