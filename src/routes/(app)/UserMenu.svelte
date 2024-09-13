<script lang="ts">
    import { Avatar, Dropdown, DropdownDivider, DropdownHeader, DropdownItem } from 'flowbite-svelte';
    import {session} from '$lib/store'
    import {logout} from '$lib'
    import {get} from "svelte/store";
    let {user_919e79e9} = get(session)
    const names = user_919e79e9 && user_919e79e9.split(' ');
    const initials = names && names.map(n => n[0]).join('');
    let avatar = initials && initials.toUpperCase();

</script>

<button class="ms-3 rounded-full ring-gray-400 focus:ring-4 dark:ring-gray-600">
    <Avatar>{avatar}</Avatar>
</button>
<Dropdown placement="bottom-end">
    <DropdownHeader>
        <span class="block text-sm">{names}</span>
        <span class="block truncate text-sm font-medium"></span>
    </DropdownHeader>
    <DropdownItem>Settings</DropdownItem>
    <DropdownDivider />
    <DropdownItem on:click={logout}>Sign out</DropdownItem>
</Dropdown>
