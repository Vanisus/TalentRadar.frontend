import { useState } from 'react';
import { Container, Tabs, Title, Group } from '@mantine/core';
import { VacanciesTab } from './vacancies/VacanciesTab';
import { CandidatesTab } from './candidates/CandidatesTab';
import { ApplicationsTab } from './applications/ApplicationsTab';
import { AnalyticsTab } from './analytics/AnalyticsTab';

export function HRDashboard() {
  const [tab, setTab] = useState<string | null>('vacancies');

  return (
    <Container fluid py="md">
      <Group justify="space-between" mb="md">
        <Title order={2}>Кабинет HR</Title>
      </Group>
      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="vacancies">Вакансии</Tabs.Tab>
          <Tabs.Tab value="candidates">Кандидаты</Tabs.Tab>
          <Tabs.Tab value="applications">Отклики</Tabs.Tab>
          <Tabs.Tab value="analytics">Аналитика</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="vacancies">
          <VacanciesTab />
        </Tabs.Panel>
        <Tabs.Panel value="candidates">
          <CandidatesTab />
        </Tabs.Panel>
        <Tabs.Panel value="applications">
          <ApplicationsTab />
        </Tabs.Panel>
        <Tabs.Panel value="analytics">
          <AnalyticsTab />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
