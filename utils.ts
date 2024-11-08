import { ObjectId } from "mongodb";
import { person, personModel } from "./types.ts"
import { Collection } from "mongodb";

export const fromModeltoPerson = async(model: personModel, collection: Collection<personModel>):Promise<person> => {
    const friendsDB = await Promise.all((model.friends.map((f) => fromIdtoPerson(f,collection))));

    return {
        id: model.id,
        name: model.name,
        email: model.email,
        number: model.number,
        friends: friendsDB
    }
}

export const fromIdtoPerson = async(id: ObjectId, collection: Collection<personModel>) => {
    const person = await collection.find(id).toArray();

    return person;
}