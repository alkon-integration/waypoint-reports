import {goto} from "$app/navigation";

export const ssr = false

export async function load({fetch}) {
    try {
        let response = await fetch('/Req/GetCliente')
        if (response.ok) {
            const [{id}] = await response.json()
            response = await fetch('/Req/GetMovil?client=' + id);
            if (response.ok) {
                const devices = await response.json()
                return {devices: devices.slice(0, 500)}
            } else {
                alert(await response.text())
            }
        } else {
            if (response.status === 401 || response.status === 403) {
                await goto('/login')
                return
            } else {
                alert(await response.text())
            }
        }
    } catch (e) {
        alert(e.message)
    }
    return {devices: []}
}
