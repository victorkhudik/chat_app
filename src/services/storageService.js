const ID_INSTANCE_KEY = 'green_idInstance';
const API_TOKEN_KEY = 'green_apiTokenInstance';
const SELECTED_CHAT_KEY = 'selectedChat';

export const storageService = {
    getCredentials() {
        return {
            idInstance: localStorage.getItem(ID_INSTANCE_KEY) || '',
            apiTokenInstance: localStorage.getItem(API_TOKEN_KEY) || '',
        };
    },
    setCredentials(idInstance, apiTokenInstance) {
        localStorage.setItem(ID_INSTANCE_KEY, idInstance);
        localStorage.setItem(API_TOKEN_KEY, apiTokenInstance);
    },
    clearCredentials() {
        localStorage.removeItem(ID_INSTANCE_KEY);
        localStorage.removeItem(API_TOKEN_KEY);
    },
    getSelectedChat() {
        const savedChat = localStorage.getItem(SELECTED_CHAT_KEY);
        return savedChat ? JSON.parse(savedChat) : null;
    },
    setSelectedChat(selectedChat) {
        if (selectedChat) {
            localStorage.setItem('selectedChat', JSON.stringify(selectedChat));
        } else {
            localStorage.removeItem('selectedChat');
        }
    }
};