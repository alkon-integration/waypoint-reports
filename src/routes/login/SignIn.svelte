<script >
    import {Checkbox, A, Button, Card } from 'flowbite-svelte';
    import {writable, get} from "svelte/store";
    import { setError, session, at } from '$lib/store';
    import {goto} from "$app/navigation";
    export let title = 'Sign in';
    export let rememberMe = true;
    export let lostPassword = true;
    export let createAccount = true;
    export let lostPasswordLink = '';
    export let loginTitle = 'Login';
    export let registerLink = '';
    export let createAccountTitle = 'Create account';
    export let mainDivClass =
        'flex flex-col items-center justify-center mx-auto md:h-screen pt:mt-0 dark:bg-gray-900';
    export let cardH1Class = 'text-2xl font-bold text-gray-900 dark:text-white';

    let error = writable('');

    const handlePasswordLogin = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const body = new URLSearchParams();
        const _session = {}
        console.log(get(session))

        for (const pair of formData.entries()) {
            body.append(pair[0], pair[1]);
            _session[pair[0]] = pair[1]
        }
        session.set(_session)
        try {
            let response = await fetch('/clientes/login_async.php', {
                method: 'POST',
                body
            });
            const data = await response.text()
            if (response.ok) {
                console.log(data)
                const user = _session.user_919e79e9
                const pass = _session.pass
                let url = `/WaypointSessions/OpenSessionAsync?usuario=${user
                    }&idusuario=${data.split(';')[1]
                    }&pass=${pass
                    }&dom=webapp.waypoint.cl`
                console.log(url)
                response = await fetch(url)
                url = `https://api.waypoint.cl/auth/login?user=${user}&password=${pass}`
                console.log(url)
                at.set(await fetch(url).then(r => r.json()))
                await goto('/')
            } else {
                setError(await response.text());
            }
        } catch (e) {
            error.set(e.message);
        }
    }
</script>

<div class={mainDivClass}>
    <!-- Card -->
    <Card class="w-full" size="md" border={false}>
        <h1 class={cardH1Class}>
            {title}
        </h1>
        <form class="mt-8 space-y-6" on:submit|preventDefault={handlePasswordLogin}>
            <slot />
            {#if rememberMe || lostPassword}
                <div class="flex items-start">
                    {#if rememberMe}
                        <Checkbox class="accent-primary-600" name="remember">Remember me</Checkbox>
                    {/if}
                    {#if lostPassword}
                        <A href={lostPasswordLink} aClass="ml-auto text-sm">Lost Password?</A>
                    {/if}
                </div>
            {/if}
            <Button type="submit" class="accent-primary-600" size="lg">{loginTitle}</Button>
            {#if createAccount}
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Not registered? <A href={registerLink}>{createAccountTitle}</A>
                </div>
            {/if}
        </form>
    </Card>
</div>

