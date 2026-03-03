import { useState } from 'react';
import {
  Card,
  Stack,
  Group,
  Text,
  TextInput,
  Button,
  Badge,
  Loader,
  Center,
} from '@mantine/core';
import {
  useCandidateTags,
  useCreateCandidateTag,
  useDeleteCandidateTag,
  type HRCandidateTag,
} from './candidatesApi';

interface CandidateTagsSectionProps {
  candidateId: number;
}

function TagItem({
  tag,
  onDelete,
  deleting,
}: {
  tag: HRCandidateTag;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <Badge
      rightSection={
        <Button
          size="xs"
          variant="subtle"
          color="red"
          onClick={onDelete}
          loading={deleting}
          style={{ paddingInline: 4 }}
        >
          ×
        </Button>
      }
      variant="outline"
      radius="md"
      styles={{
        root: { paddingRight: 0 },
      }}
    >
      {tag.name}
    </Badge>
  );
}

export function CandidateTagsSection({ candidateId }: CandidateTagsSectionProps) {
  const { data: tags, isLoading, isError } = useCandidateTags(candidateId);
  const createTag = useCreateCandidateTag();
  const deleteTag = useDeleteCandidateTag();

  const [name, setName] = useState('');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createTag.mutate(
      { candidateId, data: { name: trimmed } },
      {
        onSuccess: () => setName(''),
      },
    );
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
        Ошибка загрузки тегов
      </Text>
    );
  }

  return (
    <Stack mt="md">
      <Text fw={600} size="lg">
        Теги кандидата
      </Text>

      <Card withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group align="flex-end">
            <TextInput
              label="Новый тег"
              placeholder="Например: Backend, Senior, Java"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <Button
              size="sm"
              onClick={handleAdd}
              loading={createTag.isPending}
              disabled={!name.trim()}
            >
              Добавить
            </Button>
          </Group>
        </Stack>
      </Card>

      {!tags?.length && (
        <Text size="sm" c="dimmed">
          Тегов пока нет.
        </Text>
      )}

      {tags && tags.length > 0 && (
        <Group gap="xs">
          {tags.map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              deleting={deleteTag.isPending}
              onDelete={() =>
                deleteTag.mutate({ candidateId, tagId: tag.id })
              }
            />
          ))}
        </Group>
      )}
    </Stack>
  );
}
