import { Client, Account, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject('68af0f44001152b15bfb');   // Your project ID

export const account = new Account(client);
export { ID };