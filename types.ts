import { ObjectId, OptionalId } from "mongodb";

export type personModel = {
    id: ObjectId,
    name: string,
    email: string,
    number: number,
    friends: ObjectId[]
}

export type person = {
    id: string,
    name: string,
    email:string,
    number: number,
    friends: person[]
}

export type friend = {
    id: string,
    name: string,
    email: string,
    number: string
}