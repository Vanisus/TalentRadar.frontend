import { Button, Checkbox, Group, Stack, TextInput, Select } from '@mantine/core';
import { useState } from 'react';
import type { Education, EducationCreate } from './educationApi';

interface Props {
  initial?: Education | null;
  onSubmit: (values: EducationCreate) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1950; y--) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
}

const yearOptions = getYearOptions();

export function EducationForm({ initial, onSubmit, onCancel, isLoading }: Props) {
  const [institution, setInstitution] = useState(initial?.institution ?? '');
  const [degree, setDegree] = useState(initial?.degree ?? '');
  const [fieldOfStudy, setFieldOfStudy] = useState(initial?.field_of_study ?? '');
  const [isCurrent, setIsCurrent] = useState(initial?.is_current ?? false);
  const [startYear, setStartYear] = useState<string | null>(
    initial?.start_year ? String(initial.start_year) : null,
  );
  const [endYear, setEndYear] = useState<string | null>(
    initial?.end_year ? String(initial.end_year) : null,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !degree || !startYear) return;

    onSubmit({
      institution,
      degree,
      field_of_study: fieldOfStudy || null,
      start_year: Number(startYear),
      end_year: isCurrent || !endYear ? null : Number(endYear),
      is_current: isCurrent,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Учебное заведение"
          value={institution}
          onChange={(e) => setInstitution(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Степень / уровень образования"
          value={degree}
          onChange={(e) => setDegree(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Специальность"
          value={fieldOfStudy}
          onChange={(e) => setFieldOfStudy(e.currentTarget.value)}
        />
        <Group grow>
          <Select
            label="Год начала"
            placeholder="Выберите год"
            data={yearOptions}
            value={startYear}
            onChange={setStartYear}
            searchable
            required
          />
          <Select
            label="Год окончания"
            placeholder="Выберите год"
            data={yearOptions}
            value={isCurrent ? null : endYear}
            onChange={setEndYear}
            disabled={isCurrent}
            searchable
            clearable
          />
        </Group>
        <Checkbox
          label="Учусь по настоящее время"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.currentTarget.checked)}
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
