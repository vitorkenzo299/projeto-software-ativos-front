import React, { useEffect, useState } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";

const BASE_URL = "/api";


export default function StocksApp() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lastValue, setLastValue] = useState("");

  const {
    user,
    isAuthenticated,
    getAccessTokenSilently
  } = useAuth0();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        console.log(accessToken)
        setToken(accessToken);
      } catch (e) {
        console.error('Erro ao buscar token:', e);
      }
    };

    if (isAuthenticated) {
      fetchToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);


  if (!isAuthenticated) {
    return <LoginButton />;
  }

  async function fetchStocks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/stocks`,{
        headers: {
     //     Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Erro ao carregar: ${res.status}`);
      const data = await res.json();
      setStocks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);

    const dto = {
      ticker: ticker || null,
      name: name || null,
      description: description || null,
      lastValue: lastValue ? parseFloat(lastValue) : null
    };

    try {
      const res = await fetch(`${BASE_URL}/stocks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",

     //     "Authorization": `Bearer ${token}`,
         },
        body: JSON.stringify(dto)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao criar: ${res.status} ${text}`);
      }

      const created = await res.json();
      setStocks(prev => [created, ...prev]);

      setTicker("");
      setName("");
      setDescription("");
      setLastValue("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">

      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <LogoutButton />
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Stocks — criação e listagem</h1>

        <form onSubmit={handleCreate} className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <input value={ticker} onChange={e => setTicker(e.target.value)} placeholder="Ticker" className="p-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" className="p-2 border rounded" />
          </div>

          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição" className="w-full p-2 border rounded" />

          <div className="grid grid-cols-3 gap-3">
            <input value={lastValue} onChange={e => setLastValue(e.target.value)} placeholder="Último valor" type="number" step="0.01" className="p-2 border rounded" />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Criar</button>
            <button type="button" onClick={fetchStocks} className="px-4 py-2 bg-gray-200 rounded">Recarregar</button>
          </div>
        </form>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <div>
          <h2 className="text-xl font-semibold mb-2">Lista de Stocks</h2>

          {loading ? (
            <div>Carregando...</div>
          ) : stocks.length === 0 ? (
            <div>Nenhum ativo encontrado.</div>
          ) : (
            <ul className="space-y-3">
              {stocks.map((s) => (
                <li key={s.id ?? s.ticker} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{s.ticker} — {s.name}</div>
                      {s.description && <div className="text-sm text-gray-600">{s.description}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{s.lastValue ?? "-"}</div>
                      <div className="text-sm text-gray-500">{s.dateLastValue ?? "-"}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
