import React, { useEffect, useState } from 'react';

export default function AuthCallback() {
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [deepLinkUrl, setDeepLinkUrl] = useState('');

  useEffect(() => {
    // Función para obtener parámetros tanto de hash (#) como de query (?)
    const getAuthParams = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      return {
        accessToken: hashParams.get('access_token') || queryParams.get('access_token'),
        refreshToken: hashParams.get('refresh_token') || queryParams.get('refresh_token'),
        type: hashParams.get('type') || queryParams.get('type'),
        token: hashParams.get('token') || queryParams.get('token'),
        tokenHash: hashParams.get('token_hash') || queryParams.get('token_hash'),
        error: hashParams.get('error') || queryParams.get('error'),
        errorDescription: hashParams.get('error_description') || queryParams.get('error_description'),
      };
    };

    const params = getAuthParams();
    console.log('Auth callback params:', params);

    if (params.error) {
      setStatus('error');
      setErrorMessage(params.errorDescription || params.error || 'Error de autenticación');
      return;
    }

    // Construir deep link
    let url = 'carniapp://auth/callback';
    const queryParts = [];

    if (params.accessToken) queryParts.push(`access_token=${encodeURIComponent(params.accessToken)}`);
    if (params.refreshToken) queryParts.push(`refresh_token=${encodeURIComponent(params.refreshToken)}`);
    if (params.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
    if (params.token) queryParts.push(`token=${encodeURIComponent(params.token)}`);
    if (params.tokenHash) queryParts.push(`token_hash=${encodeURIComponent(params.tokenHash)}`);

    if (queryParts.length > 0) {
      url += '?' + queryParts.join('&');
    }

    setDeepLinkUrl(url);

    // Intentar abrir app
    const openAppTimeout = setTimeout(() => {
      try {
        window.location.href = url;
      } catch (error) {
        console.error('Error abriendo deep link:', error);
      }
    }, 1000);

    const successTimeout = setTimeout(() => {
      setStatus('success');
    }, 2500);

    return () => {
      clearTimeout(openAppTimeout);
      clearTimeout(successTimeout);
    };
  }, []);

  const handleOpenApp = () => {
    window.location.href = deepLinkUrl || 'carniapp://';
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-5 bg-gradient-to-br from-primary to-primary-dark text-dark font-sans">
      <div className="max-w-md w-full p-10 bg-white/25 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
        
        {/* Logo */}
        <div className="text-6xl mb-4 animate-bounce-slow">🥩</div>
        <div className="text-4xl font-bold mb-6 drop-shadow-sm text-dark">
          CarniApp
        </div>

        {/* Estado: Procesando */}
        {status === 'processing' && (
          <div className="animate-fade-in">
            <div className="text-xl mb-8 leading-relaxed font-medium">
              Confirmando tu cuenta...
              <br />
              <span className="text-sm opacity-80 font-normal">Serás redirigido a la app en un momento</span>
            </div>
            <div className="w-10 h-10 border-4 border-black/10 border-t-dark rounded-full animate-spin mx-auto my-6" />
          </div>
        )}

        {/* Estado: Éxito */}
        {status === 'success' && (
          <div className="animate-fade-in">
            <div className="text-7xl mb-4">✅</div>
            <div className="text-xl mb-8 leading-relaxed font-medium">
              ¡Cuenta confirmada!
              <br />
              <span className="text-sm opacity-80 font-normal">Ya puedes usar CarniApp</span>
            </div>
            
            <button
              onClick={handleOpenApp}
              className="inline-block bg-dark text-primary px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200 border-2 border-dark"
            >
              Abrir CarniApp
            </button>
            
            <p className="text-sm opacity-70 mt-6 font-medium">
              ¿No se abre la app?
              <br />
              Asegúrate de tener CarniApp instalada
            </p>
          </div>
        )}

        {/* Estado: Error */}
        {status === 'error' && (
          <div className="animate-fade-in">
            <div className="text-7xl mb-4">❌</div>
            <div className="text-lg mb-8 leading-relaxed font-medium text-red-800 bg-red-100/50 p-3 rounded-lg">
              {errorMessage}
            </div>
            <button
              onClick={handleRetry}
              className="inline-block bg-white/30 text-dark px-8 py-3 rounded-full border-2 border-dark font-bold text-lg hover:bg-white/50 transition-all"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
