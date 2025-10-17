import React from 'react';
import { withAuth } from '@/contexts/AuthContext';
import {
  Globe,
  FileText,
  Bell,
  Search,
  CheckCircle,
  Calendar,
  Users,
  BookOpen,
  Shield,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

function GuestDashboard() {
  const publicDocuments = [
    {
      id: 1,
      title: 'School Accreditation Certificate',
      type: 'Certificate',
      size: '2.4 MB',
      downloadCount: 245,
      lastUpdated: '2024-01-15',
    },
    {
      id: 2,
      title: 'Annual Academic Report 2023',
      type: 'Report',
      size: '5.2 MB',
      downloadCount: 189,
      lastUpdated: '2024-01-10',
    },
    {
      id: 3,
      title: 'Student Admission Guidelines',
      type: 'Guidelines',
      size: '1.8 MB',
      downloadCount: 567,
      lastUpdated: '2024-01-05',
    },
  ];

  const schoolNews = [
    {
      id: 1,
      title: 'New STEM Laboratory Opening',
      excerpt: 'State-of-the-art STEM laboratory now available for students to enhance their scientific learning experience.',
      date: '2024-01-20',
      category: 'Facilities',
      image: '/images/news-stem.jpg',
    },
    {
      id: 2,
      title: 'Outstanding Achievement in National Competition',
      excerpt: 'Our students won first place in the National Science Olympiad, bringing pride to our institution.',
      date: '2024-01-18',
      category: 'Achievement',
      image: '/images/news-competition.jpg',
    },
    {
      id: 3,
      title: 'Community Service Program Launch',
      excerpt: 'Students participate in community outreach programs to develop social responsibility and leadership skills.',
      date: '2024-01-15',
      category: 'Community',
      image: '/images/news-community.jpg',
    },
  ];

  const quickStats = [
    {
      title: 'Years of Excellence',
      value: '162+',
      description: 'Since 1862',
      icon: Calendar,
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Active Students',
      value: '1,200+',
      description: 'Enrolled students',
      icon: Users,
      color: 'from-green-400 to-green-600',
    },
    {
      title: 'Qualified Teachers',
      value: '80+',
      description: 'Professional educators',
      icon: BookOpen,
      color: 'from-school-accent to-school-accent-dark',
    },
    {
      title: 'Success Rate',
      value: '98%',
      description: 'University acceptance',
      icon: CheckCircle,
      color: 'from-orange-400 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-school-guest to-gray-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to St. Louis 1</h1>
        <p className="text-gray-100">Explore our school information, documents, and latest news.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-school-text-muted text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-school-text mt-1">{stat.value}</p>
                <p className="text-school-text-muted text-sm mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Virtual Tour */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <h3 className="text-lg font-semibold text-school-text mb-4 flex items-center">
            <Globe size={20} className="mr-2" />
            Virtual School Tour
          </h3>
          <div className="bg-gradient-to-br from-school-surface to-school-secondary rounded-lg p-8 text-center">
            <div className="mb-4">
              <Globe size={48} className="text-blue-600 mx-auto" />
            </div>
            <h4 className="text-xl font-semibold text-school-text mb-2">
              Experience Our Campus in 360°
            </h4>
            <p className="text-school-text-muted mb-6">
              Take an immersive virtual tour of our state-of-the-art facilities, 
              classrooms, laboratories, and recreational areas.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Start Virtual Tour
            </button>
          </div>
        </div>

        {/* Document Verification */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <h3 className="text-lg font-semibold text-school-text mb-4 flex items-center">
            <Shield size={20} className="mr-2" />
            Document Verification
          </h3>
          <div className="space-y-4">
            <div className="bg-school-surface rounded-lg p-4">
              <div className="text-center mb-4">
                <Shield size={32} className="text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-school-text">Verify Authenticity</h4>
                <p className="text-sm text-school-text-muted">
                  Verify the authenticity of school documents using our secure verification system.
                </p>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter document hash..."
                  className="w-full p-3 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
                />
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Verify Document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Public Documents & News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Public Documents */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <h3 className="text-lg font-semibold text-school-text mb-4 flex items-center">
            <FileText size={20} className="mr-2" />
            Public Documents
          </h3>
          <div className="space-y-4">
            {publicDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-school-surface">
                <div className="flex-1">
                  <h4 className="font-medium text-school-text">{doc.title}</h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-school-text-muted">
                    <span>{doc.type}</span>
                    <span>{doc.size}</span>
                    <span>{doc.downloadCount} downloads</span>
                  </div>
                  <p className="text-xs text-school-text-muted mt-1">
                    Last updated: {doc.lastUpdated}
                  </p>
                </div>
                <button className="bg-school-accent text-white px-4 py-2 rounded-lg hover:bg-school-accent-dark transition-colors text-sm">
                  Download
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-school-accent hover:text-school-accent-dark font-medium">
            View All Documents →
          </button>
        </div>

        {/* School News */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <h3 className="text-lg font-semibold text-school-text mb-4 flex items-center">
            <Bell size={20} className="mr-2" />
            Latest News
          </h3>
          <div className="space-y-4">
            {schoolNews.map((news) => (
              <div key={news.id} className="p-3 rounded-lg bg-school-surface">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {news.category}
                  </span>
                  <span className="text-xs text-school-text-muted">{news.date}</span>
                </div>
                <h4 className="font-medium text-school-text mb-2">{news.title}</h4>
                <p className="text-sm text-school-text-muted">{news.excerpt}</p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
                  Read More →
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-school-accent hover:text-school-accent-dark font-medium">
            View All News →
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
        <h3 className="text-lg font-semibold text-school-text mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Phone size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-school-text">Phone</p>
              <p className="text-school-text-muted">+62 31 5343173</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Mail size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-school-text">Email</p>
              <p className="text-school-text-muted">info@smastlouis1sby.sch.id</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-school-accent/10 rounded-lg">
              <MapPin size={20} className="text-school-accent" />
            </div>
            <div>
              <p className="font-medium text-school-text">Address</p>
              <p className="text-school-text-muted">Jl. Kepanjen No. 6, Surabaya</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions for Guests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button className="bg-white rounded-xl p-6 shadow-sm border border-school-border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Search size={24} className="text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-school-text">Search Documents</h4>
              <p className="text-sm text-school-text-muted">Find school documents</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-xl p-6 shadow-sm border border-school-border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen size={24} className="text-green-600" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-school-text">Admission Info</h4>
              <p className="text-sm text-school-text-muted">Learn about enrollment</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-xl p-6 shadow-sm border border-school-border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-school-accent/10 rounded-lg">
              <Calendar size={24} className="text-school-accent" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-school-text">School Calendar</h4>
              <p className="text-sm text-school-text-muted">View academic calendar</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-xl p-6 shadow-sm border border-school-border hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Phone size={24} className="text-orange-600" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-school-text">Contact Us</h4>
              <p className="text-sm text-school-text-muted">Get in touch</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default withAuth(GuestDashboard, ['guest']);
