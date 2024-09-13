<script>
    import {Select} from 'flowbite-svelte';
    export let selected;
    export let devices;
</script>

<Select class="w-40" placeholder="Select devices..." items={
    devices.sort((a, b) => a.p.localeCompare(b.p)).map(d => ({value: d.imei, name: d.p}))
    } bind:value={selected} size="lg"
/>
