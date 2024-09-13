<script>
    import { MultiSelect } from 'flowbite-svelte';
    export let selected;
    export let devices;
</script>

<MultiSelect placeholder="Select devices..." items={
    devices.sort((a, b) => a.p.localeCompare(b.p)).map(d => ({value: d.imei, name: d.p}))
    } bind:value={selected} size="lg"
/>
