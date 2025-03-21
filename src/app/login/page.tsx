// app/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn('credentials', {
            username,
            password,
            redirect: false,
        });
        console.log(res);
        if (res?.ok) {
            router.push('/upload');
        } else {
            alert('Erro ao fazer login');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 mb-2 w-full"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Entrar</button>
            </form>
        </div>
    );
}