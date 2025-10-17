import { useState } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Bell,
  Pin,
  Image,
  Save,
  X,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: 'academic' | 'event' | 'important' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'archived';
  publishDate: Date;
  expiryDate?: Date;
  image?: string;
  isPinned: boolean;
  views: number;
  likes: number;
  tags: string[];
}

function AdminAnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Ujian Tengah Semester Ganjil 2024',
      content: 'Pengumuman pelaksanaan ujian tengah semester ganjil tahun akademik 2024. Jadwal lengkap dapat dilihat di portal akademik.',
      excerpt: 'Pengumuman pelaksanaan ujian tengah semester ganjil...',
      author: 'Admin Akademik',
      category: 'academic',
      priority: 'high',
      status: 'published',
      publishDate: new Date('2024-01-10'),
      expiryDate: new Date('2024-02-15'),
      image: '/images/exam-schedule.jpg',
      isPinned: true,
      views: 1250,
      likes: 89,
      tags: ['ujian', 'akademik', 'jadwal']
    },
    {
      id: '2',
      title: 'Pendaftaran Ekstrakurikuler Semester Genap',
      content: 'Dibuka pendaftaran ekstrakurikuler untuk semester genap. Silakan daftar melalui portal siswa.',
      excerpt: 'Dibuka pendaftaran ekstrakurikuler untuk semester genap...',
      author: 'Admin Kesiswaan',
      category: 'event',
      priority: 'medium',
      status: 'published',
      publishDate: new Date('2024-01-08'),
      image: '/images/extracurricular.jpg',
      isPinned: false,
      views: 892,
      likes: 45,
      tags: ['ekstrakurikuler', 'pendaftaran', 'siswa']
    },
    {
      id: '3',
      title: 'Libur Nasional - Hari Pendidikan Nasional',
      content: 'Dalam rangka memperingati Hari Pendidikan Nasional, sekolah akan libur pada tanggal 2 Mei 2024.',
      excerpt: 'Dalam rangka memperingati Hari Pendidikan Nasional...',
      author: 'Admin Sekolah',
      category: 'important',
      priority: 'medium',
      status: 'draft',
      publishDate: new Date('2024-04-25'),
      isPinned: false,
      views: 0,
      likes: 0,
      tags: ['libur', 'nasional', 'pendidikan']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state for new/edit announcement
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    priority: 'medium' as const,
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    isPinned: false,
    tags: ''
  });

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || announcement.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'important': return 'bg-red-100 text-red-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-orange-100 text-orange-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return CheckCircle;
      case 'draft': return Clock;
      case 'archived': return AlertCircle;
      default: return Clock;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      excerpt: formData.content.substring(0, 100) + '...',
      author: 'Current Admin',
      category: formData.category,
      priority: formData.priority,
      status: 'draft',
      publishDate: new Date(formData.publishDate),
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      isPinned: formData.isPinned,
      views: 0,
      likes: 0,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setShowAddModal(false);
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      isPinned: false,
      tags: ''
    });
  };

  const togglePin = (id: string) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === id 
          ? { ...announcement, isPinned: !announcement.isPinned }
          : announcement
      )
    );
  };

  const toggleStatus = (id: string) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === id 
          ? { 
              ...announcement, 
              status: announcement.status === 'published' ? 'draft' : 'published' as const
            }
          : announcement
      )
    );
  };

  const deleteAnnouncement = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
    }
  };

  const stats = [
    {
      title: 'Total Announcements',
      value: announcements.length.toString(),
      change: '+3',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: Bell
    },
    {
      title: 'Published',
      value: announcements.filter(a => a.status === 'published').length.toString(),
      change: '+2',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle
    },
    {
      title: 'Draft',
      value: announcements.filter(a => a.status === 'draft').length.toString(),
      change: '+1',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: Clock
    },
    {
      title: 'Total Views',
      value: announcements.reduce((sum, a) => sum + a.views, 0).toString(),
      change: '+125',
      color: 'text-school-accent',
      bgColor: 'bg-school-accent/10',
      icon: Eye
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-school-text">Announcement Management</h1>
          <p className="text-school-text-muted">Create and manage school announcements</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-school-surface text-school-text rounded-lg hover:bg-school-border transition-colors">
            <Download size={20} className="mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-school-accent text-white rounded-lg hover:bg-school-accent-dark transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-school-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-school-text-muted">{stat.title}</p>
                <p className="text-2xl font-bold text-school-text">{stat.value}</p>
                <p className="text-sm text-green-600">+{stat.change} this week</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl border border-school-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-school-text-muted" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="event">Event</option>
              <option value="important">Important</option>
              <option value="general">General</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-school-text-muted" />
            <span className="text-sm text-school-text-muted">
              Showing {filteredAnnouncements.length} of {announcements.length} announcements
            </span>
          </div>
        </div>
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAnnouncements.map((announcement) => {
          const StatusIcon = getStatusIcon(announcement.status);
          return (
            <div key={announcement.id} className="bg-white rounded-xl border border-school-border overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              {announcement.image && (
                <div className="relative h-48 bg-school-surface">
                  <img
                    src={announcement.image}
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {announcement.isPinned && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-red-500 text-white p-2 rounded-full">
                        <Pin size={16} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(announcement.category)}`}>
                      {announcement.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                    <StatusIcon size={12} />
                    <span>{announcement.status}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-school-text mb-2 line-clamp-2">
                  {announcement.title}
                </h3>

                {/* Excerpt */}
                <p className="text-school-text-muted text-sm mb-4 line-clamp-3">
                  {announcement.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-school-text-muted mb-4">
                  <div className="flex items-center space-x-1">
                    <User size={12} />
                    <span>{announcement.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{announcement.publishDate.toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-school-text-muted mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Eye size={12} />
                      <span>{announcement.views}</span>
                    </span>
                    <span>{announcement.likes} likes</span>
                  </div>
                  {announcement.isPinned && (
                    <Pin size={12} className="text-red-500" />
                  )}
                </div>

                {/* Tags */}
                {announcement.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {announcement.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-school-surface text-school-text-muted rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                    {announcement.tags.length > 3 && (
                      <span className="text-xs text-school-text-muted">+{announcement.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-school-border">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedAnnouncement(announcement)}
                      className="p-2 text-school-text-muted hover:text-school-accent hover:bg-school-surface rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="p-2 text-school-text-muted hover:text-school-accent hover:bg-school-surface rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => togglePin(announcement.id)}
                      className={`p-2 hover:bg-school-surface rounded-lg transition-colors ${
                        announcement.isPinned ? 'text-red-500' : 'text-school-text-muted hover:text-red-500'
                      }`}
                      title={announcement.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin size={16} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStatus(announcement.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        announcement.status === 'published'
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {announcement.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(announcement.id)}
                      className="p-2 text-school-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-school-text">
                {editMode ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-school-text-muted hover:text-school-text"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-school-text mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-school-text mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                  required
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-school-text mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="event">Event</option>
                    <option value="important">Important</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-school-text mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-school-text mb-2">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-school-text mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-school-text mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="ujian, akademik, jadwal"
                  className="w-full px-3 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                />
              </div>

              {/* Pin option */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                  className="rounded border-school-border text-school-accent focus:ring-school-accent"
                />
                <label htmlFor="isPinned" className="text-sm text-school-text">
                  Pin this announcement
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-school-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-school-surface text-school-text rounded-lg hover:bg-school-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-school-accent text-white rounded-lg hover:bg-school-accent-dark transition-colors"
                >
                  <Save size={20} className="mr-2" />
                  {editMode ? 'Update' : 'Create'} Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedAnnouncement && !showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-school-text">{selectedAnnouncement.title}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedAnnouncement.category)}`}>
                    {selectedAnnouncement.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedAnnouncement.priority)}`}>
                    {selectedAnnouncement.priority} priority
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAnnouncement.status)}`}>
                    {selectedAnnouncement.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-school-text-muted hover:text-school-text"
              >
                <X size={24} />
              </button>
            </div>

            {/* Image */}
            {selectedAnnouncement.image && (
              <div className="mb-6">
                <img
                  src={selectedAnnouncement.image}
                  alt={selectedAnnouncement.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-school-text whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-school-border">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-school-text-muted">
                    <User size={16} />
                    <span>Author: {selectedAnnouncement.author}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-school-text-muted">
                    <Calendar size={16} />
                    <span>Published: {selectedAnnouncement.publishDate.toLocaleDateString()}</span>
                  </div>
                  {selectedAnnouncement.expiryDate && (
                    <div className="flex items-center space-x-2 text-sm text-school-text-muted">
                      <Clock size={16} />
                      <span>Expires: {selectedAnnouncement.expiryDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-school-text-muted">
                    <Eye size={16} />
                    <span>{selectedAnnouncement.views} views</span>
                  </div>
                  <div className="text-sm text-school-text-muted">
                    {selectedAnnouncement.likes} likes
                  </div>
                  {selectedAnnouncement.isPinned && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <Pin size={16} />
                      <span>Pinned announcement</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {selectedAnnouncement.tags.length > 0 && (
                <div className="pt-4 border-t border-school-border">
                  <h4 className="text-sm font-medium text-school-text mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnnouncement.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-school-surface text-school-text rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-school-border">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-school-surface text-school-text rounded-lg hover:bg-school-border transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-school-accent text-white rounded-lg hover:bg-school-accent-dark transition-colors">
                Edit Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(AdminAnnouncementManagement, ['admin']);
