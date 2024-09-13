import {goto} from "$app/navigation";
import {error, session, setError} from "$lib/store.js";

export async function forwardRequest({ request, platform }) {
    try {
        const host = (platform && platform.env.TRACCAR_SERVER) || import.meta.env.VITE_TRACCAR_SERVER
        if (!host) { return new Response('please configure server', {status: 500}) }
        const url = new URL(request.url)
        url.host = host
        url.port = 80
        url.protocol = 'https:'
        const response = await fetch(new Request(url, request))
        const body = await response.text()
        if (response.ok) {
            const setCookie = response.headers.getSetCookie()
            return new Response(body,
            {
                method: request.method,
                headers: {'set-cookie': setCookie.map(c => c.replace('waypoint.cl', new URL(request.url).hostname))}
            })
        }
        return new Response(body, {status: response.status})
    } catch (e) {
        console.log(e)
        return new Response(e.message, {status: 500})
    }
}


export async function logout() {
    try {
        const response = await fetch('/api/session', {
            method: 'DELETE'
        });
        if (response.ok) {
            session.set({});
        } else {
            setError(await response.text());
        }
    } catch (e) {
        error.set(e.message);
    }
    await goto('/login')
}
