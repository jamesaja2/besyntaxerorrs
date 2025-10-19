import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Heart, Book, Trophy, Leaf, Users, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWawasanSection } from '@/hooks/useWawasanSection';
import { visiMisiFallback, visiMisiMeta, type VisionMissionContent } from '@/data/visimisi';

const valueIcons = {
  "Kesederhanaan": Heart,
  "Mati Raga": Book,
  "Penyelamatan Jiwa-jiwa": Trophy,
  "Kerendahan Hati": Leaf,
  "Kelembutan Hati": Users,
};

export function VisiMisi() {
  const { content, metadata, isLoading, isError, usedFallback } = useWawasanSection<VisionMissionContent>({
    key: 'visi-misi',
    fallback: {
      content: visiMisiFallback,
      title: visiMisiMeta.title,
      mediaUrl: visiMisiMeta.mediaUrl
    }
  });

  const {
    normalizedContent,
    displayTitle,
    usedSanitizedFallback
  } = useMemo(() => {
    let sanitizedUsedFallback = false;
    const rawContent = (content ?? {}) as Partial<VisionMissionContent>;

    const ensureText = (value: unknown, fallback: string): string => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
          return trimmed;
        }
      }
      sanitizedUsedFallback = true;
      return fallback;
    };

    const missionFallbackItems = visiMisiFallback.mission.items;
    const missionSource = Array.isArray(rawContent.mission?.items) && rawContent.mission?.items.length
      ? rawContent.mission!.items
      : (sanitizedUsedFallback = true, missionFallbackItems);

    const missionItems = missionSource.map((item, index) => {
      const fallbackItem = missionFallbackItems[index % missionFallbackItems.length];

      if (typeof item === 'string') {
        sanitizedUsedFallback = true;
        const sanitizedContent = ensureText(item, fallbackItem.content);
        return {
          id: fallbackItem.id ?? `mission-${index}`,
          content: sanitizedContent
        };
      }

      const candidateId = typeof item.id === 'string' && item.id.trim().length > 0
        ? item.id
        : (sanitizedUsedFallback = true, fallbackItem.id ?? `mission-${index}`);

      return {
        id: candidateId,
        content: ensureText(item.content, fallbackItem.content)
      };
    });

    const valuesFallbackItems = visiMisiFallback.values.items;
    const valuesSource = Array.isArray(rawContent.values?.items) && rawContent.values?.items.length
      ? rawContent.values!.items
      : (sanitizedUsedFallback = true, valuesFallbackItems);

    const valueItems = valuesSource.map((value, index) => {
      const fallbackValue = valuesFallbackItems[index % valuesFallbackItems.length];

      return {
        id: typeof value === 'object' && value !== null && typeof (value as { id?: string }).id === 'string' && (value as { id?: string }).id!.trim().length > 0
          ? (value as { id: string }).id
          : (sanitizedUsedFallback = true, fallbackValue.id ?? `value-${index}`),
        name: typeof value === 'object' && value !== null && typeof (value as { name?: string }).name === 'string'
          ? ensureText((value as { name: string }).name, fallbackValue.name)
          : (sanitizedUsedFallback = true, fallbackValue.name),
        description: typeof value === 'object' && value !== null && typeof (value as { description?: string }).description === 'string'
          ? ensureText((value as { description: string }).description, fallbackValue.description)
          : (sanitizedUsedFallback = true, fallbackValue.description)
      };
    });

    const normalized: VisionMissionContent = {
      introTitle: ensureText(rawContent.introTitle, visiMisiFallback.introTitle),
      introDescription: ensureText(rawContent.introDescription, visiMisiFallback.introDescription),
      vision: {
        title: ensureText(rawContent.vision?.title, visiMisiFallback.vision.title),
        content: ensureText(rawContent.vision?.content, visiMisiFallback.vision.content)
      },
      mission: {
        title: ensureText(rawContent.mission?.title, visiMisiFallback.mission.title),
        description: ensureText(rawContent.mission?.description, visiMisiFallback.mission.description),
        items: missionItems
      },
      values: {
        title: ensureText(rawContent.values?.title, visiMisiFallback.values.title),
        items: valueItems
      },
      cta: {
        title: ensureText(rawContent.cta?.title, visiMisiFallback.cta.title),
        description: ensureText(rawContent.cta?.description, visiMisiFallback.cta.description),
        primary: {
          label: ensureText(rawContent.cta?.primary?.label, visiMisiFallback.cta.primary.label),
          href: ensureText(rawContent.cta?.primary?.href, visiMisiFallback.cta.primary.href)
        },
        secondary: rawContent.cta?.secondary || visiMisiFallback.cta.secondary
          ? {
              label: ensureText(rawContent.cta?.secondary?.label, visiMisiFallback.cta.secondary?.label ?? ''),
              href: ensureText(rawContent.cta?.secondary?.href, visiMisiFallback.cta.secondary?.href ?? '#')
            }
          : undefined
      }
    };

    // If fallback secondary lacks label/href we drop it to avoid empty buttons.
    if (!normalized.cta.secondary?.label || !normalized.cta.secondary?.href) {
      normalized.cta.secondary = undefined;
    }

    const resolvedTitle = ensureText(metadata.title, visiMisiMeta.title);

    return {
      normalizedContent: normalized,
      displayTitle: resolvedTitle,
      usedSanitizedFallback: sanitizedUsedFallback
    };
  }, [content, metadata.title]);

  const [firstWord, ...restWords] = displayTitle.split(' ');
  const highlightText = restWords.join(' ');
  const showFallbackNotice = !isLoading && (isError || usedFallback || usedSanitizedFallback);

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.1,
        ease: 'easeOut' as const,
      },
    }),
  };

  return (
    <>
      <SEO 
        title="Visi & Misi - SMA Katolik St. Louis 1 Surabaya"
        description="Visi dan misi SMA Katolik St. Louis 1 Surabaya dalam mewujudkan pribadi beriman dan berprestasi dengan karakter Vinsensian yang peduli sesama."
        keywords="visi misi SMA St. Louis 1, karakter Vinsensian, beriman berbudi berprestasi, peduli lingkungan"
      />

      <div className="min-h-screen pt-20">
        <Section>
          <SectionHeader>
            <SectionTitle as="h1">
              {firstWord}
              {highlightText ? (
                <>
                  {' '}
                  <span className="gradient-text">{highlightText}</span>
                </>
              ) : null}
            </SectionTitle>
            <SectionDescription>
              {normalizedContent.introDescription}
            </SectionDescription>
          </SectionHeader>

          {showFallbackNotice && (
            <motion.div
              className="mb-8 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-4 w-4" />
              Konten ditampilkan dari data cadangan.
            </motion.div>
          )}

          {/* Visi */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-school-accent/10 to-school-accent-dark/10 border-school-accent/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Target className="w-12 h-12 text-school-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-school-text mb-2">
                    {normalizedContent.vision.title}
                  </h3>
                </div>
                
                <blockquote className="text-lg text-school-text leading-relaxed text-center italic font-medium">
                  "{normalizedContent.vision.content}"
                </blockquote>
              </CardContent>
            </Card>
          </motion.div>

          {/* Misi */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-school-secondary/50 border-school-accent/20">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <CheckCircle className="w-12 h-12 text-school-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-school-text mb-2">
                    {normalizedContent.mission.title}
                  </h3>
                  {normalizedContent.mission.description ? (
                    <p className="text-school-text-muted">{normalizedContent.mission.description}</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {normalizedContent.mission.items.map((item, index) => (
                    <motion.div
                      key={item.id ?? index}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="flex items-start p-4 bg-school-primary/50 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-school-accent/20 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <span className="text-school-accent font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-school-text leading-relaxed">
                        {item.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Nilai-nilai Utama */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-school-text mb-2">
                {normalizedContent.values.title}
              </h3>
              <p className="text-school-text-muted">
                Lima pilar utama yang menjadi karakteristik lulusan St. Louis 1
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {normalizedContent.values.items.map((value, index) => {
                const IconComponent = valueIcons[value.name as keyof typeof valueIcons] ?? Heart;
                
                return (
                  <motion.div
                    key={value.id ?? value.name}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <Card className="h-full bg-school-secondary/30 border-school-accent/20 card-hover group">
                      <CardContent className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                          <div className="p-4 rounded-2xl bg-school-accent/10 group-hover:bg-school-accent/20 transition-colors">
                            <IconComponent className="w-8 h-8 text-school-accent" />
                          </div>
                        </div>
                        
                        <h4 className="text-xl font-bold text-school-text mb-3 group-hover:text-school-accent transition-colors">
                          {value.name}
                        </h4>
                        
                        <p className="text-school-text-muted leading-relaxed">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-school-secondary/50 rounded-2xl p-8 border border-school-accent/20">
              <h3 className="text-2xl font-bold text-school-text mb-4">
                {normalizedContent.cta.title}
              </h3>
              <p className="text-school-text-muted mb-6 max-w-2xl mx-auto">
                {normalizedContent.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-school-accent hover:bg-school-accent/80 text-school-primary">
                  <Link to={normalizedContent.cta.primary.href}>{normalizedContent.cta.primary.label}</Link>
                </Button>
                {normalizedContent.cta.secondary ? (
                  <Button asChild variant="outline">
                    <Link to={normalizedContent.cta.secondary.href}>{normalizedContent.cta.secondary.label}</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </Section>
      </div>
    </>
  );
}