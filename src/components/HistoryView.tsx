import React, { useState } from 'react';
import { History, Search, Trash2, ArrowRight, MessageSquare, Calendar, Sparkles } from 'lucide-react';
import { ChatSession, ScreenType } from '../types';

interface HistoryViewProps {
  onNavigate: (screen: ScreenType) => void;
  sessions: ChatSession[];
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onNavigate,
  sessions,
  onSelectSession,
  onDeleteSession
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sayai-screen sayai-screen-history flex-1 max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-blue-950/80 border border-purple-500/30 overflow-hidden shadow-[0_0_25px_rgba(147,51,234,0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Chat History</h2>
              <p className="text-xs text-purple-200/80">Review, resume, and manage all your past AI conversations</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('chat')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <span>New Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search previous conversations..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0a0e2a]/80 text-white placeholder-slate-400 border border-purple-900/30 focus:border-purple-500 focus:outline-none text-sm transition-all"
        />
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="rounded-2xl p-8 bg-[#0a0e2a]/60 border border-purple-900/20 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-purple-400/50 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No conversations found</h3>
            <p className="text-xs text-slate-400">Start a new chat to build your SAY AI history</p>
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
            >
              Start Chat
            </button>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-[#0c102f]/80 hover:bg-[#121745] border border-purple-900/25 hover:border-purple-600/40 transition-all cursor-pointer group"
              onClick={() => {
                onSelectSession(session);
                onNavigate('chat');
              }}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-700/40 flex items-center justify-center text-purple-300 flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                      {session.title}
                    </h4>
                    {session.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/30 flex-shrink-0">
                        {session.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {session.lastMessage}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{session.timeAgo}</span>
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  title="Delete chat"
                  className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
