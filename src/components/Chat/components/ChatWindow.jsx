import { useState, useEffect, useRef } from 'react';
import { apiService } from '../../../services/apiService';
import { useChat } from '../../../context/ChatContext'; // Импортируем контекст

export default function ChatWindow() {
    const { idInstance, apiTokenInstance, selectedChat, setChats } = useChat();

    const [chatMessages, setChatMessages] = useState([]);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    const prevChatIdRef = useRef(null);

    useEffect(() => {
        if (!selectedChat || prevChatIdRef.current === selectedChat.id)
            return;

        let timeoutId = null;
        timeoutId = setTimeout(async () => {
            setChatMessages([]);
            prevChatIdRef.current = selectedChat.id;
            const fetchHistory = async () => {
                try {
                    setChatMessages([]);
                    const history = await apiService.getChatHistory(idInstance, apiTokenInstance, selectedChat.id);
                    if (Array.isArray(history)) {
                        const formattedMessages = history
                            .filter((msg) => msg.typeMessage === 'textMessage' || msg.typeMessage === 'extendedTextMessage')
                            .map((msg) => {
                                const text = msg.textMessage || msg.extendedTextMessage?.text || '';
                                const isOutgoing = msg.type === 'outgoing' || msg.type === 'out' || msg.sendByApi === true;

                                return {
                                    text: text,
                                    type: isOutgoing ? 'outgoing' : 'incoming',
                                    id: msg.idMessage,
                                    timestamp: msg.timestamp || 0
                                };
                            })
                            .sort((a, b) => a.timestamp - b.timestamp);

                        setChatMessages(formattedMessages);
                    }
                } catch (error) {
                    console.error('Ошибка загрузки чата:', error);
                }
            };

            fetchHistory();
        }, 500);

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };

    }, [selectedChat?.id, idInstance, apiTokenInstance]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedChat) return;


        try {
            const success = await apiService.sendMessage(idInstance, apiTokenInstance, selectedChat.id, message);
            if (success) {
                setChatMessages((prev) => [...prev, { text: message, type: 'outgoing' }]);
                setMessage('');
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
        }
    };

    useEffect(() => {
        if (!idInstance || !apiTokenInstance) return;

        let isMounted = true;
        let timeoutId = null;

        const pollNotifications = async () => {
            if (!isMounted) return;
            try {
                const data = await apiService.receiveNotification(idInstance, apiTokenInstance);

                if (data && data.body && isMounted) {
                    const receiptId = data.receiptId;
                    const messageData = data.body;

                    if (
                        messageData.typeWebhook === 'incomingMessageReceived' ||
                        messageData.typeWebhook === 'outgoingMessageReceived'
                    ) {
                        const msgData = messageData.messageData;

                        const text = msgData?.textMessageData?.textMessage ||
                            msgData?.extendedTextMessageData?.text ||
                            msgData?.extendedTextMessage?.text;

                        const senderData = messageData.senderData;
                        const chatId = senderData?.id || messageData.body?.chatId;

                        const isOutgoing = messageData.typeWebhook === 'outgoingMessageReceived';
                        const activeChatId = selectedChat ? selectedChat.id : null;

                        if (text && chatId) {
                            setChats((prevChats) => {
                                const chatExists = prevChats.some((c) =>  c.id === chatId);
                                if (!chatExists) {
                                    const newChatObj = { chatId: chatId, id: chatId, name: chatId };
                                    return [newChatObj, ...prevChats];
                                }
                                return prevChats;
                            });

                            if (activeChatId && chatId === activeChatId) {
                                setChatMessages((prev) => {
                                    if (isOutgoing) {
                                        const lastMsg = prev[prev.length - 1]; // Исправлено: добавлен минус
                                        if (lastMsg && lastMsg.text === text && lastMsg.type === 'outgoing') {
                                            return prev;
                                        }
                                    }
                                    return [...prev, { text, type: isOutgoing ? 'outgoing' : 'incoming' }];
                                });
                            }
                        }
                    }

                    await apiService.deleteNotification(idInstance, apiTokenInstance, receiptId);
                }
            } catch (error) {
                console.warn('Ошибка получения уведомлений:', error);
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(pollNotifications, 4000);
                }
            }
        };

        pollNotifications();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [idInstance, apiTokenInstance, selectedChat]);

    return (
        <div className="flex-1 flex flex-col bg-[#e7eebd]/30">
            <div className="p-4 bg-white border-b flex items-center px-6 shadow-sm">
                <span className="font-semibold text-slate-700">
                    {selectedChat ? `Чат с: ${selectedChat.name || selectedChat.id}` : 'Выберите чат из списка слева'}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!selectedChat ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        Выберите чат, чтобы увидеть сообщения
                    </div>
                ) : (
                    <>
                        {chatMessages.map((msg, index) => (
                            <div key={msg.id || index} className={`flex ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                                    msg.type === 'outgoing'
                                        ? 'bg-[#eeffde] text-slate-800 rounded-br-none shadow-sm'
                                        : 'bg-white text-slate-800 rounded-bl-none shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {selectedChat && (
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
                    <input
                        type="text"
                        placeholder="Написать сообщение..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#3b9702] text-sm"
                    />
                    <button type="submit" className="bg-[#3b9702] text-white px-5 py-2 rounded-full hover:bg-[#328102] transition text-sm font-medium">
                        Отправить
                    </button>
                </form>
            )}
        </div>
    );
}