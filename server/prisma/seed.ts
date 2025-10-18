import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

type JsonRecord = Record<string, any>;

async function loadJson<T = JsonRecord[]>(filename: string, fallback: T): Promise<T> {
  try {
    const filePath = path.resolve(DATA_DIR, filename);
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

async function clearDatabase() {
  await prisma.documentVerificationLog.deleteMany();
  await prisma.documentRecord.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.validatorHistory.deleteMany();
  await prisma.pCPDBEntry.deleteMany();
  await prisma.teacherClassAssignment.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.parentStudentLink.deleteMany();
  await prisma.schoolEvent.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.galleryTag.deleteMany();
  await prisma.extracurricularAchievement.deleteMany();
  await prisma.extracurricular.deleteMany();
  await prisma.article.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.teamMemberSpecialization.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.wawasanStructureEntry.deleteMany();
  await prisma.wawasanHeritageValue.deleteMany();
  await prisma.wawasanTimelineEntry.deleteMany();
  await prisma.wawasanContent.deleteMany();
  await prisma.fAQItem.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.schoolClass.deleteMany();
  await prisma.user.deleteMany();
}

function asDate(value: string | Date | undefined | null, fallback?: Date): Date | undefined {
  if (!value) return fallback;
  return value instanceof Date ? value : new Date(value);
}

function asDateRequired(value: string | Date, label: string): Date {
  const parsed = asDate(value);
  if (!parsed) {
    throw new Error(`Missing date for ${label}`);
  }
  return parsed;
}

async function main() {
  const [
    userSeed,
    announcementSeed,
    articleSeed,
    extracurricularSeed,
    faqSeed,
    gallerySeed,
    wawasanSeed,
    teamSeed,
    pcpdbSeed
  ] = await Promise.all([
    loadJson<JsonRecord[]>('users.json', []),
    loadJson<JsonRecord[]>('announcements.json', []),
    loadJson<JsonRecord[]>('articles.json', []),
    loadJson<JsonRecord[]>('extracurriculars.json', []),
    loadJson<JsonRecord[]>('faq.json', []),
    loadJson<JsonRecord[]>('gallery.json', []),
    loadJson<JsonRecord[]>('wawasan.json', []),
    loadJson<JsonRecord[]>('teams.json', []),
    loadJson<JsonRecord[]>('pcpdb.json', [])
  ]);

  await clearDatabase();

  const now = new Date();

  const classes = [
    {
      id: 'class-xii-mipa-1',
      name: 'XII MIPA 1',
      gradeLevel: 12,
      academicYear: '2025/2026',
      description: 'Fokus pada sains dan teknologi dengan persiapan PTN.',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'class-xi-ips-1',
      name: 'XI IPS 1',
      gradeLevel: 11,
      academicYear: '2025/2026',
      description: 'Program sosial humaniora dengan penekanan literasi ekonomi.',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'class-x-mipa-2',
      name: 'X MIPA 2',
      gradeLevel: 10,
      academicYear: '2025/2026',
      description: 'Kelas baru dengan integrasi kurikulum Merdeka.',
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const cls of classes) {
    await prisma.schoolClass.create({ data: cls });
  }

  const subjects = [
    {
      id: 'subject-math',
      name: 'Matematika',
      code: 'MATH',
      description: 'Matematika wajib peminatan MIPA',
      credits: 3,
      color: '#174B96',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'subject-physics',
      name: 'Fisika',
      code: 'PHYS',
      description: 'Fisika tingkat lanjutan',
      credits: 3,
      color: '#0056A4',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'subject-english',
      name: 'Bahasa Inggris',
      code: 'ENGL',
      description: 'Academic English & IELTS preparation',
      credits: 2,
      color: '#6AB7FF',
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const subject of subjects) {
    await prisma.subject.create({ data: subject });
  }

  const classMap = new Map<string, string>(classes.map((item) => [item.id, item.id]));
  const subjectMap = new Map<string, string>(subjects.map((item) => [item.id, item.id]));

  const userMap = new Map<string, string>();

  for (const user of userSeed) {
    const created = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
  email: user.email.toLowerCase(),
        passwordHash: user.passwordHash,
        role: user.role ?? 'student',
        status: user.status ?? 'active',
        phone: user.phone ?? null,
        avatarUrl: user.avatarUrl ?? null,
        classId: user.role === 'student' ? classMap.get('class-xii-mipa-1') ?? null : null,
        lastLogin: asDate(user.lastLogin) ?? null,
        createdAt: asDate(user.createdAt) ?? now,
        updatedAt: asDate(user.updatedAt) ?? now
      }
    });
    userMap.set(created.id, created.id);
  }

  const teacherId = userMap.get('user-teacher-1');
  if (teacherId) {
    await prisma.schoolClass.update({
      where: { id: 'class-xii-mipa-1' },
      data: { homeroomTeacherId: teacherId }
    });
  }

  const studentId = userMap.get('user-student-1');
  const parentId = userMap.get('user-parent-1');

  if (parentId && studentId) {
    await prisma.parentStudentLink.create({
      data: {
        id: 'parent-link-1',
        parentId,
        studentId,
        relationship: 'Orang Tua',
        createdAt: now,
        updatedAt: now
      }
    });
  }

  if (teacherId && studentId) {
    const gradeSeed = [
      {
        id: 'grade-1',
        studentId,
        subjectId: subjectMap.get('subject-math')!,
        classId: classMap.get('class-xii-mipa-1')!,
        teacherId,
        term: 'Ganjil 2025/2026',
        assessmentType: 'UTS',
        score: 88.5,
        remarks: 'Sangat baik',
        issuedAt: new Date('2025-10-10T00:00:00.000Z'),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'grade-2',
        studentId,
        subjectId: subjectMap.get('subject-physics')!,
        classId: classMap.get('class-xii-mipa-1')!,
        teacherId,
        term: 'Ganjil 2025/2026',
        assessmentType: 'Kuiz',
        score: 92,
        remarks: 'Pertahankan prestasi',
        issuedAt: new Date('2025-10-05T00:00:00.000Z'),
        createdAt: now,
        updatedAt: now
      }
    ];

    for (const grade of gradeSeed) {
      await prisma.grade.create({ data: grade });
    }
  }

  if (teacherId) {
    const assignments = [
      {
        id: 'assign-mipa1-math',
        teacherId,
        classId: classMap.get('class-xii-mipa-1')!,
        subjectId: subjectMap.get('subject-math')!,
        role: 'Wali Kelas',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'assign-mipa1-physics',
        teacherId,
        classId: classMap.get('class-xii-mipa-1')!,
        subjectId: subjectMap.get('subject-physics')!,
        role: 'Guru Mapel',
        createdAt: now,
        updatedAt: now
      }
    ];

    for (const assignment of assignments) {
      await prisma.teacherClassAssignment.create({ data: assignment });
    }

    const schedules = [
      {
        id: 'schedule-math-mon',
        classId: classMap.get('class-xii-mipa-1')!,
        subjectId: subjectMap.get('subject-math')!,
        teacherId,
        dayOfWeek: 'Monday',
        startTime: new Date('2025-10-13T07:00:00.000Z'),
        endTime: new Date('2025-10-13T08:30:00.000Z'),
        location: 'Ruang 201',
        notes: 'Materi Integral',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'schedule-physics-wed',
        classId: classMap.get('class-xii-mipa-1')!,
        subjectId: subjectMap.get('subject-physics')!,
        teacherId,
        dayOfWeek: 'Wednesday',
        startTime: new Date('2025-10-15T09:00:00.000Z'),
        endTime: new Date('2025-10-15T10:30:00.000Z'),
        location: 'Laboratorium Fisika',
        notes: 'Percobaan Optik',
        createdAt: now,
        updatedAt: now
      }
    ];

    for (const schedule of schedules) {
      await prisma.classSchedule.create({ data: schedule });
    }
  }

  const announcements = announcementSeed.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    content: item.content,
    date: asDateRequired(item.date, `announcement:${item.id}`),
    category: item.category ?? 'Umum',
    pinned: Boolean(item.pinned),
    imageUrl: item.imageUrl ?? null,
    authorId: teacherId ?? null,
    createdAt: asDate(item.createdAt) ?? now,
    updatedAt: asDate(item.updatedAt) ?? now
  }));

  for (const announcement of announcements) {
    await prisma.announcement.create({ data: announcement });
  }

  for (const article of articleSeed) {
    const createdArticle = await prisma.article.create({
      data: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        coverImage: article.coverImage ?? null,
        summary: article.summary,
        content: article.content,
        publishedAt: asDateRequired(article.publishedAt, `article:${article.id}`),
        authorId: teacherId ?? null,
        createdAt: asDate(article.createdAt) ?? now,
        updatedAt: asDate(article.updatedAt) ?? now
      }
    });

    const tags: string[] = Array.isArray(article.tags) ? article.tags : [];
    for (const tag of tags) {
      await prisma.articleTag.create({
        data: {
          id: `${createdArticle.id}-${tag}`,
          articleId: createdArticle.id,
          value: tag,
          createdAt: now
        }
      });
    }
  }

  for (const extracurricular of extracurricularSeed) {
    const createdExtracurricular = await prisma.extracurricular.create({
      data: {
        id: extracurricular.id,
        name: extracurricular.name,
        description: extracurricular.description,
        category: extracurricular.category ?? 'Umum',
        schedule: extracurricular.schedule ?? '-',
        mentorName: extracurricular.mentor ?? 'Pembina Ekstrakurikuler',
        mentorId: teacherId ?? null,
        isNew: Boolean(extracurricular.isNew),
        coverImage: extracurricular.coverImage ?? null,
        createdAt: asDate(extracurricular.createdAt) ?? now,
        updatedAt: asDate(extracurricular.updatedAt) ?? now
      }
    });

    const achievements: string[] = Array.isArray(extracurricular.achievements) ? extracurricular.achievements : [];
    for (const achievement of achievements) {
      await prisma.extracurricularAchievement.create({
        data: {
          id: `${createdExtracurricular.id}-${achievement}`,
          extracurricularId: createdExtracurricular.id,
          description: achievement,
          createdAt: now
        }
      });
    }
  }

  for (const faq of faqSeed) {
    await prisma.fAQItem.create({
      data: {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category ?? 'Umum',
        order: faq.order ?? 0,
        createdAt: asDate(faq.createdAt) ?? now,
        updatedAt: asDate(faq.updatedAt) ?? now
      }
    });
  }

  for (const gallery of gallerySeed) {
    const entry = await prisma.galleryItem.create({
      data: {
        id: gallery.id,
        title: gallery.title,
        description: gallery.description,
        imageUrl: gallery.imageUrl,
        publishedAt: asDateRequired(gallery.publishedAt, `gallery:${gallery.id}`),
        createdAt: asDate(gallery.createdAt) ?? now,
        updatedAt: asDate(gallery.updatedAt) ?? now
      }
    });

    const tags: string[] = Array.isArray(gallery.tags) ? gallery.tags : [];
    for (const tag of tags) {
      await prisma.galleryTag.create({
        data: {
          id: `${entry.id}-${tag}`,
          galleryItemId: entry.id,
          value: tag,
          createdAt: now
        }
      });
    }
  }

  for (const wawasan of wawasanSeed) {
    const rawContent = typeof wawasan.content === 'string' ? wawasan.content : JSON.stringify(wawasan.content ?? {});
    let parsedContent: Record<string, unknown> = {};

    try {
      parsedContent = JSON.parse(rawContent) as Record<string, unknown>;
    } catch {
      parsedContent = {};
    }

    const normalizedContent: Record<string, unknown> = { ...parsedContent };
    const timelineItems = Array.isArray((parsedContent as any).timeline) ? ((parsedContent as any).timeline as Array<Record<string, unknown>>) : [];
    delete (normalizedContent as any).timeline;

    const heritageRaw = (parsedContent as any).heritage;
    let heritageValues: Array<Record<string, unknown> | string> = [];
    if (heritageRaw && typeof heritageRaw === 'object') {
      const { values, ...heritageRest } = heritageRaw as Record<string, unknown> & { values?: unknown };
      heritageValues = Array.isArray(values) ? (values as Array<Record<string, unknown> | string>) : [];
      normalizedContent.heritage = heritageRest;
    } else if ('heritage' in normalizedContent) {
      delete (normalizedContent as any).heritage;
    }

    const structureItems = Array.isArray((parsedContent as any).entries) ? ((parsedContent as any).entries as Array<Record<string, unknown>>) : [];
    delete (normalizedContent as any).entries;

    const createdSection = await prisma.wawasanContent.create({
      data: {
        id: wawasan.id,
        key: wawasan.key,
        title: wawasan.title,
        content: JSON.stringify(normalizedContent),
        mediaUrl: wawasan.mediaUrl ?? wawasan.media ?? null,
        createdAt: asDate(wawasan.createdAt) ?? now,
        updatedAt: asDate(wawasan.updatedAt) ?? now
      }
    });

    if (createdSection.key === 'sejarah') {
      for (const [index, itemRaw] of timelineItems.entries()) {
        if (!itemRaw || typeof itemRaw !== 'object') {
          continue;
        }

        const item = itemRaw as Record<string, unknown>;
        const period = typeof item['period'] === 'string' ? (item['period'] as string) : null;
        const description = typeof item['description'] === 'string' ? (item['description'] as string) : null;
        if (!period || !description) {
          continue;
        }

        const data: Record<string, unknown> = {
          sectionKey: createdSection.key,
          period,
          description,
          order: typeof item['order'] === 'number' ? (item['order'] as number) : index
        };

        if (typeof item['id'] === 'string' && (item['id'] as string).trim() !== '') {
          data.id = item['id'];
        }

        await prisma.wawasanTimelineEntry.create({ data: data as any });
      }

      for (const [index, valueRaw] of heritageValues.entries()) {
        const valueObject = typeof valueRaw === 'object' && valueRaw !== null ? (valueRaw as Record<string, unknown>) : null;
        const value = valueObject
          ? typeof valueObject['value'] === 'string'
            ? (valueObject['value'] as string)
            : null
          : typeof valueRaw === 'string'
            ? valueRaw
            : null;
        if (!value) {
          continue;
        }

        const data: Record<string, unknown> = {
          sectionKey: createdSection.key,
          value,
          order: valueObject && typeof valueObject['order'] === 'number' ? (valueObject['order'] as number) : index
        };

        if (valueObject && typeof valueObject['id'] === 'string' && (valueObject['id'] as string).trim() !== '') {
          data.id = valueObject['id'];
        }

        await prisma.wawasanHeritageValue.create({ data: data as any });
      }
    }

    if (createdSection.key === 'struktur') {
      for (const [index, entryRaw] of structureItems.entries()) {
        if (!entryRaw || typeof entryRaw !== 'object') {
          continue;
        }

        const entry = entryRaw as Record<string, unknown>;
        const position = typeof entry['position'] === 'string' ? (entry['position'] as string) : null;
        const name = typeof entry['name'] === 'string' ? (entry['name'] as string) : null;
        if (!position || !name) {
          continue;
        }

        const data: Record<string, unknown> = {
          sectionKey: createdSection.key,
          position,
          name,
          department: typeof entry['department'] === 'string' ? (entry['department'] as string) : null,
          parentId: typeof entry['parentId'] === 'string' ? (entry['parentId'] as string) : null,
          order: typeof entry['order'] === 'number' ? (entry['order'] as number) : index
        };

        if (typeof entry['id'] === 'string' && (entry['id'] as string).trim() !== '') {
          data.id = entry['id'];
        }

        await prisma.wawasanStructureEntry.create({ data: data as any });
      }
    }
  }

  for (const member of teamSeed) {
    const createdMember = await prisma.teamMember.create({
      data: {
        id: member.id,
        name: member.name,
        role: member.role,
        category: member.category ?? 'staff',
        department: member.department ?? null,
        email: member.email ?? null,
        education: member.education ?? null,
        experience: member.experience ?? null,
        photoUrl: member.photo ?? null,
        order: member.order ?? 0,
        createdAt: asDate(member.createdAt) ?? now,
        updatedAt: asDate(member.updatedAt) ?? now
      }
    });

    const specializations: string[] = Array.isArray(member.specialization) ? member.specialization : [];
    for (const specialization of specializations) {
      await prisma.teamMemberSpecialization.create({
        data: {
          id: `${createdMember.id}-${specialization}`,
          teamMemberId: createdMember.id,
          value: specialization,
          createdAt: now
        }
      });
    }
  }

  for (const entry of pcpdbSeed) {
    await prisma.pCPDBEntry.create({
      data: {
        id: entry.id,
        applicantName: entry.applicantName,
        email: entry.email,
        phone: entry.phone,
        status: entry.status ?? 'pending',
        notes: entry.notes ?? null,
        submittedAt: asDateRequired(entry.submittedAt, `pcpdb:${entry.id}`),
        reviewedById: teacherId ?? null,
        reviewedAt: null,
        createdAt: asDate(entry.createdAt) ?? now,
        updatedAt: asDate(entry.updatedAt) ?? now
      }
    });
  }

  if (teacherId) {
    await prisma.schoolEvent.create({
      data: {
        id: 'event-open-house',
        title: 'Open House Sinlui 2025',
        description: 'Open house untuk calon siswa dan orang tua.',
        startAt: new Date('2025-11-01T01:00:00.000Z'),
        endAt: new Date('2025-11-01T06:00:00.000Z'),
        location: 'Aula Santo Yusuf',
        visibility: 'public',
        classId: null,
        createdById: teacherId,
        createdAt: now,
        updatedAt: now
      }
    });

    await prisma.notification.create({
      data: {
        id: 'notif-dashboard-welcome',
        title: 'Selamat datang di Dashboard Sinlui',
        body: 'Pantau jadwal terbaru, nilai, dan pengumuman sekolah di sini.',
        type: 'info',
        userId: studentId ?? null,
        targetRole: studentId ? null : 'student',
        metadata: null,
        createdAt: now,
        updatedAt: now
      }
    });
  }

  console.log('✅ Database seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
