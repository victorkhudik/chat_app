import { useState } from 'react';
import { apiService } from '../../../services/apiService';
import { storageService } from '../../../services/storageService';
import { useChat } from '../../../context/ChatContext';

export default function Login({ onLogin }) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useChat();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idInstance.trim() || !apiTokenInstance.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await apiService.getStateInstance(idInstance.trim(), apiTokenInstance.trim());

      if (data.stateInstance) {
        storageService.setCredentials(idInstance.trim(), apiTokenInstance.trim());
        login(idInstance.trim(), apiTokenInstance.trim());
      } else {
        setError('Инстанс не найден или токен недействителен');
      }
    } catch (err) {
      setError('Ошибка проверки. Проверьте idInstance и apiTokenInstance.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#3b9702]">Вход в GREEN-API</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-slate-600">idInstance</label>
          <input
            type="text"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-slate-600">apiTokenInstance</label>
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3b9702] text-white py-2 rounded-lg hover:bg-[#62ff67] transition font-medium disabled:bg-[#62ff67]"
        >
          {loading ? 'Проверка...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}