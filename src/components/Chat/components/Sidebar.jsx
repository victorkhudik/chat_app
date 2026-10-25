import { useState, useEffect, useRef } from 'react';
import { apiService } from '../../../services/apiService';
import { useChat } from '../../../context/ChatContext';

export default function Sidebar() {
    const { idInstance, apiTokenInstance, selectedChat, setSelectedChat, logout, chats, setChats } = useChat();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPhoneNumber, setNewPhoneNumber] = useState('');

    let isFetchingRef = useRef(false);
    useEffect(() => {
        if (idInstance && apiTokenInstance && !isFetchingRef.current) {
            isFetchingRef.current = true;

            apiService.getChats(idInstance, apiTokenInstance)
                .then((data) => {
                    if (Array.isArray(data)) {
                        setChats(data);
                    }
                })
                .catch((error) => {
                    console.error('Ошибка загрузки чатов:', error);
                });
        }
    }, [idInstance, apiTokenInstance]);

    const currentChatId = selectedChat ? selectedChat.id : '';

    const filteredChats = (Array.isArray(chats) ? chats : []).filter((chat) => {
        const query = searchTerm.toLowerCase();
        const chatIdentifier = chat.id || '';
        const name = (chat.name || '').toLowerCase();
        const id = chatIdentifier.toLowerCase();
        return name.includes(query) || id.includes(query);
    });

    const handleCreateChat = (e) => {
        e.preventDefault();
        if (!newPhoneNumber.trim()) return;

        let cleanPhone = newPhoneNumber.trim().replace(/[^\d]/g, '');
        if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
            cleanPhone = '375' + cleanPhone.slice(1);
        }

        const chatId = `${cleanPhone}@c.us`;
        let existingChat = chats.find((c) =>  c.id === chatId);

        if (!existingChat) {
            existingChat = { chatId: chatId, id: chatId, name: `+${cleanPhone}` };
            setChats((prev) => [existingChat, ...prev]);
        }

        setIsModalOpen(false);
        setNewPhoneNumber('');
        setSelectedChat(existingChat);
    };

    return (
        <div className="w-1/3 bg-white border-r border-slate-300 flex flex-col justify-between">
            <div className="flex flex-col h-full">
                <div className="p-4 bg-slate-100 border-b font-semibold text-slate-700 flex justify-between items-center">
                    <span>Чаты</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs bg-[#3b9702] text-white px-2.5 py-1 rounded cursor-pointer hover:bg-[#328102] transition font-medium"
                        >
                            + Чат
                        </button>
                        <button
                            onClick={logout}
                            className="text-xs bg-red-500 text-white cursor-pointer px-2 py-1 rounded hover:bg-red-600 transition"
                        >
                            Выйти
                        </button>
                    </div>
                </div>

                <div className="p-2 border-b bg-slate-50">
                    <input
                        type="text"
                        placeholder="Поиск чатов..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3b9702]"
                    />
                </div>

                <div className="overflow-y-auto flex-1">
                    {filteredChats.length === 0 ? (
                        <div className="p-4 text-sm text-slate-400 text-center">
                            {searchTerm ? 'Чаты не найдены' : 'Список чатов пуст'}
                        </div>
                    ) : (
                        filteredChats.map((chat) => {
                            const isActive = currentChatId === chat.id;

                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => !isActive && setSelectedChat(chat)}
                                    className={`p-3 border-b transition ${
                                        isActive
                                            ? 'bg-emerald-50 border-l-4 border-l-[#3b9702] cursor-default' 
                                            : 'cursor-pointer hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="font-medium text-sm text-slate-800">{chat.name || chat.id}</div>
                                    <div className="text-xs text-slate-400 truncate">{chat.id}</div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-3 text-xs text-slate-400 border-t bg-slate-50">
                    Instance: {idInstance}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-96">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">Новый чат</h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Введите номер телефона (например, <span className="font-semibold text-slate-700">375291234567</span>):
                        </p>
                        <form onSubmit={handleCreateChat}>
                            <input
                                type="text"
                                placeholder="375291234567"
                                value={newPhoneNumber}
                                onChange={(e) => setNewPhoneNumber(e.target.value)}
                                autoFocus
                                className="w-full px-3 py-2 border rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#3b9702]"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-[#3b9702] text-white rounded-lg hover:bg-[#328102] transition font-medium"
                                >
                                    Начать чат
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}