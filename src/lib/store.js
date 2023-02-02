import { writable } from 'svelte/store';

export const invoiceStatus = writable('initial');
export const invoice = writable({});

export const chatAdapter = writable(null);
export const chatData = writable({ events: [], profiles: {}});
export const selectedMessage = writable(null);