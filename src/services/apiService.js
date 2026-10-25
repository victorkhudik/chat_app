const BASE_URL = 'https://api.green-api.com';

export const apiService = {
    async getStateInstance(idInstance, apiTokenInstance) {
        const url = `${BASE_URL}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Ошибка проверки учетных данных');
        }
        return await response.json();
    },
    async getChats(idInstance, apiTokenInstance) {
        const url = `${BASE_URL}/waInstance${idInstance}/GetChats/${apiTokenInstance}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Не удалось получить список чатов');
        }
        return await response.json();
    },
    async sendMessage(idInstance, apiTokenInstance, chatId, message) {
        const url = `${BASE_URL}/waInstance${idInstance}/SendMessage/${apiTokenInstance}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({chatId, message})
        });
        return response.ok;
    },
    async getChatHistory(idInstance, apiTokenInstance, chatId) {
        console.log(chatId);
        const url = `${BASE_URL}/waInstance${idInstance}/GetChatHistory/${apiTokenInstance}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({chatId, count: 50})
        });
        if (!response.ok) {
            throw new Error('Не удалось получить историю сообщений');
        }
        return await response.json();
    },
    async receiveNotification(idInstance, apiTokenInstance) {
        const url = `${BASE_URL}/waInstance${idInstance}/ReceiveNotification/${apiTokenInstance}`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const text = await response.text();
        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch (e) {
            return null;
        }
    },
    async deleteNotification(idInstance, apiTokenInstance, receiptId) {
        const url = `${BASE_URL}/waInstance${idInstance}/DeleteNotification/${apiTokenInstance}/${receiptId}`;
        await fetch(url, {method: 'DELETE'});
    }
};