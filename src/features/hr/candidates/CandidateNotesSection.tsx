import { useState } from 'react';
import {
  Card,
  Stack,
  Group,
  Text,
  Textarea,
  Button,
  Loader,
  Center,
} from '@mantine/core';
import {
  useCandidateNotes,
  useCreateCandidateNote,
  useDeleteCandidateNote,
  type HRCandidateNote,
} from './candidatesApi';

interface CandidateNotesSectionProps {
  candidateId: number;
}

function NoteItem({
  note,
  onDelete,
  deleting,
}: {
  note: HRCandidateNote;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <Card withBorder p="sm" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="sm">{note.body}</Text>
          <Text size="xs" c="dimmed">
            {new Date(note.created_at).toLocaleString('ru-RU')}
            {note.hr && ` · ${note.hr.full_name}`}
          </Text>
        </Stack>
        <Button
          size="xs"
          variant="subtle"
          color="red"
          onClick={onDelete}
          loading={deleting}
        >
          Удалить
        </Button>
      </Group>
    </Card>
  );
}



export function CandidateNotesSection({ candidateId }: CandidateNotesSectionProps) {
  const { data: notes, isLoading, isError } = useCandidateNotes(candidateId);
  const createNote = useCreateCandidateNote();
  const deleteNote = useDeleteCandidateNote();

  const [text, setText] = useState('');

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    createNote.mutate(
        { candidateId, data: { body: trimmed } },
        { onSuccess: () => setText('') },
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
        Ошибка загрузки заметок
      </Text>
    );
  }

  return (
    <Stack mt="md">
      <Text fw={600} size="lg">
        Заметки по кандидату
      </Text>

      <Card withBorder p="md" radius="md">
        <Stack gap="sm">
          <Textarea
            label="Новая заметка"
            placeholder="Добавьте комментарий по кандидату"
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
            minRows={3}
            autosize
          />
          <Group justify="flex-end">
            <Button
              size="sm"
              onClick={handleAdd}
              loading={createNote.isPending}
              disabled={!text.trim()}
            >
              Добавить заметку
            </Button>
          </Group>
        </Stack>
      </Card>

      {!notes?.length && (
        <Text size="sm" c="dimmed">
          Заметок пока нет.
        </Text>
      )}

      {notes?.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          deleting={deleteNote.isPending}
          onDelete={() =>
            deleteNote.mutate({ candidateId, noteId: note.id })
          }
        />
      ))}
    </Stack>
  );
}
