import {goto} from "$app/navigation";

export const ssr = false

export async function load({fetch}) {
    try {
        let response = await fetch('/Req/GetCliente')
        const [result] = await response.json()
        if (result.error) {
            console.log(result.error)
            await goto('/login')
            return
        }
    } catch (e) {
        alert(e.message)
    }
    return {devices: []}
}
