import { Button, Checkbox, Group, Stack, TextInput, Textarea, Select } from '@mantine/core';
import { useState } from 'react';
import type { WorkExperienceRead, WorkExperienceCreate } from './experienceApi';

interface Props {
  initial?: WorkExperienceRead | null;
  onSubmit: (values: WorkExperienceCreate) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const monthOptions = [
  { value: '01', label: 'Январь' },
  { value: '02', label: 'Февраль' },
  { value: '03', label: 'Март' },
  { value: '04', label: 'Апрель' },
  { value: '05', label: 'Май' },
  { value: '06', label: 'Июнь' },
  { value: '07', label: 'Июль' },
  { value: '08', label: 'Август' },
  { value: '09', label: 'Сентябрь' },
  { value: '10', label: 'Октябрь' },
  { value: '11', label: 'Ноябрь' },
  { value: '12', label: 'Декабрь' },
];

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1950; y--) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
}

const yearOptions = getYearOptions();

// Из YYYY-MM-DD вытащить месяц и год
function parseDate(dateStr: string | null | undefined) {
  if (!dateStr) return { month: null, year: null };
  const parts = dateStr.split('-');
  return {
    year: parts[0] ?? null,
    month: parts[1] ?? null,
  };
}

export function ExperienceForm({ initial, onSubmit, onCancel, isLoading }: Props) {
  const [company, setCompany] = useState(initial?.company ?? '');
  const [position, setPosition] = useState(initial?.position ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isCurrent, setIsCurrent] = useState(initial?.is_current ?? false);

  const parsedStart = parseDate(initial?.start_date);
  const parsedEnd = parseDate(initial?.end_date);

  const [startMonth, setStartMonth] = useState<string | null>(parsedStart.month);
  const [startYear, setStartYear] = useState<string | null>(parsedStart.year);
  const [endMonth, setEndMonth] = useState<string | null>(parsedEnd.month);
  const [endYear, setEndYear] = useState<string | null>(parsedEnd.year);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position || !startMonth || !startYear) return;

    // Формируем YYYY-MM-01
    const start_date = `${startYear}-${startMonth}-01`;
    const end_date =
      isCurrent || !endMonth || !endYear
        ? null
        : `${endYear}-${endMonth}-01`;

    onSubmit({
      company,
      position,
      description: description || null,
      start_date,
      end_date,
      is_current: isCurrent,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Компания"
          value={company}
          onChange={(e) => setCompany(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Должность"
          value={position}
          onChange={(e) => setPosition(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Описание"
          value={description ?? ''}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />

        {/* Дата начала */}
        <Group grow>
          <Select
            label="Месяц начала"
            placeholder="Месяц"
            data={monthOptions}
            value={startMonth}
            onChange={setStartMonth}
            required
          />
          <Select
            label="Год начала"
            placeholder="Год"
            data={yearOptions}
            value={startYear}
            onChange={setStartYear}
            searchable
            required
          />
        </Group>

        {/* Дата окончания */}
        <Group grow>
          <Select
            label="Месяц окончания"
            placeholder="Месяц"
            data={monthOptions}
            value={isCurrent ? null : endMonth}
            onChange={setEndMonth}
            disabled={isCurrent}
            clearable
          />
          <Select
            label="Год окончания"
            placeholder="Год"
            data={yearOptions}
            value={isCurrent ? null : endYear}
            onChange={setEndYear}
            searchable
            disabled={isCurrent}
            clearable
          />
        </Group>

        <Checkbox
          label="По настоящее время"
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
