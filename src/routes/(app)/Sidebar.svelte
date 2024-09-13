<script>
    import {
        Sidebar, SidebarCta,
        SidebarDropdownWrapper,
        SidebarGroup,
        SidebarItem,
        SidebarWrapper,
        Tooltip
    } from "flowbite-svelte";
    import { page } from '$app/stores';
    import { afterNavigate } from '$app/navigation';
    import {
        AngleDownOutline, AngleLeftOutline, AngleRightOutline, AngleUpOutline, GridPlusOutline
    } from "flowbite-svelte-icons";
    import config from 'tailwindcss/defaultTheme';
    import {onMount} from "svelte";


    export let drawerHidden = false;
    $: mainSidebarUrl = $page.url.pathname;
    let activeMainSidebar;

    afterNavigate((navigation) => {
        // this fixes https://github.com/themesberg/flowbite-svelte/issues/364
        document.getElementById('svelte')?.scrollTo({ top: 0 });
        closeDrawer();
        activeMainSidebar = navigation.to?.url.pathname ?? '';
    });

    const closeDrawer = () => {
        drawerHidden = true;
    };

    let iconClass =
        'flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white';
    let itemClass =
        'flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700';
    let groupClass = 'pt-2 space-y-2';


    let items = [
        { name: 'Velocidad', icon: GridPlusOutline, href: '/speeding' },
    ];

    let lg,sm;
    const checkWidth = () => {
        lg = window.matchMedia(`(min-width: ${config.screens.lg})`).matches
        sm = window.matchMedia(`(min-width: ${config.screens.sm})`).matches
    }
    onMount(() => {
        checkWidth()
        window.addEventListener('resize', checkWidth);
        return () => {
            window.removeEventListener('resize', checkWidth);
        };
    })

    let collapsed=false;

</script>

<Sidebar
        class={drawerHidden ? 'hidden' : ''}
        activeUrl={mainSidebarUrl}
        activeClass="bg-gray-100 dark:bg-gray-700"
        asideClass={`fixed sm:static inset-0 z-30 min-h-full w-auto ${collapsed?'':'lg:w-64'} lg:h-auto border-e border-gray-200 dark:border-gray-600 lg:overflow-y-visible lg:pt-16 lg:block`}
>
    <SidebarWrapper
            divClass="overflow-y-auto px-3 pt-20 lg:pt-5 h-full bg-white scrolling-touch max-w-2xs lg:h-[calc(100vh-4rem)] lg:block dark:bg-gray-800 lg:me-0 lg:sticky top-2"
    >
        <nav class="divide-y divide-gray-200 dark:divide-gray-700">
            <SidebarGroup ulClass={groupClass} class="mb-3">
                {#each items as { name, icon, children, href } (name)}
                    {#if children}
                        <SidebarDropdownWrapper label={collapsed&&sm ? '' : name} class="pr-3">
                            <AngleDownOutline slot="arrowdown" strokeWidth="3.3" size="sm" />
                            <AngleUpOutline slot="arrowup" strokeWidth="3.3" size="sm" />
                            <svelte:component this={icon} slot="icon" class={iconClass} />

                            {#each Object.entries(children) as [title, href]}
                                <SidebarItem
                                        label={title}
                                        {href}
                                        spanClass="ml-9"
                                        class={itemClass}
                                        active={activeMainSidebar === href}
                                />
                            {/each}
                        </SidebarDropdownWrapper>
                    {:else}
                        <SidebarItem
                                label={collapsed&&sm ? '' : name}
                                {href}
                                spanClass="ml-3"
                                class={itemClass}
                                active={activeMainSidebar === href}
                        >
                            <svelte:component this={icon} slot="icon" class={iconClass} />
                        </SidebarItem>
                        {#if (!lg)}
                            <Tooltip placement="right" arrow={false}>{name}</Tooltip>
                        {/if}
                    {/if}
                {/each}
            </SidebarGroup>
            <SidebarCta
                    divWrapperClass="p-4 mt-6"
                    divClass="grid justify-items-end"
                    spanClass=""
            >
                <button slot="icon" on:click={() => (collapsed = !collapsed)} type="button">
                    {#if (collapsed)}
                        <AngleRightOutline class={iconClass}/>
                    {:else}
                        <AngleLeftOutline class={iconClass}/>
                    {/if}
                </button>
            </SidebarCta>
        </nav>
    </SidebarWrapper>
</Sidebar>
