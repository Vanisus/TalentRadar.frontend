import { Stack, Text, Loader, Center, SimpleGrid, Card } from '@mantine/core';
import { useHRDashboardStats } from '../hrApi';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card withBorder p="md" radius="md">
      <Text size="sm" c="dimmed">{label}</Text>
      <Text fw={700} size="xl" mt={4}>{value}</Text>
    </Card>
  );
}

export function AnalyticsTab() {
  const { data: stats, isLoading, isError } = useHRDashboardStats();

  if (isLoading) return <Center mt="xl"><Loader /></Center>;
  if (isError) return <Text c="red" mt="md">Ошибка загрузки аналитики</Text>;
  if (!stats) return null;

  return (
    <Stack mt="md">
      <Text fw={600} size="lg">Аналитика</Text>
      <SimpleGrid cols={3} spacing="md">
        <StatCard label="Всего вакансий" value={stats.total_vacancies} />
        <StatCard label="Активных вакансий" value={stats.active_vacancies} />
        <StatCard label="Всего откликов" value={stats.total_applications} />
        <StatCard label="Новых откликов" value={stats.new_applications} />
        <StatCard label="Принято" value={stats.accepted_applications} />
        <StatCard label="Отклонено" value={stats.rejected_applications} />
      </SimpleGrid>
    </Stack>
  );
}
