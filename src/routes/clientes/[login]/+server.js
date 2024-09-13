import {forwardRequest} from "$lib";

export const GET = event => forwardRequest(event);
export const POST = event => forwardRequest(event);
export const DELETE = event => forwardRequest(event);
