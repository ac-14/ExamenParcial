import { MongoClient } from 'mongodb';
import { fromIdtoPerson, fromModeltoPerson } from "./utils.ts";
import { ObjectId } from "mongodb";

// Connection URL
const MONGO_URL = Deno.env.get("MONGO_URL");
if(!MONGO_URL){
  console.log("URL NOT STABLISHED")
  Deno.exit(1);
}
const client = new MongoClient(MONGO_URL);
const dbName = 'ExamenParcial';
await client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const collection = db.collection('persons');

const handler = async(req:Request):Promise<Response> => {
  const url = new URL(req.url);
  const method = req.method;
  const path = url.pathname;

  if(method === "GET"){
    if(path === "/personas"){
      const personsDB = await collection.find().toArray();
      const persons = await Promise.all(personsDB.map((p)=> fromModeltoPerson(p,collection)));
      return new Response(JSON.stringify(persons));
    } else if(path === "/persona"){
      const email = url.searchParams.get("email");
      if(email){
        const personDB = await collection.findOne({email});
        return new Response(personDB);
      } else{
        return new Response("Person not found", {status: 404})
      }

    }
  } else if(method === "PUT"){
    if(path === "/persona"){
      const person = await req.json();

      if(!person.email || !person.nombre || !person.telefono || !person.amigos){
        return new Response("faltan datos", {status:200})
      }

      const personEmail = await collection.findOne({email: person.email});

      if(!personEmail){
        return new Response("Usuario no encontrado", {status: 404})
      }

      await collection.updateOne(
        {email: person.email},
        {$set : {name: person.nombre, number: person.telefono, friends: person.friends}}
      )
    } else if(path === "/persona/amigo"){
      const person = await req.json();

      await collection.updateOne(
        {email : person.email},
        {$addtoSet: {$each: person.friends}}
      )

      return new Response("Amigo creado exitosamente", {status:200});
    }

  } else if(method === "POST"){
    if(path === "/personas"){
      const person = await req.json();

      const personNumber = await collection.findOne({number: person.telefono});
      const personMail = await collection.findOne({email: person.email});

      if(!personNumber && !personMail){
        const {insertedId} = await collection.insertOne({
          name: person.name,
          email: person.email,
          number: person.number,
          friends: person.friends
        });

        return new Response(JSON.stringify({
          id: insertedId,
          name: person.nombre,
          email: person.email,
          number: person.telefono,
          friends: person.amigos.map((f:ObjectId) => fromIdtoPerson(f,collection))
        }), {status: 201})
      }

      return new Response("El email o teléfono ya están registrados.", {status: 400});

    }
  } else if(method=== "DELETE"){
    if(path=== "/persona"){
    const email = await req.json();
    const user = await collection.findOne({email: email.email});
    if(!email.email){
      return new Response("Falta email.", {status: 400})
    }

    if(!user){
      return new Response("Usuario no encontrado.", {status: 404});
    }

    const {deletedCount}= await collection.deleteOne({email: email.email});

    if(deletedCount){
      return new Response("Persona eliminada exitosamente.", {status:200});
    }
  }
}

  return new Response("endpoint not found");
}

Deno.serve({port:3000},handler);

