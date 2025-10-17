import { useState } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Key,
  Download,
  Upload,
  MoreVertical,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  phone: string;
  joinDate: Date;
  lastLogin: Date;
  department?: string;
  class?: string;
  permissions: string[];
}

function AdminUserManagement() {
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@school.edu',
      role: 'admin',
      status: 'active',
      avatar: '/images/avatar1.jpg',
      phone: '+62 812-3456-7890',
      joinDate: new Date('2023-01-15'),
      lastLogin: new Date('2024-01-15'),
      department: 'Administration',
      permissions: ['user_management', 'system_settings', 'analytics']
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@school.edu',
      role: 'teacher',
      status: 'active',
      avatar: '/images/avatar2.jpg',
      phone: '+62 813-2345-6789',
      joinDate: new Date('2023-03-20'),
      lastLogin: new Date('2024-01-14'),
      department: 'Mathematics',
      permissions: ['course_management', 'grading', 'attendance']
    },
    {
      id: '3',
      name: 'Michael Johnson',
      email: 'michael.j@school.edu',
      role: 'student',
      status: 'active',
      avatar: '/images/avatar3.jpg',
      phone: '+62 814-3456-7890',
      joinDate: new Date('2023-08-01'),
      lastLogin: new Date('2024-01-15'),
      class: 'XII IPA 1',
      permissions: ['course_access', 'assignment_submit']
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      role: 'parent',
      status: 'pending',
      avatar: '/images/avatar4.jpg',
      phone: '+62 815-4567-8901',
      joinDate: new Date('2024-01-10'),
      lastLogin: new Date('2024-01-12'),
      permissions: ['child_progress', 'communication']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-school-accent/10 text-school-accent';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      case 'parent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      change: '+12',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: Users
    },
    {
      title: 'Active Users',
      value: users.filter(u => u.status === 'active').length.toString(),
      change: '+5',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: UserCheck
    },
    {
      title: 'Pending',
      value: users.filter(u => u.status === 'pending').length.toString(),
      change: '+3',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: Clock
    },
    {
      title: 'Teachers',
      value: users.filter(u => u.role === 'teacher').length.toString(),
      change: '+2',
      color: 'text-school-accent',
      bgColor: 'bg-school-accent/10',
      icon: Shield
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-school-text">User Management</h1>
          <p className="text-school-text-muted">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-school-surface text-school-text rounded-lg hover:bg-school-border transition-colors">
            <Download size={20} className="mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-school-surface text-school-text rounded-lg hover:bg-school-border transition-colors">
            <Upload size={20} className="mr-2" />
            Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-school-accent text-white rounded-lg hover:bg-school-accent-dark transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add User
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
                <p className="text-sm text-green-600">+{stat.change} this month</p>
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-school-border rounded-lg focus:ring-2 focus:ring-school-accent focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-school-text-muted" />
            <span className="text-sm text-school-text-muted">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-school-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-school-surface">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-school-text-muted">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-school-text-muted">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-school-text-muted">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-school-text-muted">Department/Class</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-school-text-muted">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-school-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-school-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-school-surface transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover bg-school-surface"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                        }}
                      />
                      <div>
                        <p className="font-medium text-school-text">{user.name}</p>
                        <p className="text-sm text-school-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-school-text">
                    {user.department || user.class || '-'}
                  </td>
                  <td className="px-6 py-4 text-school-text-muted">
                    {user.lastLogin.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-school-text-muted hover:text-school-accent hover:bg-school-surface rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 text-school-text-muted hover:text-school-accent hover:bg-school-surface rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-2 text-school-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="p-2 text-school-text-muted hover:text-school-accent hover:bg-school-surface rounded-lg transition-colors"
                        title="More Actions"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-school-text">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-school-text-muted hover:text-school-text"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full object-cover bg-school-surface"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`;
                  }}
                />
                <div>
                  <h3 className="text-xl font-semibold text-school-text">{selectedUser.name}</h3>
                  <p className="text-school-text-muted">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-school-text-muted" />
                  <span className="text-school-text">{selectedUser.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-school-text-muted" />
                  <span className="text-school-text">
                    Joined {selectedUser.joinDate.toLocaleDateString()}
                  </span>
                </div>
                {selectedUser.department && (
                  <div className="flex items-center space-x-3">
                    <MapPin size={16} className="text-school-text-muted" />
                    <span className="text-school-text">{selectedUser.department}</span>
                  </div>
                )}
                {selectedUser.class && (
                  <div className="flex items-center space-x-3">
                    <Users size={16} className="text-school-text-muted" />
                    <span className="text-school-text">{selectedUser.class}</span>
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div>
                <h4 className="font-semibold text-school-text mb-3 flex items-center">
                  <Key size={16} className="mr-2" />
                  Permissions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-school-surface text-school-text rounded-full text-sm"
                    >
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-school-border">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-school-surface text-school-text rounded-lg hover:bg-school-border transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-school-accent text-white rounded-lg hover:bg-school-accent-dark transition-colors">
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(AdminUserManagement, ['admin']);
