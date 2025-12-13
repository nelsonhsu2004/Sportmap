// Cloudflare Worker - 用於部署 Express API
export default {
  async fetch(request, env) {
    // 這是一個簡單的代理，將請求轉發到你的 API
    const { pathname, search } = new URL(request.url);
    
    // 如果是 /api 開頭的請求，轉發到後端
    if (pathname.startsWith('/api')) {
      const backendUrl = `http://localhost:5000${pathname}${search}`;
      return fetch(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
    }
    
    // 否則返回前端資源
    return new Response('Not Found', { status: 404 });
  }
};
