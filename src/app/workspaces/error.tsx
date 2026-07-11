'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function WorkspacesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    console.error('[WorkspacesError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 text-center">
      <p className="text-6xl font-black text-gray-200 select-none">Oops</p>
      <h1 className="text-2xl font-bold text-gray-900 mt-4">{t('Failed to load workspaces', 'Échec du chargement des espaces de travail')}</h1>
      <p className="text-gray-500 mt-2 max-w-sm">
        {error.message === 'UNAUTHORIZED'
          ? t('Your session has expired. Please log in again.', 'Votre session a expiré. Veuillez vous reconnecter.')
          : t('Could not fetch your workspaces. Check your connection and try again.', 'Impossible de récupérer vos espaces de travail. Vérifiez votre connexion et réessayez.')}
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#174CD2] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          {t('Try again', 'Réessayer')}
        </button>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
        >
          {t('Back to login', 'Retour à la connexion')}
        </button>
      </div>
    </div>
  );
}
