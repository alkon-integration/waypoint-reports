<script>
    import {Button, Heading, Toolbar, Spinner} from "flowbite-svelte";
    import SelectDevices from "$lib/components/SelectDevices.svelte";
    import DatePicker from "$lib/components/DatePicker.svelte";
    import {setAlert, at} from "$lib/store.js";
    import {get} from "svelte/store";
    let loadingReport = false
    let start, end, selected, datePicker
    export let data
    let reportLoaded = false
</script>

<Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
    Excesos de Velocidad
</Heading>
<Toolbar class="w-full py-4 text-gray-500 dark:text-gray-400" embedded>
    <div class="flex gap-4">
        <SelectDevices devices={data.devices} bind:selected="{selected}"/>
        <DatePicker bind:datePicker="{datePicker}"></DatePicker>
    </div>
    <div class="p-4">
        <Button class="whitespace-nowrap" on:click={async () => {
            start = datePicker.getDate()
            loadingReport = false
            reportLoaded = false
            if (selected && selected && start) {
                setTimeout(() => loadingReport = true, 100)
            } else {
                setAlert('Por favor seleccionar vehículo y fecha')
            }
        }}>
            {#if loadingReport}
                <Spinner class="me-3" size="4" color="white"/>
            {/if}
            {loadingReport?'Cargando...':'Consultar'}
        </Button>
    </div>
</Toolbar>

{#if loadingReport || reportLoaded}
    <iframe on:load={() => {
        reportLoaded=true
        loadingReport=false
    }} title="report" class="h-full w-full pb-4" src="{
        `/reports/speeding?at=${get(at).AccessToken
        }&start=${start.toISOString().slice(0,10) + ' 00:00:00'
        }&end=${start.toISOString().slice(0,10) + ' 23:59:59'
        }&selected=${selected}`
    }"/>
{/if}
