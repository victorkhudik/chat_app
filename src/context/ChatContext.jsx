import { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
    const [auth, setAuth] = useState(() => !!storageService.getCredentials().idInstance);
    const [idInstance, setIdInstance] = useState(() => storageService.getCredentials().idInstance || '');
    const [apiTokenInstance, setApiTokenInstance] = useState(() => storageService.getCredentials().apiTokenInstance || '');

    const [selectedChat, setSelectedChat] = useState(() => storageService.getSelectedChat());
    const [chats, setChats] = useState([]);

    const login = (id, token) => {
        setIdInstance(id);
        setApiTokenInstance(token);
        setAuth(true);
    };

    const logout = () => {
        storageService.clearCredentials();
        storageService.setSelectedChat(null);
        setAuth(false);
        setIdInstance('');
        setApiTokenInstance('');
        setSelectedChat(null);
    };

    useEffect(() => {
        storageService.setSelectedChat(selectedChat);
    }, [selectedChat]);


    return (
        <ChatContext.Provider
            value={{
                auth,
                idInstance,
                apiTokenInstance,
                selectedChat,
                setSelectedChat,
                chats,
                setChats,
                login,
                logout,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat должен использоваться внутри ChatProvider');
    }
    return context;
}