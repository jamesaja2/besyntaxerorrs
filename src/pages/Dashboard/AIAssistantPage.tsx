import { useState, useRef, useEffect } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Send,
  Brain,
  Book,
  Calculator,
  MessageSquare,
  Lightbulb,
  Clock,
  Mic,
  Paperclip,
  User,
  Bot,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

function AIAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: user?.role === 'admin' 
        ? `Hello ${user?.name}! I'm your AI administrative assistant. I can help you with user management, analytics, system monitoring, content moderation, and administrative tasks. How can I assist you today?`
        : `Hello ${user?.name}! I'm your AI learning assistant. I'm here to help you with your studies, answer questions, and provide personalized learning support. How can I assist you today?`,
      timestamp: new Date(),
      suggestions: user?.role === 'admin' 
        ? [
            'Show user statistics',
            'Generate monthly report',
            'Analyze system performance',
            'Check security alerts',
          ]
        : [
            'Help me understand calculus',
            'Create a study schedule',
            'Explain physics concepts',
            'Grammar check my essay',
          ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = user?.role === 'admin' ? [
    {
      icon: MessageSquare,
      title: 'User Analytics',
      description: 'Analyze user behavior and trends',
      prompt: 'Show me comprehensive user analytics and engagement statistics',
    },
    {
      icon: Calculator,
      title: 'Performance Report',
      description: 'Generate system reports',
      prompt: 'Create a detailed system performance and academic progress report',
    },
    {
      icon: Lightbulb,
      title: 'AI Insights',
      description: 'Get data-driven insights',
      prompt: 'Provide AI-powered insights and recommendations for school management',
    },
    {
      icon: Clock,
      title: 'System Monitor',
      description: 'Check system health',
      prompt: 'Perform a comprehensive system health check and security audit',
    },
  ] : [
    {
      icon: Calculator,
      title: 'Math Helper',
      description: 'Solve equations, explain concepts',
      prompt: 'I need help with a math problem',
    },
    {
      icon: Book,
      title: 'Study Guide',
      description: 'Create study materials',
      prompt: 'Create a study guide for my upcoming exam',
    },
    {
      icon: Lightbulb,
      title: 'Concept Explanation',
      description: 'Explain difficult topics',
      prompt: 'Can you explain this concept in simple terms?',
    },
    {
      icon: Clock,
      title: 'Time Management',
      description: 'Plan your study schedule',
      prompt: 'Help me create a study schedule',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageContent: string = inputMessage) => {
    if (!messageContent.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response with role-specific responses
    setTimeout(() => {
      let responses;
      
      if (user?.role === 'admin') {
        // Admin-specific responses
        if (messageContent.toLowerCase().includes('user') || messageContent.toLowerCase().includes('analytics')) {
          responses = [
            {
              content: "Based on current data analysis: We have 1,234 total users (892 students, 80 teachers, 200 parents, 62 admin/staff). Daily active users: 95%. User engagement has increased 12% this month. Registration trends show steady growth with peak activity during enrollment periods.",
              suggestions: ['View detailed breakdown', 'Export user report', 'Check user permissions', 'Analyze engagement patterns'],
            }
          ];
        } else if (messageContent.toLowerCase().includes('report') || messageContent.toLowerCase().includes('performance')) {
          responses = [
            {
              content: "System Performance Report: Server uptime 99.8%, Database queries optimized (avg 2.3ms), Storage utilization 67%. Academic Performance: Average GPA 8.2/10, Assignment completion 87%, Test scores improved 15% this semester. Financial: Revenue targets met 103%, outstanding payments reduced 23%.",
              suggestions: ['Download PDF report', 'Schedule automated reports', 'View historical trends', 'Compare with benchmarks'],
            }
          ];
        } else if (messageContent.toLowerCase().includes('system') || messageContent.toLowerCase().includes('health') || messageContent.toLowerCase().includes('security')) {
          responses = [
            {
              content: "System Health Check Complete: ✅ All services operational, ✅ Security scans passed, ✅ Backup integrity verified, ✅ Performance metrics within normal range. Alerts: 2 minor warnings (disk space on server-02 at 78%, scheduled maintenance due next week). No critical issues detected.",
              suggestions: ['View detailed logs', 'Schedule maintenance', 'Check security reports', 'Update system settings'],
            }
          ];
        } else {
          responses = [
            {
              content: "I'm here to help with administrative tasks including user management, system monitoring, analytics, reporting, and strategic insights. I can analyze data patterns, generate comprehensive reports, monitor system health, and provide recommendations for school management decisions.",
              suggestions: ['Show dashboard overview', 'Generate insights', 'Check system status', 'User management'],
            }
          ];
        }
      } else {
        // Student/Teacher/Parent responses
        responses = [
          {
            content: "That's a great question! Let me break this down for you step by step...",
            suggestions: ['Tell me more', 'Give an example', 'What about related topics?'],
          },
          {
            content: "I understand you're working on this topic. Here's how I can help you understand it better...",
            suggestions: ['Practice problems', 'Related concepts', 'Study tips'],
          },
          {
            content: "Let me provide you with a comprehensive explanation and some practical examples...",
            suggestions: ['More examples', 'Check my work', 'Quiz me on this'],
          },
        ];
      }

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse.content,
        timestamp: new Date(),
        suggestions: randomResponse.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'student': return <User size={20} className="text-green-600" />;
      case 'teacher': return <User size={20} className="text-blue-600" />;
      case 'parent': return <User size={20} className="text-orange-600" />;
      case 'admin': return <User size={20} className="text-school-accent" />;
      default: return <User size={20} className="text-gray-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-school-accent to-school-accent-dark text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Brain size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user?.role === 'admin' ? 'AI Administrative Assistant' : 'AI Learning Assistant'}
              </h1>
              <p className="text-blue-100">
                {user?.role === 'admin' 
                  ? 'Your intelligent administrative support system' 
                  : 'Your personal 24/7 academic support'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-6 bg-white border-b border-school-border">
          <h3 className="text-lg font-semibold text-school-text mb-4">
            {user?.role === 'admin' ? 'Administrative Quick Actions' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(action.prompt)}
                className="flex items-center space-x-3 p-4 rounded-lg border border-school-border hover:bg-school-surface transition-colors text-left"
              >
                <div className={`p-2 rounded-lg ${
                  user?.role === 'admin' ? 'bg-school-accent/10' : 'bg-blue-100'
                }`}>
                  <action.icon size={20} className={`${
                    user?.role === 'admin' ? 'text-school-accent' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-school-text">{action.title}</p>
                  <p className="text-sm text-school-text-muted">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-school-accent text-white' 
                    : 'bg-gradient-to-br from-school-accent to-school-accent-dark text-white'
                }`}>
                  {message.role === 'user' ? getRoleIcon() : <Bot size={20} />}
                </div>
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-4 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-school-accent text-white' 
                    : 'bg-white border border-school-border'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-school-text-muted'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Suggestions */}
                {message.suggestions && message.role === 'assistant' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-school-accent to-school-accent-dark text-white flex items-center justify-center mr-3">
                <Bot size={20} />
              </div>
              <div className="bg-white border border-school-border rounded-2xl p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-school-border">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your question or ask for help..."
                className="w-full p-4 pr-16 border border-school-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[60px] max-h-32"
                rows={1}
              />
              <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                <button className="p-2 text-school-text-muted hover:text-school-accent transition-colors">
                  <Paperclip size={16} />
                </button>
                <button className="p-2 text-school-text-muted hover:text-school-accent transition-colors">
                  <Mic size={16} />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-school-text-muted">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              AI Assistant is online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AIAssistantPage, ['admin', 'teacher', 'student', 'parent']);
