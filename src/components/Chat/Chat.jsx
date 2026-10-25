import React from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import {ChatProvider, useChat} from '../../context/ChatContext'; // Обертка контекста
function ChatContent() {
    const { auth } = useChat();

    if (!auth) {
        return <Auth />;
    }

    return (
        <div className="flex h-screen bg-slate-200 relative">
            <Sidebar />
            <ChatWindow />
        </div>
    );
}

export default function Chat() {
    return (
        <ChatProvider>
            <ChatContent />
        </ChatProvider>
    );
}