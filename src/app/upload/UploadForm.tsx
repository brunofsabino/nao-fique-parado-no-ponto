// app/upload/UploadForm.tsx
// app/upload/UploadForm.tsx
'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UploadForm() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redireciona apenas quando o status estiver definido como "unauthenticated"
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Mostra um loading enquanto a sessão está sendo carregada
    if (status === "loading") {
        return <div>Carregando...</div>;
    }

    // Se não houver sessão, retorna null (o useEffect já redireciona)
    if (!session) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const res = await fetch("/api/upload-csv", { method: "POST", body: formData });
        const result = await res.json();
        alert(result.message || result.error);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Upload de CSV</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" name="csv" accept=".csv" required />
                <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">Enviar</button>
            </form>
        </div>
    );
}