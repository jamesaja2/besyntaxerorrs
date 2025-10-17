import { withAuth } from '@/contexts/AuthContext';
import {
  User,
  Calendar,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bell,
  BookOpen,
  Award,
  Phone,
} from 'lucide-react';

function ParentDashboard() {
  const children = [
    {
      id: 1,
      name: 'Ahmad Rizki',
      class: 'XII-A',
      grade: 'A-',
      attendance: 95,
      status: 'present',
    },
    {
      id: 2,
      name: 'Sari Indah',
      class: 'X-B',
      grade: 'B+',
      attendance: 92,
      status: 'present',
    },
  ];

  const paymentStatus = [
    {
      description: 'School Fee - January 2024',
      amount: 'Rp 2,500,000',
      dueDate: '2024-01-15',
      status: 'paid',
      paidDate: '2024-01-10',
    },
    {
      description: 'School Fee - February 2024',
      amount: 'Rp 2,500,000',
      dueDate: '2024-02-15',
      status: 'pending',
    },
    {
      description: 'Extracurricular - Drama Club',
      amount: 'Rp 500,000',
      dueDate: '2024-02-20',
      status: 'pending',
    },
  ];

  const recentActivities = [
    {
      child: 'Ahmad Rizki',
      activity: 'Submitted Math Assignment',
      time: '2 hours ago',
      type: 'assignment',
    },
    {
      child: 'Sari Indah',
      activity: 'Attended Physics Lab',
      time: '4 hours ago',
      type: 'attendance',
    },
    {
      child: 'Ahmad Rizki',
      activity: 'Received Grade: B+ in English',
      time: '1 day ago',
      type: 'grade',
    },
  ];

  const upcomingEvents = [
    {
      title: 'Parent-Teacher Meeting',
      date: 'February 20, 2024',
      time: '10:00 AM',
      type: 'meeting',
    },
    {
      title: 'Science Fair',
      date: 'February 25, 2024',
      time: '2:00 PM',
      type: 'event',
    },
    {
      title: 'Monthly Report Due',
      date: 'February 28, 2024',
      time: 'All Day',
      type: 'academic',
    },
  ];

  const stats = [
    {
      title: 'Children Enrolled',
      value: children.length.toString(),
      change: 'All active',
      icon: User,
      color: 'from-school-parent to-orange-600',
    },
    {
      title: 'Outstanding Payments',
      value: '2',
      change: 'Due this month',
      icon: CreditCard,
      color: 'from-red-400 to-red-600',
    },
    {
      title: 'Avg Attendance',
      value: '94%',
      change: 'Excellent',
      icon: CheckCircle,
      color: 'from-green-400 to-green-600',
    },
    {
      title: 'Messages',
      value: '3',
      change: '1 unread',
      icon: MessageSquare,
      color: 'from-blue-400 to-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-school-parent to-orange-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Parent Dashboard</h1>
        <p className="text-orange-100">Stay connected with your children's education journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-school-text-muted text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-school-text mt-1">{stat.value}</p>
                <p className="text-school-text-muted text-sm mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Children Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
        <h3 className="text-lg font-semibold text-school-text mb-4 flex items-center">
          <User size={20} className="mr-2" />
          Children Academic Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <div key={child.id} className="bg-school-surface rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-school-text">{child.name}</h4>
                  <p className="text-sm text-school-text-muted">Class {child.class}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  child.status === 'present' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {child.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-school-text-muted">Current Grade</span>
                  <span className="font-medium text-school-text">{child.grade}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-school-text-muted">Attendance</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-school-border rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${child.attendance}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-school-text">{child.attendance}%</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-school-border">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View Detailed Report →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <h3 className="text-lg font-semibold text-school-text mb-4 flex items-center">
            <CreditCard size={20} className="mr-2" />
            Payment Status
          </h3>
          <div className="space-y-4">
            {paymentStatus.map((payment, index) => (
              <div key={index} className="p-3 rounded-lg bg-school-surface">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-school-text text-sm">{payment.description}</p>
                    <p className="text-lg font-bold text-school-text">{payment.amount}</p>
                    <p className="text-xs text-school-text-muted">Due: {payment.dueDate}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'paid' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {payment.status}
                  </span>
                </div>
                {payment.status === 'pending' && (
                  <button className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Pay Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <h3 className="text-lg font-semibold text-school-text mb-4 flex items-center">
            <Clock size={20} className="mr-2" />
            Recent Activities
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'assignment' ? 'bg-blue-100' :
                  activity.type === 'attendance' ? 'bg-green-100' :
                  'bg-school-accent/10'
                }`}>
                  {activity.type === 'assignment' && <BookOpen size={16} className="text-blue-600" />}
                  {activity.type === 'attendance' && <CheckCircle size={16} className="text-green-600" />}
                  {activity.type === 'grade' && <Award size={16} className="text-school-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-school-text">{activity.child}</p>
                  <p className="text-sm text-school-text-muted">{activity.activity}</p>
                  <p className="text-xs text-school-text-muted">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <h3 className="text-lg font-semibold text-school-text mb-4 flex items-center">
            <Calendar size={20} className="mr-2" />
            Upcoming Events
          </h3>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="p-3 rounded-lg bg-school-surface">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-school-text">{event.title}</p>
                    <p className="text-sm text-school-text-muted">{event.date}</p>
                    <p className="text-sm text-school-text-muted">{event.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                    event.type === 'event' ? 'bg-green-100 text-green-700' :
                    'bg-school-accent/10 text-school-accent'
                  }`}>
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Communication Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <h3 className="text-lg font-semibold text-school-text mb-4 flex items-center">
            <MessageSquare size={20} className="mr-2" />
            Messages from Teachers
          </h3>
          <div className="space-y-4">
            {[
              {
                teacher: 'Ms. Sarah (Math Teacher)',
                message: 'Ahmad is showing great improvement in calculus.',
                time: '2 hours ago',
                unread: true,
              },
              {
                teacher: 'Mr. David (Physics)',
                message: 'Parent-teacher meeting scheduled for next week.',
                time: '1 day ago',
                unread: false,
              },
            ].map((msg, index) => (
              <div key={index} className={`p-3 rounded-lg ${msg.unread ? 'bg-blue-50 border border-blue-200' : 'bg-school-surface'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-school-text text-sm">{msg.teacher}</p>
                    <p className="text-sm text-school-text-muted mt-1">{msg.message}</p>
                    <p className="text-xs text-school-text-muted mt-2">{msg.time}</p>
                  </div>
                  {msg.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            View All Messages
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-school-border">
          <h3 className="text-lg font-semibold text-school-text mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <CreditCard size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-700">Make Payment</span>
            </button>
            
            <button className="flex flex-col items-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <MessageSquare size={24} className="text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-700">Contact Teacher</span>
            </button>
            
            <button className="flex flex-col items-center p-4 rounded-lg bg-school-accent/10 hover:bg-school-accent/20 transition-colors">
              <Calendar size={24} className="text-school-accent mb-2" />
              <span className="text-sm font-medium text-school-accent">Schedule Meeting</span>
            </button>
            
            <button className="flex flex-col items-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
              <TrendingUp size={24} className="text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-700">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ParentDashboard, ['parent']);
