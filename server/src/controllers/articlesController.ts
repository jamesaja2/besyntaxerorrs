import { z } from 'zod';
import type { Request, Response } from 'express';
import type { Article, ArticleTag } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const articleSchema = z.object({
  title: z.string().min(5),
  slug: z.string().min(5),
  coverImage: z.string().optional(),
  summary: z.string().min(20),
  content: z.string().min(50),
  publishedAt: z.union([z.string(), z.date()]),
  authorId: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const updateSchema = articleSchema.extend({ id: z.string() });

function parseDate(input: string | Date): Date {
  const value = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(value.getTime())) {
    throw new Error('Invalid publishedAt value');
  }
  return value;
}

function serializeArticle(article: Article & { tags: ArticleTag[] }) {
  return {
    ...article,
    publishedAt: article.publishedAt.toISOString(),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    tags: article.tags.map((tag) => tag.value)
  };
}

export async function getArticles(_req: Request, res: Response) {
  const articles = await prisma.article.findMany({
    include: { tags: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
  });

  return res.json(articles.map((article) => serializeArticle(article)));
}

export async function getArticleBySlug(req: Request, res: Response) {
  const slug = req.params.slug;
  if (!slug) {
    return res.status(400).json({ message: 'Slug is required' });
  }

  const article = await prisma.article.findFirst({
    where: {
      OR: [{ slug }, { id: slug }]
    },
    include: { tags: true }
  });

  if (!article) {
    return res.status(404).json({ message: 'Artikel tidak ditemukan' });
  }

  return res.json(serializeArticle(article));
}

export async function createArticle(req: Request, res: Response) {
  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid article payload', issues: parsed.error.flatten() });
  }

  const { tags = [], authorId, publishedAt, ...rest } = parsed.data;

  const created = await prisma.article.create({
    data: {
      ...rest,
      publishedAt: parseDate(publishedAt),
      authorId: authorId ?? null,
      tags: {
        create: tags.map((value) => ({ value }))
      }
    },
    include: { tags: true }
  });

  return res.status(201).json(serializeArticle(created));
}

export async function updateArticle(req: Request, res: Response) {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid update payload', issues: parsed.error.flatten() });
  }

  const { id, tags = [], authorId, publishedAt, ...rest } = parsed.data;

  const [_, updated] = await prisma.$transaction([
    prisma.articleTag.deleteMany({ where: { articleId: id } }),
    prisma.article.update({
      where: { id },
      data: {
        ...rest,
        publishedAt: parseDate(publishedAt),
        authorId: authorId ?? null,
        tags: {
          create: tags.map((value) => ({ value }))
        }
      },
      include: { tags: true }
    })
  ]);

  return res.json(serializeArticle(updated));
}

export async function deleteArticle(req: Request, res: Response) {
  const id = req.params.id;
  await prisma.$transaction([
    prisma.articleTag.deleteMany({ where: { articleId: id } }),
    prisma.article.delete({ where: { id } })
  ]);
  return res.status(204).send();
}
