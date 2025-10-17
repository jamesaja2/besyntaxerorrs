import React from 'react';
import { motion } from 'framer-motion';
import { Users, ChevronDown, ChevronRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Card, CardContent } from '@/components/ui/card';
import { organizationStructure, departmentColors, OrganizationStructure } from '@/data/struktur';

interface OrgChartNodeProps {
  node: OrganizationStructure;
  level: number;
  isLast?: boolean;
}

function OrgChartNode({ node, level, isLast = false }: OrgChartNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(level < 2);

  const hasChildren = node.children && node.children.length > 0;

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`${level > 0 ? 'ml-8' : ''}`}
    >
      {/* Connection Line */}
      {level > 0 && (
        <div className="flex items-center -ml-8 mb-2">
          <div className="w-6 h-px bg-school-accent/30"></div>
          <div className="w-2 h-px bg-school-accent/30"></div>
        </div>
      )}

      {/* Node Card */}
      <Card className={`mb-4 bg-school-secondary/50 border-school-accent/20 card-hover ${
        level === 0 ? 'border-school-accent/40' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-school-accent mr-2" />
                <h3 className={`font-bold text-school-text ${
                  level === 0 ? 'text-xl' : level === 1 ? 'text-lg' : 'text-base'
                }`}>
                  {node.position}
                </h3>
                {node.department && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full border ${
                    departmentColors[node.department] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {node.department}
                  </span>
                )}
              </div>
              <p className="text-school-text-muted font-medium">
                {node.name}
              </p>
              {node.reportTo && (
                <p className="text-xs text-school-text-muted/70 mt-1">
                  Report to: {node.reportTo}
                </p>
              )}
            </div>

            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-full hover:bg-school-accent/10 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-school-accent" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-school-accent" />
                )}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Children */}
      {hasChildren && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Vertical Line */}
          {level < 3 && (
            <div className="absolute left-3 top-0 bottom-0 w-px bg-school-accent/20"></div>
          )}
          
          <div className="space-y-2">
            {node.children!.map((child, index) => (
              <OrgChartNode
                key={`${child.position}-${index}`}
                node={child}
                level={level + 1}
                isLast={index === node.children!.length - 1}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function Struktur() {
  return (
    <>
      <SEO 
        title="Struktur Organisasi - SMA Katolik St. Louis 1 Surabaya"
        description="Struktur organisasi dan kepemimpinan SMA Katolik St. Louis 1 Surabaya. Kepala sekolah, wakil kepala sekolah, koordinator, dan tim manajemen."
        keywords="struktur organisasi, kepala sekolah, wakil kepala sekolah, manajemen sekolah, koordinator"
      />

      <div className="min-h-screen pt-20">
        <Section>
          <SectionHeader>
            <SectionTitle>
              Struktur 
              <span className="gradient-text">Organisasi</span>
            </SectionTitle>
            <SectionDescription>
              Susunan kepemimpinan dan organisasi yang mengelola pendidikan 
              di SMA Katolik St. Louis 1 Surabaya secara professional dan terstruktur.
            </SectionDescription>
          </SectionHeader>

          {/* Organizational Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-school-primary/30 rounded-2xl p-6 border border-school-accent/20"
          >
            <OrgChartNode node={organizationStructure} level={0} />
          </motion.div>

          {/* Department Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-school-secondary/50 border-school-accent/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-school-text mb-4">
                  Departemen & Bidang Kerja
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(departmentColors).map(([dept, colorClass]) => (
                    <div
                      key={dept}
                      className={`flex items-center px-3 py-2 rounded-lg border ${colorClass}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-current mr-2 opacity-60"></div>
                      <span className="text-sm font-medium">{dept}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="bg-school-secondary/50 rounded-2xl p-8 border border-school-accent/20">
              <h3 className="text-xl font-bold text-school-text mb-4">
                Manajemen Sekolah yang Profesional
              </h3>
              <p className="text-school-text-muted leading-relaxed max-w-3xl mx-auto">
                Struktur organisasi kami dirancang untuk memberikan pelayanan pendidikan 
                terbaik dengan sistem manajemen yang jelas, terukur, dan akuntabel. 
                Setiap bagian memiliki peran penting dalam menciptakan lingkungan 
                pembelajaran yang kondusif dan berkualitas tinggi.
              </p>
            </div>
          </motion.div>
        </Section>
      </div>
    </>
  );
}