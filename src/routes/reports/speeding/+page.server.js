async function fetchReportes(url, body, authorization) {
    const init = {
        body,
        method: 'post',
        headers: {
            'content-type': 'application/json',
            //'x-api-key': 'Up15nJltS365KirecShSz9OIKmMlXfBMat4gEspl'
            'x-api-key': 'SOxJ05P3KOrkyqJopz6T2nsQbo8H1CH898rBXyyf'
        }
    }
    if (authorization) {
        init.headers['authorization'] = authorization
    }
    url = 'https://reportes.waypoint.cl/v1/base/' + url
    console.log(url, init)
    const response = await fetch(url, init);
    if (response.ok) { return response.json() }
    throw new Error(response.status + ' ' + await response.text())
}

async function getEvents(selected, traccar, searchParams) {
    const result = []
    for (const deviceId of selected) {
        const authorization = `Bearer ${searchParams.get('at')}`
        const body = {
            listImei: selected.map(s => parseInt(s)),
            desde: searchParams.get('start'),
            hasta: searchParams.get('end'),
            async: true,
            formato: 'json',
            ignicion: true,
            interseccion: false,
            maxHdop: 2.4,
            offset: 1,
            minNsat: 5,
            minDetencion: '3600',
            timezone: 1,
            zona: true,
            obd2: false,
            zoneId: 'Europe/Lisbon'
        }

        let payload = await fetchReportes(
            'historial-ruta',
            JSON.stringify(body),
            authorization)
        let status = 'RUNNING'
        let response
        while (status === 'RUNNING') {
            await new Promise(res => setTimeout(res, 1000))
            response = await fetchReportes('report-status', JSON.stringify({...payload, count:true}))
            status = response.status
            console.log(response)
        }
        response = await fetch(response && response.url)
        if (response.ok) {
            const {data} = await response.json()
            result.push(await getSpeedEvents(selected,
                data.map(p => ({longitude: p.lon, latitude: p.lat, speed: p.sog / 1.852, fixTime: p.epoch * 1000}))
            ))
        } else {
            throw new Error('error status ' + response.status + ' ' + await response.text())
        }
    }
    return result.flat()
}

export async function load({request, platform}) {
    try {
        const traccar = (platform && platform.env.TRACCAR_SERVER) || import.meta.env.VITE_TRACCAR_SERVER
        const s = platform && platform.env.TRACCAR_SERVER_HTTPS ? 's' : ''
        const {searchParams} = new URL(request.url)
        const selected = searchParams.get('selected').split(',')
        return {events: await getEvents(selected, `http${s}://${traccar}`, searchParams, request)}
    } catch (e) {
        console.error('load', e.message, e)
        throw e
    }
}
const minMinutes = 2
function positionsFar(position1, position2) {
    return new Date(position2.fixTime).getTime() - new Date(position1.fixTime).getTime() > minMinutes * 60 * 1000
}

async function getSpeedEvents (deviceIds, data, threshold=0, minimumMinutes = 0, country='CL') {
    const chunk = 100
    const results = []
    for (const d of deviceIds) {
        const route = data
        let current
        for (let i = 0; i < route.length; i += chunk) {
            const result = await invokeValhalla(route, i, chunk, country, threshold, results)
            if (!result) continue
            const {
                matched_points,
                edges,
                shape
            } = result
            const shapePoints = decodePolyline(shape)
            console.log('matched points', matched_points.length)
            matched_points.forEach((mp, mIndex) => {
                const edge = edges[mp.edge_index]
                const position = route[mIndex + i]
                if (edge && (edge.speed_limit + (threshold || 0)) < position.speed * 1.852) {
                    if (!current ||
                        current.edges.slice(-1)[0].speed_limit !== edge.speed_limit ||
                        positionsFar(current.positions.slice(-1)[0], position)) {
                        current = {
                            shapes: [],
                            mPoints: [],
                            edges: [],
                            positions: []
                        }
                        results.push(current)
                    }
                    current.mPoints.push(mp)
                    current.positions.push(position)
                    if (!current.edges.find(e => e.id === edge.id)) {
                        current.edges.push(edge)
                        current.shapes.push(shapePoints.slice(edge.begin_shape_index, edge.end_shape_index+1))
                    }
                }
            })
        }
    }
    console.log('returning ', results.length)
    return results
}
let  countError = 0, countSuccess = 0
async function invokeValhalla (route, i, chunk, country, threshold, results, retry = 3) {
    const slice = route.slice(i, i + chunk)
    const url = `http://valhalla-${country}.pinme.io:8002/trace_attributes`
    const body = {
        costing: 'auto',
        shape_match: 'map_snap',
        shape: slice.map(p => ({
            lon: p.longitude,
            lat: p.latitude
        }))
    }
    console.log(url)
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
    })
    if (!response.ok) {
        const e = await response.json()
        if (e.error_code === 444 || e.error_code === 171) {
            console.warn(i, i+chunk, e)
            return
        }
        if (--retry) {
            console.error('retry', retry, e.message, (e.response && e.response.data) || url, 'deviceId',
                slice[0] && slice[0].deviceId, slice[0] && slice[0].address, slice[0] && slice[0].fixTime, country, 'chunk', chunk,
                'success', countSuccess, 'error', countError)
            return invokeValhalla(route, i, chunk, country, threshold, results, retry)
        } else {
            console.error('invoke valhalla error', e.message, url, 'deviceId',
                slice[0] && slice[0].deviceId, slice[0] && slice[0].address, slice[0] && slice[0].fixTime, country, 'chunk', chunk, 'success', countSuccess, 'error', countError)
        }
        countError++
    } else {
        countSuccess++
        return response.json()
    }
}


// This is adapted from the implementation in Project-OSRM
// https://github.com/DennisOSRM/Project-OSRM-Web/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
function decodePolyline(str, precision) {
    let index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 6);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
}
