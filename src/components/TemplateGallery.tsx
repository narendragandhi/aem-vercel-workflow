/**
 * Template Gallery Component
 *
 * An enhanced template browser with:
 * - Category filtering
 * - Complexity badges
 * - Preview thumbnails
 * - Search functionality
 * - Tag-based filtering
 */

import React, { useState, useMemo } from 'react';
import {
  Search, X, Library, FileText, Image, FormInput, Plug, Shield,
  Target, ShoppingCart, Filter, Layers, Clock, GitBranch,
  ChevronRight, Star, Zap, CheckCircle
} from 'lucide-react';
import { ADVANCED_TEMPLATES, WorkflowTemplate, getCategories, getAllTags } from '../data/advancedTemplates';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate) => void;
  darkMode?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  content: <FileText size={18} />,
  assets: <Image size={18} />,
  forms: <FormInput size={18} />,
  integration: <Plug size={18} />,
  governance: <Shield size={18} />,
  marketing: <Target size={18} />,
  commerce: <ShoppingCart size={18} />,
};

const categoryColors: Record<string, string> = {
  content: '#3b82f6',
  assets: '#10b981',
  forms: '#f59e0b',
  integration: '#8b5cf6',
  governance: '#ec4899',
  marketing: '#06b6d4',
  commerce: '#f97316',
};

const complexityColors: Record<string, { bg: string; text: string }> = {
  simple: { bg: '#10b98120', text: '#10b981' },
  medium: { bg: '#f59e0b20', text: '#f59e0b' },
  complex: { bg: '#ef444420', text: '#ef4444' },
};

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  darkMode = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const categories = getCategories();
  const allTags = getAllTags();

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return ADVANCED_TEMPLATES.filter(template => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.tags.some(tag => tag.includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory && template.category !== selectedCategory) {
        return false;
      }

      // Complexity filter
      if (selectedComplexity && template.complexity !== selectedComplexity) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(tag => template.tags.includes(tag));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [search, selectedCategory, selectedComplexity, selectedTags]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setSelectedComplexity(null);
    setSelectedTags([]);
  };

  const hasFilters = search || selectedCategory || selectedComplexity || selectedTags.length > 0;

  if (!isOpen) return null;

  const bgColor = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const secondaryText = darkMode ? '#94a3b8' : '#64748b';
  const cardBg = darkMode ? '#334155' : '#f8fafc';
  const hoverBg = darkMode ? '#475569' : '#f1f5f9';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: bgColor,
          borderRadius: '16px',
          width: '95%',
          maxWidth: '1200px',
          height: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Library size={24} style={{ color: '#8b5cf6' }} />
            <h2 style={{ margin: 0, color: textColor, fontSize: '18px' }}>Template Gallery</h2>
            <span style={{
              background: '#8b5cf620',
              color: '#8b5cf6',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {ADVANCED_TEMPLATES.length} templates
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: textColor,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Filters */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${borderColor}`,
        }}>
          {/* Search bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              background: cardBg,
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
            }}>
              <Search size={18} style={{ color: secondaryText }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  color: textColor,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: secondaryText }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '10px 16px',
                  background: darkMode ? '#475569' : '#e2e8f0',
                  color: textColor,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                style={{
                  padding: '8px 14px',
                  background: selectedCategory === category ? categoryColors[category] : cardBg,
                  color: selectedCategory === category ? 'white' : textColor,
                  border: `1px solid ${selectedCategory === category ? categoryColors[category] : borderColor}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
              >
                {categoryIcons[category]}
                {category}
              </button>
            ))}
          </div>

          {/* Complexity filters */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: secondaryText }}>Complexity:</span>
            {(['simple', 'medium', 'complex'] as const).map(complexity => (
              <button
                key={complexity}
                onClick={() => setSelectedComplexity(selectedComplexity === complexity ? null : complexity)}
                style={{
                  padding: '6px 12px',
                  background: selectedComplexity === complexity
                    ? complexityColors[complexity].bg
                    : 'transparent',
                  color: selectedComplexity === complexity
                    ? complexityColors[complexity].text
                    : secondaryText,
                  border: `1px solid ${selectedComplexity === complexity
                    ? complexityColors[complexity].text
                    : borderColor}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textTransform: 'capitalize',
                }}
              >
                {complexity}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Tags sidebar */}
          <div style={{
            width: '200px',
            borderRight: `1px solid ${borderColor}`,
            padding: '16px',
            overflowY: 'auto',
          }}>
            <h4 style={{
              margin: '0 0 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: secondaryText,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Tags
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '6px 10px',
                    background: selectedTags.includes(tag) ? '#8b5cf620' : 'transparent',
                    color: selectedTags.includes(tag) ? '#8b5cf6' : textColor,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {selectedTags.includes(tag) && <CheckCircle size={12} />}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Templates grid */}
          <div style={{
            flex: 1,
            padding: '16px 24px',
            overflowY: 'auto',
          }}>
            {filteredTemplates.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px',
                color: secondaryText,
              }}>
                <Library size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', color: textColor }}>
                  No templates found
                </div>
                <div style={{ fontSize: '13px' }}>
                  Try adjusting your filters or search terms
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px',
              }}>
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                    style={{
                      background: hoveredTemplate === template.id ? hoverBg : cardBg,
                      borderRadius: '12px',
                      border: `1px solid ${hoveredTemplate === template.id ? categoryColors[template.category] : borderColor}`,
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      transform: hoveredTemplate === template.id ? 'translateY(-2px)' : 'none',
                      boxShadow: hoveredTemplate === template.id
                        ? '0 8px 16px rgba(0,0,0,0.1)'
                        : 'none',
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${categoryColors[template.category]}15`,
                        color: categoryColors[template.category],
                      }}>
                        {categoryIcons[template.category]}
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: complexityColors[template.complexity].bg,
                        color: complexityColors[template.complexity].text,
                        textTransform: 'capitalize',
                      }}>
                        {template.complexity}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 style={{
                      margin: '0 0 8px',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: textColor,
                    }}>
                      {template.name}
                    </h3>
                    <p style={{
                      margin: '0 0 12px',
                      fontSize: '13px',
                      color: secondaryText,
                      lineHeight: '1.5',
                    }}>
                      {template.description}
                    </p>

                    {/* Stats */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '12px',
                      fontSize: '12px',
                      color: secondaryText,
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Layers size={14} />
                        {template.nodes.length} nodes
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GitBranch size={14} />
                        {template.nodes.filter(n => n.type === 'branch').length} branches
                      </span>
                    </div>

                    {/* Tags */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                    }}>
                      {template.tags.slice(0, 4).map(tag => (
                        <span
                          key={tag}
                          style={{
                            padding: '2px 8px',
                            background: darkMode ? '#475569' : '#e2e8f0',
                            borderRadius: '4px',
                            fontSize: '10px',
                            color: secondaryText,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 4 && (
                        <span style={{
                          padding: '2px 8px',
                          fontSize: '10px',
                          color: secondaryText,
                        }}>
                          +{template.tags.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Hover action */}
                    {hoveredTemplate === template.id && (
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: `1px solid ${borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: categoryColors[template.category],
                        fontSize: '13px',
                        fontWeight: 600,
                      }}>
                        Use Template <ChevronRight size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '12px', color: secondaryText }}>
            Showing {filteredTemplates.length} of {ADVANCED_TEMPLATES.length} templates
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: darkMode ? '#475569' : '#e2e8f0',
              color: textColor,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '13px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
