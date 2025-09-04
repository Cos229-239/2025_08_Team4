import { Client, Account, Databases, ID, Query, Permission, Role } from 'react-native-appwrite'

export const client = new Client()
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject('68af0f44001152b15bfb')
    .setPlatform('dev.lucidpaths');

export const account = new Account(client)
export const databases = new Databases(client)

export { ID, Query, Permission, Role };