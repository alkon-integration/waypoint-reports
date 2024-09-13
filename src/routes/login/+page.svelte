<script>
    import '../../app.css'
    import { Label, Input } from 'flowbite-svelte';
    import SignIn from './SignIn.svelte';
    let title = 'Sign in';
    let site = {
        name: 'Configurator',
        img: '/logo.png',
        link: '/',
        imgAlt: 'Logo'
    };
    let rememberMe = true;
    let lostPassword = true;
    let createAccount = true;
    let lostPasswordLink = 'forgot-password';
    let loginTitle = 'Entrar';
    let registerLink = 'sign-up';
    let createAccountTitle = 'Create account';

    const onSubmit = (e) => {
        const formData = new FormData(e.target);

        const data = {};
        for (const field of formData.entries()) {
            const [key, value] = field;
            data[key] = value;
        }
    };

</script>

<SignIn
        {title}
        {site}
        {rememberMe}
        {lostPassword}
        {createAccount}
        {lostPasswordLink}
        {loginTitle}
        {registerLink}
        {createAccountTitle}
        on:submit={onSubmit}
>
    <div>
        <Label for="email" class="mb-2 dark:text-white">Usuario</Label>
        <Input
                type="text"
                name="user_919e79e9"
                required
                class="border outline-none dark:border-gray-600 dark:bg-gray-700"
        />
    </div>
    <div>
        <Label for="password" class="mb-2 dark:text-white">Contraseña</Label>
        <Input
                type="password"
                name="pass"
                placeholder=""
                required
                class="border outline-none dark:border-gray-600 dark:bg-gray-700"
        />
        <Input type="hidden" name="login_url" value="/clientes/"></Input>
        <Input type="hidden" name="return_id" value="true"></Input>
        <Input type="hidden" name="campo_usuario" value="919e79e9"></Input>
    </div>
</SignIn>
