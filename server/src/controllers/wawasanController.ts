import { z } from 'zod';
import type { Request, Response } from 'express';
import type {
  Prisma,
  WawasanContent,
  WawasanHeritageValue,
  WawasanStructureEntry,
  WawasanTimelineEntry
} from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const SECTION_KEYS = ['sejarah', 'visi-misi', 'struktur', 'our-teams'] as const;
type WawasanKey = (typeof SECTION_KEYS)[number];

const sectionKeySchema = z.enum(SECTION_KEYS);

const mediaUrlSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });

const wawasanSectionSchema = z.object({
  title: z.string().min(3),
  mediaUrl: mediaUrlSchema,
  content: z.record(z.any()).default({})
});

const timelineEntrySchema = z.object({
  period: z.string().min(3),
  description: z.string().min(10),
  order: z.number().int().min(0).optional()
});

const timelineUpdateSchema = timelineEntrySchema.extend({ id: z.string() });

const heritageValueSchema = z.object({
  value: z.string().min(3),
  order: z.number().int().min(0).optional()
});

const heritageUpdateSchema = heritageValueSchema.extend({ id: z.string() });

const structureEntrySchema = z.object({
  position: z.string().min(2),
  name: z.string().min(2),
  department: z.string().optional(),
  parentId: z.string().optional().or(z.literal(null)),
  order: z.number().int().min(0).optional()
});

const structureUpdateSchema = structureEntrySchema.extend({ id: z.string() });

type TeamMemberWithSpecialization = Prisma.TeamMemberGetPayload<{ include: { specializations: true } }>;

type JsonRecord = Record<string, unknown>;

type HeritagePayload = {
  title?: string;
  description?: string;
  values?: Array<{ id?: string; value: string; order?: number }>;
};

type SectionContent = JsonRecord & {
  heritage?: HeritagePayload;
};

const TIMELINE_SECTION_KEY: WawasanKey = 'sejarah';
const STRUCTURE_SECTION_KEY: WawasanKey = 'struktur';

function isMissingDelegateError(error: unknown) {
  return error instanceof TypeError && /findMany/.test(error.message);
}

function warnMissingDelegate(context: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[wawasan] Prisma delegate missing for ${context}. Using fallback dataset.`);
  }
}

function isWawasanKey(value: string): value is WawasanKey {
  return SECTION_KEYS.includes(value as WawasanKey);
}

function parseContent(raw: string | null): SectionContent {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as SectionContent;
    return parsed ?? {};
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[wawasan] Failed to parse content JSON', error);
    }
    return {};
  }
}

function serializeSection(section: WawasanContent, content: unknown) {
  return {
    id: section.id,
    key: section.key,
    title: section.title,
    mediaUrl: section.mediaUrl ?? null,
    content,
    createdAt: section.createdAt.toISOString(),
    updatedAt: section.updatedAt.toISOString()
  };
}

function serializeTimeline(entry: WawasanTimelineEntry) {
  return {
    id: entry.id,
    period: entry.period,
    description: entry.description,
    order: entry.order,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

function serializeHeritageValue(entry: WawasanHeritageValue) {
  return {
    id: entry.id,
    value: entry.value,
    order: entry.order,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

function serializeStructure(entry: WawasanStructureEntry) {
  return {
    id: entry.id,
    position: entry.position,
    name: entry.name,
    department: entry.department ?? null,
    parentId: entry.parentId ?? null,
    order: entry.order,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

function serializeTeamMember(member: TeamMemberWithSpecialization) {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    category: member.category,
    department: member.department,
    email: member.email,
    education: member.education,
    experience: member.experience,
    photo: member.photoUrl ?? null,
    order: member.order,
    specialization: member.specializations.map((item) => item.value),
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString()
  };
}

async function buildSectionResponse(section: WawasanContent) {
  const key = isWawasanKey(section.key) ? (section.key as WawasanKey) : null;
  const baseContent = parseContent(section.content);

  if (!key) {
    return serializeSection(section, baseContent);
  }

  switch (key) {
    case 'sejarah': {
      try {
        const [timelineEntries, heritageValues] = await Promise.all([
          prisma.wawasanTimelineEntry.findMany({
            where: { sectionKey: TIMELINE_SECTION_KEY },
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
          }),
          prisma.wawasanHeritageValue.findMany({
            where: { sectionKey: TIMELINE_SECTION_KEY },
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
          })
        ]);

        const heritageBase = baseContent.heritage ?? {};
        const content = {
          ...baseContent,
          timeline: timelineEntries.map(serializeTimeline),
          heritage: {
            ...heritageBase,
            values: heritageValues.map(serializeHeritageValue)
          }
        };

        return serializeSection(section, content);
      } catch (error) {
        if (isMissingDelegateError(error)) {
          warnMissingDelegate('timeline/heritage');
          return serializeSection(section, baseContent);
        }
        throw error;
      }
    }
    case 'struktur': {
      try {
        const structure = await prisma.wawasanStructureEntry.findMany({
          where: { sectionKey: STRUCTURE_SECTION_KEY },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
        });

        const content = {
          ...baseContent,
          entries: structure.map(serializeStructure)
        };

        return serializeSection(section, content);
      } catch (error) {
        if (isMissingDelegateError(error)) {
          warnMissingDelegate('structure');
          return serializeSection(section, baseContent);
        }
        throw error;
      }
    }
    case 'our-teams': {
      try {
        const members = await prisma.teamMember.findMany({
          include: { specializations: true },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
        });

        const content = {
          ...baseContent,
          members: members.map(serializeTeamMember)
        };

        return serializeSection(section, content);
      } catch (error) {
        if (isMissingDelegateError(error)) {
          warnMissingDelegate('team members');
          return serializeSection(section, baseContent);
        }
        throw error;
      }
    }
    default:
      return serializeSection(section, baseContent);
  }
}

async function ensureSectionUpdatedAt(key: WawasanKey) {
  await prisma.wawasanContent.updateMany({
    where: { key },
    data: { updatedAt: new Date() }
  });
}

async function getNextOrderForTimeline(): Promise<number> {
  const result = await prisma.wawasanTimelineEntry.aggregate({
    where: { sectionKey: TIMELINE_SECTION_KEY },
    _max: { order: true }
  });
  const current = result._max.order ?? -1;
  return current + 1;
}

async function getNextOrderForHeritage(): Promise<number> {
  const result = await prisma.wawasanHeritageValue.aggregate({
    where: { sectionKey: TIMELINE_SECTION_KEY },
    _max: { order: true }
  });
  const current = result._max.order ?? -1;
  return current + 1;
}

async function getNextOrderForStructure(): Promise<number> {
  const result = await prisma.wawasanStructureEntry.aggregate({
    where: { sectionKey: STRUCTURE_SECTION_KEY },
    _max: { order: true }
  });
  const current = result._max.order ?? -1;
  return current + 1;
}

export async function getWawasan(_req: Request, res: Response) {
  const sections = await prisma.wawasanContent.findMany({ orderBy: { key: 'asc' } });
  const payload = await Promise.all(sections.map((section) => buildSectionResponse(section)));
  return res.json(payload);
}

export async function getWawasanSection(req: Request, res: Response) {
  const parsedKey = sectionKeySchema.safeParse(req.params.key);
  if (!parsedKey.success) {
    return res.status(400).json({ message: 'Invalid wawasan section key' });
  }

  const section = await prisma.wawasanContent.findUnique({ where: { key: parsedKey.data } });
  if (!section) {
    return res.status(404).json({ message: 'Wawasan section not found' });
  }

  const payload = await buildSectionResponse(section);
  return res.json(payload);
}

export async function updateWawasanSection(req: Request, res: Response) {
  const parsedKey = sectionKeySchema.safeParse(req.params.key);
  if (!parsedKey.success) {
    return res.status(400).json({ message: 'Invalid wawasan section key' });
  }

  const parsedBody = wawasanSectionSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ message: 'Invalid wawasan payload', issues: parsedBody.error.flatten() });
  }

  const { title, mediaUrl, content } = parsedBody.data;
  const key = parsedKey.data;

  const stored = await prisma.wawasanContent.upsert({
    where: { key },
    update: {
      title,
      mediaUrl: mediaUrl === undefined ? undefined : mediaUrl,
      content: JSON.stringify(content)
    },
    create: {
      key,
      title,
      mediaUrl: mediaUrl ?? null,
      content: JSON.stringify(content)
    }
  });

  const payload = await buildSectionResponse(stored);
  return res.json(payload);
}

export async function listTimelineEntries(_req: Request, res: Response) {
  try {
    const entries = await prisma.wawasanTimelineEntry.findMany({
      where: { sectionKey: TIMELINE_SECTION_KEY },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
    });

    return res.json(entries.map(serializeTimeline));
  } catch (error) {
    if (isMissingDelegateError(error)) {
      warnMissingDelegate('timeline list');
      return res.json([]);
    }
    throw error;
  }
}

export async function createTimelineEntry(req: Request, res: Response) {
  const parsed = timelineEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid timeline payload', issues: parsed.error.flatten() });
  }

  const { period, description, order } = parsed.data;
  const resolvedOrder = order ?? (await getNextOrderForTimeline());

  const created = await prisma.wawasanTimelineEntry.create({
    data: {
      sectionKey: TIMELINE_SECTION_KEY,
      period,
      description,
      order: resolvedOrder
    }
  });

  await ensureSectionUpdatedAt(TIMELINE_SECTION_KEY);

  return res.status(201).json(serializeTimeline(created));
}

export async function updateTimelineEntry(req: Request, res: Response) {
  const parsed = timelineUpdateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid timeline payload', issues: parsed.error.flatten() });
  }

  const { id, period, description, order } = parsed.data;

  const updated = await prisma.wawasanTimelineEntry.update({
    where: { id },
    data: {
      period,
      description,
      order: order ?? (await getNextOrderForTimeline())
    }
  });

  await ensureSectionUpdatedAt(TIMELINE_SECTION_KEY);

  return res.json(serializeTimeline(updated));
}

export async function deleteTimelineEntry(req: Request, res: Response) {
  const id = req.params.id;
  await prisma.wawasanTimelineEntry.delete({ where: { id } });
  await ensureSectionUpdatedAt(TIMELINE_SECTION_KEY);
  return res.status(204).send();
}

export async function listHeritageValues(_req: Request, res: Response) {
  try {
    const entries = await prisma.wawasanHeritageValue.findMany({
      where: { sectionKey: TIMELINE_SECTION_KEY },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
    });
    return res.json(entries.map(serializeHeritageValue));
  } catch (error) {
    if (isMissingDelegateError(error)) {
      warnMissingDelegate('heritage list');
      return res.json([]);
    }
    throw error;
  }
}

export async function createHeritageValue(req: Request, res: Response) {
  const parsed = heritageValueSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid heritage payload', issues: parsed.error.flatten() });
  }

  const { value, order } = parsed.data;
  const resolvedOrder = order ?? (await getNextOrderForHeritage());

  const created = await prisma.wawasanHeritageValue.create({
    data: {
      sectionKey: TIMELINE_SECTION_KEY,
      value,
      order: resolvedOrder
    }
  });

  await ensureSectionUpdatedAt(TIMELINE_SECTION_KEY);

  return res.status(201).json(serializeHeritageValue(created));
}

export async function updateHeritageValue(req: Request, res: Response) {
  const parsed = heritageUpdateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid heritage payload', issues: parsed.error.flatten() });
  }

  const { id, value, order } = parsed.data;

  const updated = await prisma.wawasanHeritageValue.update({
    where: { id },
    data: {
      value,
      order: order ?? (await getNextOrderForHeritage())
    }
  });

  await ensureSectionUpdatedAt(TIMELINE_SECTION_KEY);

  return res.json(serializeHeritageValue(updated));
}

export async function deleteHeritageValue(req: Request, res: Response) {
  const id = req.params.id;
  await prisma.wawasanHeritageValue.delete({ where: { id } });
  await ensureSectionUpdatedAt(TIMELINE_SECTION_KEY);
  return res.status(204).send();
}

export async function listStructureEntries(_req: Request, res: Response) {
  try {
    const entries = await prisma.wawasanStructureEntry.findMany({
      where: { sectionKey: STRUCTURE_SECTION_KEY },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
    });
    return res.json(entries.map(serializeStructure));
  } catch (error) {
    if (isMissingDelegateError(error)) {
      warnMissingDelegate('structure list');
      return res.json([]);
    }
    throw error;
  }
}

export async function createStructureEntry(req: Request, res: Response) {
  const parsed = structureEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid structure payload', issues: parsed.error.flatten() });
  }

  const { position, name, department, parentId, order } = parsed.data;
  const resolvedOrder = order ?? (await getNextOrderForStructure());

  const created = await prisma.wawasanStructureEntry.create({
    data: {
      sectionKey: STRUCTURE_SECTION_KEY,
      position,
      name,
      department: department ?? null,
      parentId: parentId ?? null,
      order: resolvedOrder
    }
  });

  await ensureSectionUpdatedAt(STRUCTURE_SECTION_KEY);

  return res.status(201).json(serializeStructure(created));
}

export async function updateStructureEntry(req: Request, res: Response) {
  const parsed = structureUpdateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid structure payload', issues: parsed.error.flatten() });
  }

  const { id, position, name, department, parentId, order } = parsed.data;

  const updated = await prisma.wawasanStructureEntry.update({
    where: { id },
    data: {
      position,
      name,
      department: department ?? null,
      parentId: parentId ?? null,
      order: order ?? (await getNextOrderForStructure())
    }
  });

  await ensureSectionUpdatedAt(STRUCTURE_SECTION_KEY);

  return res.json(serializeStructure(updated));
}

export async function deleteStructureEntry(req: Request, res: Response) {
  const id = req.params.id;
  await prisma.wawasanStructureEntry.delete({ where: { id } });
  await ensureSectionUpdatedAt(STRUCTURE_SECTION_KEY);
  return res.status(204).send();
}
