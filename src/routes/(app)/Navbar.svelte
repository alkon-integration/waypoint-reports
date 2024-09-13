<script>
    import "../../app.css";
    import {
        Navbar,
        NavBrand,
        NavHamburger,
        DarkMode
    } from 'flowbite-svelte';
    import UserMenu from "./UserMenu.svelte";

    export let drawerHidden=false;
    export let fluid=true
</script>
<Navbar {fluid} class="text-black" color="default" let:NavContainer>
    <NavContainer class="mb-px mt-px px-1" {fluid}>
        <NavHamburger
                onClick={() => (drawerHidden = !drawerHidden)}
                class="m-0 me-3 md:block lg:hidden"
        />
        <NavBrand href="/" class="lg:w-60">
            <img
                    src="{import.meta.env.VITE_LOGO_URL}"
                    class="me-2.5 h-6 sm:h-8"
                    alt="Logo"
            />
            <span
                    class="ml-px self-center whitespace-nowrap text-xl font-semibold dark:text-white sm:text-2xl"
            >
				Informes
			</span>
        </NavBrand>
        <div class="ms-auto flex items-center text-gray-500 dark:text-gray-400 sm:order-2">
            <DarkMode />
            <UserMenu />
        </div>
    </NavContainer>
</Navbar>
