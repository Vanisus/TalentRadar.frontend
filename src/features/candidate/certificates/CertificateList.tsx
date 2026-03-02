import { useState } from 'react';
import { Card, Group, Text, Button, Stack, TextInput } from '@mantine/core';
import {
  useCertificates,
  useUploadCertificate,
  useDeleteCertificate,
  type Certificate,
} from './certificatesApi';
import { API_BASE } from '@/shared/api';

function CertificateCard({ cert }: { cert: Certificate }) {
  const remove = useDeleteCertificate();

  const resolveUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const previewUrl = resolveUrl(cert.preview_path || cert.file_path);

  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Text fw={500}>{cert.title}</Text>
          {cert.issuer && (
            <Text size="sm" c="dimmed">{cert.issuer}</Text>
          )}
          {cert.issue_date && (
            <Text size="xs" c="dimmed">Дата выдачи: {cert.issue_date}</Text>
          )}
        </Stack>
        <Group gap="xs">
          {previewUrl && (
            <Button
              size="xs"
              variant="light"
              component="a"
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть
            </Button>
          )}
          <Button
            size="xs"
            color="red"
            variant="subtle"
            loading={remove.isPending}
            onClick={() => remove.mutate(cert.id)}
          >
            Удалить
          </Button>
        </Group>
      </Group>
      {previewUrl && (
        <img
          src={previewUrl}
          alt={cert.title}
          style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', marginTop: 8 }}
        />
      )}
    </Card>
  );
}

export function CertificateList() {
  const { data: certificates, isLoading } = useCertificates();
  const uploadMutation = useUploadCertificate();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadMutation.mutateAsync({ file, title: title || undefined });
      setTitle('');
      setFile(null);
      // сбросить input file
      const input = document.getElementById('cert-file-input') as HTMLInputElement;
      if (input) input.value = '';
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack mt="xl">
      <Group justify="space-between">
        <Text fw={600} size="lg">Сертификаты</Text>
      </Group>

      {isLoading ? (
        <Text size="sm" c="dimmed">Загрузка...</Text>
      ) : !certificates?.length ? (
        <Text size="sm" c="dimmed">Сертификатов пока нет.</Text>
      ) : (
        certificates.map((cert) => (
          <CertificateCard key={cert.id} cert={cert} />
        ))
      )}

      {/* Форма загрузки */}
      <Card withBorder p="md" radius="md">
        <Text fw={500} mb="sm">Загрузить сертификат</Text>
        <Stack>
          <TextInput
            label="Название"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="Например, AWS Certified Developer"
          />
          <div>
            <Text size="sm" mb={4}>Файл (PDF, PNG, JPG)</Text>
            <input
              id="cert-file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          {uploadMutation.isError && (
            <Text c="red" size="sm">
              {(uploadMutation.error as Error).message}
            </Text>
          )}
          <Button
            onClick={handleUpload}
            loading={uploading}
            disabled={!file}
          >
            Загрузить
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
