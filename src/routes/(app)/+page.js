import {goto} from "$app/navigation";

export const ssr = false

export async function load({fetch}) {
    try {
        let response = await fetch('/Req/GetCliente')
        if (response.status !== 200) {
            console.log(response)
            await goto('/login')
            return
        }
    } catch (e) {
        alert(e.message)
    }
    return {devices: []}
}
