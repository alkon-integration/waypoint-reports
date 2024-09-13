<script>
    import {
        Button, Heading,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell, Toolbar
    } from "flowbite-svelte";
    import { t } from "$lib/i18n";
    import {ExpandOutline, FileChartBarSolid, FilePdfSolid, MinimizeOutline} from "flowbite-svelte-icons";
    import { utils, writeFileXLSX } from 'xlsx';
    import SpeedLimitSign from "$lib/components/SpeedLimitSign.svelte";
    import {VisXYContainer, VisAxis, VisArea, VisTooltip, VisCrosshair, VisLine} from '@unovis/svelte'
    export let data;
    let showExport = true
    let tbl
    let maximized = false

    import {formatDuration, intervalToDuration} from "date-fns";
    import distance from "@turf/distance";
    import {point} from "@turf/helpers";

    function buildGoogleStaticMapURL(coordinates, points) {
        const baseUrl = "https://maps.googleapis.com/maps/api/staticmap?";
        const size = "size=300x200";
        const path = coordinates.map(c =>`path=color:0x00ff00ff|weight:6|${c.map(node => `${node[0]},${node[1]}`).join('|')}`).join('&');
        const markers = points.map(p => `markers=size:tiny|color:red|${p.latitude},${p.longitude}`).join('&')
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
        return `${baseUrl}${size}&${path}&key=${apiKey}&${markers}`;
    }
    const template = d => `${new Date(d.fixTime).toLocaleTimeString()}<br>${Math.round(d.speed * 1.852)} km/h`

</script>

<svelte:window on:afterprint={() => showExport=true} />

{#if showExport }
<Toolbar embedded class="w-full">
    <div slot="end" class="flex items-center space-x-2">
        <Button size="sm" color="alternative" class="gap-2 px-3" on:click={() => {
            if (maximized) {
                if (document.exitFullscreen) {
                    document.exitFullscreen()
                    maximized = false
                }
            }
            else {
                document.documentElement.requestFullscreen()
                maximized = true
            }
        }}>
            {#if maximized}
                <MinimizeOutline></MinimizeOutline>
            {:else}
                <ExpandOutline></ExpandOutline>
            {/if}
        </Button>
        <Button size="sm" color="alternative" class="gap-2 px-3" on:click={() => {
            showExport = false
            setTimeout(() => window.print(), 100)
        }}>
            <FilePdfSolid size="md" class="-ml-1"  />PDF
        </Button>
        <Button size="sm" color="alternative" class="gap-2 px-3" on:click={() => {
            const elt = tbl.getElementsByTagName("TABLE")[0];
            const wb = utils.table_to_book(elt);
            writeFileXLSX(wb, "speeding.xlsx");
        }}>
            <FileChartBarSolid size="md" class="-ml-1"  />Xlsx
        </Button>
    </div>
</Toolbar>
{/if}

<Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl pb-4">
    Informe de excesos de velocidad
</Heading>

<div bind:this={tbl}>
    <Table hoverable="true" class="table-fixed p-0">
    <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
        <TableHeadCell class="text-center">{$t('time')}</TableHeadCell>
        <TableHeadCell class="text-center">{$t('address')}</TableHeadCell>
        <TableHeadCell class="text-center p-0 w-20">{$t('max allowed')}</TableHeadCell>
        <TableHeadCell class="text-center p-0 w-64">{$t('speeding')}</TableHeadCell>
        <TableHeadCell class="text-center w-[310px]">{$t('map')}</TableHeadCell>
    </TableHead>
    <TableBody>
        {#each data.events as event}
            <TableBodyRow>
                <TableBodyCell class="text-center overflow-hidden overflow-ellipsis p-0">
                    {new Date(event.positions[0].fixTime).toLocaleString()}
                </TableBodyCell>
                <TableBodyCell class="p-0 text-center whitespace-normal ">
                    <a target="_blank" href="https://openstreetmap.org/way/{event.edges[0].way_id}">
                        {#each event.edges
                            .filter(e => e.sign)
                            .map(e => e.sign)
                            .map(e => Object.entries(e).map(([k, v]) => `${k}: ${v}`)).flat() as entry
                        }
                            {entry}<br>
                        {/each}
                        {#each Array.from(new Set(event.edges.filter(e => e.names).map(e => e.names).flat())) as name}
                            {name}<br>
                        {/each}
                    </a>
                </TableBodyCell>
                <TableBodyCell>
                    <SpeedLimitSign limit="{event.edges[0].speed_limit}"/>
                </TableBodyCell>
                <TableBodyCell class="text-center {event.positions.length === 1 && 'text-lg'}">
                    {#if event.positions.length > 1}
                        <VisXYContainer height="100" data={event.positions}>
                            <VisArea color="red" opacity={0.2} x={d => new Date(d.fixTime)} y={d => d.speed*1.852} />
                            <VisLine color="red" x={d => new Date(d.fixTime)} y={d => d.speed*1.852} />
                            <VisAxis type="x" tickFormat="{(x) => new Date(x).toLocaleTimeString()}" />
                            <VisAxis type="y" />
                            <VisCrosshair {template}></VisCrosshair>
                            <VisTooltip/>
                        </VisXYContainer>
                        {
                            formatDuration(intervalToDuration({
                                start: new Date(event.positions[0].fixTime),
                                end: new Date(event.positions.slice(-1)[0].fixTime)
                            }))
                        }<br>
                        {
                            event.positions.reduce((acc, current, index, positions) => {
                                if (index === 0) return acc
                                const previousPosition = positions[index - 1]
                                const point1 = point([previousPosition.longitude, previousPosition.latitude])
                                const point2 = point([current.longitude, current.latitude])
                                return acc + distance(point1, point2, { units: 'kilometers' })
                            }, 0).toFixed(1) + ' km'
                        }
                    {:else}
                        {Math.round(event.positions[0].speed * 1.852)}
                    {/if}
                </TableBodyCell>
                <TableBodyCell class="p-1">
                    <a target="_blank" href="https://openstreetmap.org/way/{event.edges[0].way_id}"><img src="{buildGoogleStaticMapURL(event.shapes, event.positions)}" alt="map"></a>
                </TableBodyCell>
            </TableBodyRow>
        {/each}
    </TableBody>
</Table>
</div>

<style>
    @page {
        size: A4 landscape;
        margin: 5mm;
    }
    div {
        print-color-adjust: exact;
    }
</style>
