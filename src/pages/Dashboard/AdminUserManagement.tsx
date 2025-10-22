import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { Plus, Search, Edit, Trash2, RefreshCcw } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { withAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser
} from '@/api/users';
import { fetchClasses } from '@/api/classes';
import type {
  CreateUserPayload,
  SchoolClassRecord,
  UpdateUserPayload,
  UserRecord,
  UserRole,
  UserStatus
} from '@/types/api';
import { cn } from '@/lib/utils';

const USER_ROLES = ['admin', 'teacher', 'student', 'parent', 'guest'] as const;
const USER_STATUSES = ['active', 'inactive'] as const;

const optionalField = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  });

const optionalPhoneField = optionalField.refine(
  (value) => !value || value.length >= 8,
  { message: 'Nomor telepon minimal 8 karakter' }
);

const optionalUrlField = optionalField.refine(
  (value) => !value || isValidUrl(value),
  { message: 'URL avatar tidak valid' }
);

const baseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nama minimal 3 karakter'),
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi')
    .email('Email tidak valid')
    .transform((value) => value.toLowerCase()),
  role: z.enum(USER_ROLES, { message: 'Peran wajib dipilih' }),
  status: z.enum(USER_STATUSES, { message: 'Status wajib dipilih' }),
  phone: optionalPhoneField,
  avatarUrl: optionalUrlField,
  classIds: z.array(z.string()).optional()
});

const createSchema = baseSchema.extend({
  password: z
    .string()
    .min(8, 'Kata sandi minimal 8 karakter')
});

const updateSchema = baseSchema.extend({
  password: optionalField.refine(
    (value) => !value || value.length >= 8,
    { message: 'Kata sandi minimal 8 karakter' }
  )
});

type CreateUserFormValues = z.infer<typeof createSchema>;
type UpdateUserFormValues = z.infer<typeof updateSchema>;

interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

const selectClassName = cn(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
);

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  teacher: 'Guru',
  student: 'Siswa',
  parent: 'Orang Tua',
  guest: 'Tamu'
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Aktif',
  inactive: 'Tidak Aktif'
};

function sanitizeOptional(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeClassIds(values?: string[] | null) {
  if (!values || values.length === 0) {
    return [];
  }
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const raw of values) {
    const trimmed = raw.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    normalized.push(trimmed);
  }
  return normalized;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatClassLabel(classInfo: Pick<SchoolClassRecord, 'name' | 'gradeLevel' | 'academicYear'>) {
  const segments: string[] = [classInfo.name];

  if (classInfo.gradeLevel !== undefined && classInfo.gradeLevel !== null) {
    segments.push(`Kelas ${classInfo.gradeLevel}`);
  }

  segments.push(classInfo.academicYear);

  return segments.filter(Boolean).join(' - ');
}

function getUserClassLabels(user: UserRecord, classLookup: Map<string, string>) {
  if (user.classes && user.classes.length > 0) {
    return user.classes.map((item) => formatClassLabel(item));
  }
  if (!user.classIds || user.classIds.length === 0) {
    return [];
  }
  return user.classIds.map((id) => classLookup.get(id) ?? `ID tidak dikenal: ${id}`);
}

function CreateUserForm({
  onSubmit,
  isSubmitting,
  classOptions,
  isClassLoading
}: {
  onSubmit: (values: CreateUserPayload) => void;
  isSubmitting: boolean;
  classOptions: SchoolClassRecord[];
  isClassLoading: boolean;
}) {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'teacher',
      status: 'active',
      phone: '',
      avatarUrl: '',
      classIds: [],
      password: ''
    }
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = form;

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          name: values.name.trim(),
          email: values.email,
          role: values.role,
          status: values.status,
          phone: sanitizeOptional(values.phone),
          avatarUrl: sanitizeOptional(values.avatarUrl),
          classIds: normalizeClassIds(values.classIds),
          password: values.password
        })
      )}
    >
      <FormField label="Nama Lengkap" error={errors.name?.message}>
        <Input placeholder="Masukkan nama" {...register('name')} />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" placeholder="nama@sekolah.sch.id" {...register('email')} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Peran" error={errors.role?.message}>
          <select className={selectClassName} {...register('role')}>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Status" error={errors.status?.message}>
          <select className={selectClassName} {...register('status')}>
            {USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Nomor Telepon" error={errors.phone?.message}>
          <Input placeholder="Contoh: 081234567890" {...register('phone')} />
        </FormField>

        <FormField label="Kelas / Departemen" error={errors.classIds?.message}>
          <Controller
            control={control}
            name="classIds"
            render={({ field }) => (
              <select
                className={`${selectClassName} min-h-[120px]`}
                disabled={isClassLoading}
                multiple
                onBlur={field.onBlur}
                onChange={(event) => {
                  const selections = Array.from(event.target.selectedOptions).map(
                    (option) => option.value
                  );
                  field.onChange(selections);
                }}
                value={field.value ?? []}
              >
                {classOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {formatClassLabel(item)}
                  </option>
                ))}
              </select>
            )}
          />
          <span className="text-xs text-muted-foreground">
            Tahan Ctrl / Command untuk memilih lebih dari satu kelas.
          </span>
          {!isClassLoading && classOptions.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              Belum ada kelas terdaftar.
            </span>
          ) : null}
        </FormField>
      </div>

      <FormField label="URL Avatar" error={errors.avatarUrl?.message}>
        <Input placeholder="https://" {...register('avatarUrl')} />
      </FormField>

      <FormField label="Kata Sandi" error={errors.password?.message}>
        <Input type="password" placeholder="Minimal 8 karakter" {...register('password')} />
      </FormField>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Menyimpan...' : 'Tambah Pengguna'}
      </Button>
    </form>
  );
}

function EditUserForm({
  user,
  onSubmit,
  isSubmitting,
  classOptions,
  isClassLoading
}: {
  user: UserRecord;
  onSubmit: (values: UpdateUserPayload) => void;
  isSubmitting: boolean;
  classOptions: SchoolClassRecord[];
  isClassLoading: boolean;
}) {
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone ?? '',
      avatarUrl: user.avatarUrl ?? '',
      classIds: user.classIds,
      password: ''
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = form;

  useEffect(() => {
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone ?? '',
      avatarUrl: user.avatarUrl ?? '',
      classIds: user.classIds,
      password: ''
    });
  }, [reset, user]);

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          name: values.name?.trim(),
          email: values.email,
          role: values.role,
          status: values.status,
          phone: sanitizeOptional(values.phone),
          avatarUrl: sanitizeOptional(values.avatarUrl),
          classIds: normalizeClassIds(values.classIds),
          password: sanitizeOptional(values.password)
        })
      )}
    >
      <FormField label="Nama Lengkap" error={errors.name?.message}>
        <Input placeholder="Masukkan nama" {...register('name')} />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" placeholder="nama@sekolah.sch.id" {...register('email')} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Peran" error={errors.role?.message}>
          <select className={selectClassName} {...register('role')}>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Status" error={errors.status?.message}>
          <select className={selectClassName} {...register('status')}>
            {USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Nomor Telepon" error={errors.phone?.message}>
          <Input placeholder="Contoh: 081234567890" {...register('phone')} />
        </FormField>

        <FormField label="Kelas / Departemen" error={errors.classIds?.message}>
          <Controller
            control={control}
            name="classIds"
            render={({ field }) => (
              <select
                className={`${selectClassName} min-h-[120px]`}
                disabled={isClassLoading}
                multiple
                onBlur={field.onBlur}
                onChange={(event) => {
                  const selections = Array.from(event.target.selectedOptions).map(
                    (option) => option.value
                  );
                  field.onChange(selections);
                }}
                value={field.value ?? []}
              >
                {classOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {formatClassLabel(item)}
                  </option>
                ))}
              </select>
            )}
          />
          <span className="text-xs text-muted-foreground">
            Tahan Ctrl / Command untuk memilih lebih dari satu kelas.
          </span>
          {!isClassLoading && classOptions.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              Belum ada kelas terdaftar.
            </span>
          ) : null}
        </FormField>
      </div>

      <FormField label="URL Avatar" error={errors.avatarUrl?.message}>
        <Input placeholder="https://" {...register('avatarUrl')} />
      </FormField>

      <FormField label="Kata Sandi Baru" error={errors.password?.message}>
        <Input type="password" placeholder="Kosongkan jika tidak diubah" {...register('password')} />
      </FormField>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </form>
  );
}

function FormField({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm">
      <span className="font-medium text-school-text">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : null}
    </label>
  );
}

function getRoleBadge(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'bg-school-accent/10 text-school-accent';
    case 'teacher':
      return 'bg-blue-100 text-blue-800';
    case 'student':
      return 'bg-green-100 text-green-800';
    case 'parent':
      return 'bg-orange-100 text-orange-800';
    case 'guest':
      return 'bg-gray-200 text-gray-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
}

function getStatusBadge(status: UserStatus) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-200 text-gray-800';
  }
}

function AdminUserManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers
  });

  const classesQuery = useQuery<SchoolClassRecord[]>({
    queryKey: ['school-classes'],
    queryFn: fetchClasses
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setCreateOpen(false);
      setFeedback({ type: 'success', message: 'Pengguna berhasil ditambahkan' });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message ?? 'Gagal menambahkan pengguna'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditTarget(null);
      setFeedback({ type: 'success', message: 'Perubahan pengguna tersimpan' });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message ?? 'Gagal memperbarui pengguna'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteTarget(null);
      setFeedback({ type: 'success', message: 'Pengguna berhasil dihapus' });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message ?? 'Gagal menghapus pengguna'
      });
    }
  });

  const classOptions: SchoolClassRecord[] = classesQuery.data ?? [];

  const classLookup = useMemo(() => {
    const map = new Map<string, string>();
    classOptions.forEach((item) => {
      map.set(item.id, formatClassLabel(item));
    });
    return map;
  }, [classOptions]);

  const users = usersQuery.data ?? [];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const classLabels = getUserClassLabels(user, classLookup);
      const matchesSearch = `${user.name} ${user.email} ${classLabels.join(' ')}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter, classLookup]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.status === 'active').length;
    const teachers = users.filter((user) => user.role === 'teacher').length;
    const admins = users.filter((user) => user.role === 'admin').length;
    return [
      {
        title: 'Total Pengguna',
        value: total,
        caption: 'Seluruh akun terdaftar'
      },
      {
        title: 'Pengguna Aktif',
        value: active,
        caption: 'Memiliki status aktif'
      },
      {
        title: 'Akun Guru',
        value: teachers,
        caption: 'Role guru terdaftar'
      },
      {
        title: 'Akun Admin',
        value: admins,
        caption: 'Memiliki hak admin'
      }
    ];
  }, [users]);

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-school-text">Manajemen Pengguna</h1>
          <p className="text-sm text-school-text-muted">
            Kelola akun admin, guru, siswa, dan peran lainnya dari satu tempat
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={usersQuery.isLoading || classesQuery.isLoading}
            onClick={() => {
              usersQuery.refetch();
              classesQuery.refetch();
            }}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Muat ulang
          </Button>
          <Button onClick={() => setCreateOpen(true)} type="button">
            <Plus className="mr-2 h-4 w-4" /> Tambah pengguna
          </Button>
        </div>
      </div>

      {feedback ? (
        <div
          className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      {classesQuery.isError ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Tidak dapat memuat daftar kelas. Anda masih bisa menyimpan pengguna tanpa memilih kelas.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardDescription>{item.title}</CardDescription>
              <CardTitle className="text-3xl font-semibold">{item.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Pengguna</CardTitle>
          <CardDescription>
            {filteredUsers.length} dari {users.length}{' '}
            pengguna memenuhi filter saat ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Cari berdasarkan nama atau email"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <select
                className={selectClassName}
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
              >
                <option value="all">Semua peran</option>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
              <select
                className={selectClassName}
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as typeof statusFilter)
                }
              >
                <option value="all">Semua status</option>
                {USER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Pengguna</th>
                  <th className="px-4 py-3 font-medium">Peran</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Kelas / Departemen</th>
                  <th className="px-4 py-3 font-medium">Login Terakhir</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersQuery.isLoading ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={6}>
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : null}

                {usersQuery.isError ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-red-600" colSpan={6}>
                      Gagal memuat pengguna. Silakan coba lagi.
                    </td>
                  </tr>
                ) : null}

                {!usersQuery.isLoading && filteredUsers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={6}>
                      Tidak ada pengguna yang cocok dengan filter.
                    </td>
                  </tr>
                ) : null}

                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} src={user.avatarUrl} />
                        <div>
                          <p className="font-medium text-school-text">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                          getRoleBadge(user.role)
                        )}
                      >
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                          getStatusBadge(user.status)
                        )}
                      >
                        {STATUS_LABELS[user.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-school-text">
                      {(() => {
                        const classLabels = getUserClassLabels(user, classLookup);
                        return classLabels.length ? classLabels.join(', ') : '-';
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => setEditTarget(user)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setDeleteTarget(user)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={(open) => !isMutating && setCreateOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>
              Pastikan email unik dan kata sandi memenuhi standar keamanan
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm
            classOptions={classOptions}
            isClassLoading={classesQuery.isLoading}
            isSubmitting={createMutation.isPending}
            onSubmit={(values) => createMutation.mutate(values)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !isMutating && !open && setEditTarget(null)}>
        <DialogContent>
          {editTarget ? (
            <>
              <DialogHeader>
                <DialogTitle>Ubah Data Pengguna</DialogTitle>
                <DialogDescription>
                  Perbarui informasi akun maupun akses role pengguna
                </DialogDescription>
              </DialogHeader>
              <EditUserForm
                classOptions={classOptions}
                isClassLoading={classesQuery.isLoading}
                isSubmitting={updateMutation.isPending}
                onSubmit={(payload) =>
                  updateMutation.mutate({ id: editTarget.id, payload })
                }
                user={editTarget}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !isMutating && !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pengguna akan kehilangan akses dashboard.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus akun{' '}
            <span className="font-medium text-school-text">{deleteTarget?.name}</span>?
          </p>
          <DialogFooter className="gap-2">
            <Button
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTarget(null)}
              type="button"
              variant="outline"
            >
              Batal
            </Button>
            <Button
              disabled={!deleteTarget || deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              type="button"
              variant="destructive"
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus' }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserAvatar({ name, src }: { name: string; src: string | null }) {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0])
      .join('')
      .toUpperCase();
  }, [name]);

  if (!src || failed) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-school-accent/10 text-sm font-semibold text-school-accent">
        {initials || 'U'}
      </div>
    );
  }

  return (
    <img
      alt={name}
      className="h-10 w-10 rounded-full object-cover"
      onError={() => setFailed(true)}
      src={src}
    />
  );
}

export default withAuth(AdminUserManagement, ['admin']);
