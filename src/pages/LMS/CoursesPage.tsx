import { useState } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Users,
  Clock,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Star,
  Download,
  Upload,
} from 'lucide-react';

function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const courses = [
    {
      id: 1,
      title: 'Advanced Mathematics XII',
      description: 'Comprehensive calculus and statistics for final year students',
      instructor: 'Mr. Ahmad Susanto',
      students: 32,
      lessons: 24,
      progress: 75,
      status: 'active',
      thumbnail: '/api/placeholder/300/200',
      startDate: '2024-02-01',
      endDate: '2024-06-15',
      rating: 4.8,
      category: 'Mathematics',
    },
    {
      id: 2,
      title: 'Physics Laboratory',
      description: 'Hands-on experiments and practical applications',
      instructor: 'Mrs. Sari Indrawati',
      students: 28,
      lessons: 18,
      progress: 60,
      status: 'active',
      thumbnail: '/api/placeholder/300/200',
      startDate: '2024-02-01',
      endDate: '2024-06-15',
      rating: 4.6,
      category: 'Science',
    },
    {
      id: 3,
      title: 'English Literature',
      description: 'Exploring classic and contemporary literature',
      instructor: 'Ms. Linda Hartono',
      students: 25,
      lessons: 20,
      progress: 40,
      status: 'draft',
      thumbnail: '/api/placeholder/300/200',
      startDate: '2024-03-01',
      endDate: '2024-07-15',
      rating: 4.9,
      category: 'Language',
    },
    {
      id: 4,
      title: 'Computer Science Fundamentals',
      description: 'Introduction to programming and algorithms',
      instructor: 'Mr. Budi Santoso',
      students: 30,
      lessons: 32,
      progress: 85,
      status: 'active',
      thumbnail: '/api/placeholder/300/200',
      startDate: '2024-01-15',
      endDate: '2024-05-30',
      rating: 4.7,
      category: 'Technology',
    },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-orange-100 text-orange-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const CourseCard = ({ course }: { course: typeof courses[0] }) => (
    <div className="bg-white rounded-xl shadow-sm border border-school-border overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-school-accent to-school-accent-dark"></div>
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
            {course.status}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-2">
            <Star size={16} className="text-orange-500 fill-current" />
            <span className="text-white text-sm font-medium">{course.rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-school-text mb-2">{course.title}</h3>
          <p className="text-school-text-muted text-sm">{course.description}</p>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-school-text-muted">
            <Users size={16} className="mr-2" />
            {course.students} students
          </div>
          <div className="flex items-center text-sm text-school-text-muted">
            <BookOpen size={16} className="mr-2" />
            {course.lessons} lessons
          </div>
          <div className="flex items-center text-sm text-school-text-muted">
            <Calendar size={16} className="mr-2" />
            {course.startDate} - {course.endDate}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-school-text-muted">Progress</span>
            <span className="text-sm font-medium text-school-text">{course.progress}%</span>
          </div>
          <div className="w-full bg-school-surface rounded-full h-2">
            <div 
              className="bg-school-accent h-2 rounded-full transition-all duration-300" 
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-school-text-muted">by {course.instructor}</span>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-school-text-muted hover:text-school-accent transition-colors">
              <Eye size={16} />
            </button>
            <button className="p-2 text-school-text-muted hover:text-school-accent transition-colors">
              <Edit size={16} />
            </button>
            <button className="p-2 text-school-text-muted hover:text-red-600 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CourseListItem = ({ course }: { course: typeof courses[0] }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-16 h-16 bg-gradient-to-br from-school-accent to-school-accent-dark rounded-lg flex items-center justify-center">
            <BookOpen size={24} className="text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="text-lg font-semibold text-school-text">{course.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                {course.status}
              </span>
            </div>
            <p className="text-school-text-muted text-sm mb-2">{course.description}</p>
            <div className="flex items-center space-x-4 text-sm text-school-text-muted">
              <span className="flex items-center">
                <Users size={16} className="mr-1" />
                {course.students}
              </span>
              <span className="flex items-center">
                <BookOpen size={16} className="mr-1" />
                {course.lessons} lessons
              </span>
              <span className="flex items-center">
                <Star size={16} className="mr-1 text-orange-500 fill-current" />
                {course.rating}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-school-text-muted mb-1">Progress</div>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-school-surface rounded-full h-2">
                <div 
                  className="bg-school-accent h-2 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-school-text">{course.progress}%</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-school-text-muted hover:text-school-accent transition-colors">
              <Eye size={16} />
            </button>
            <button className="p-2 text-school-text-muted hover:text-school-accent transition-colors">
              <Edit size={16} />
            </button>
            <button className="p-2 text-school-text-muted hover:text-red-600 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-school-text">Course Management</h1>
          <p className="text-school-text-muted mt-1">Manage your courses and learning materials</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-school-accent text-white px-4 py-2 rounded-lg hover:bg-school-accent-dark transition-colors">
            <Plus size={20} />
            <span>Create Course</span>
          </button>
          <button className="flex items-center space-x-2 border border-school-border text-school-text px-4 py-2 rounded-lg hover:bg-school-surface transition-colors">
            <Upload size={20} />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-school-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-school-accent text-white' 
                  : 'text-school-text-muted hover:bg-school-surface'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-1">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-school-accent text-white' 
                  : 'text-school-text-muted hover:bg-school-surface'
              }`}
            >
              <div className="w-4 h-4 flex flex-col space-y-1">
                <div className="bg-current h-1 rounded-sm"></div>
                <div className="bg-current h-1 rounded-sm"></div>
                <div className="bg-current h-1 rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-text-muted text-sm font-medium">Total Courses</p>
              <p className="text-2xl font-bold text-school-text mt-1">{courses.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-text-muted text-sm font-medium">Active Courses</p>
              <p className="text-2xl font-bold text-school-text mt-1">
                {courses.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-text-muted text-sm font-medium">Total Students</p>
              <p className="text-2xl font-bold text-school-text mt-1">
                {courses.reduce((sum, course) => sum + course.students, 0)}
              </p>
            </div>
            <div className="p-3 bg-school-accent/10 rounded-lg">
              <Users size={24} className="text-school-accent" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-text-muted text-sm font-medium">Avg Rating</p>
              <p className="text-2xl font-bold text-school-text mt-1">
                {(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Star size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {filteredCourses.map((course) => 
          viewMode === 'grid' 
            ? <CourseCard key={course.id} course={course} />
            : <CourseListItem key={course.id} course={course} />
        )}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-school-text-muted mb-4" />
          <h3 className="text-lg font-medium text-school-text mb-2">No courses found</h3>
          <p className="text-school-text-muted">Try adjusting your search criteria or create a new course.</p>
        </div>
      )}
    </div>
  );
}

export default withAuth(CoursesPage, ['admin', 'teacher']);
