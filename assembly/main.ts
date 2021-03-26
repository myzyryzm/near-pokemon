/** @format */

import { context, base64, math } from 'near-sdk-as'
import { Pokemon, pokemonMap, SerializedPokemon } from './models'
import {
    addPokemon,
    deleteFromOrderedPokemonList,
    getAllPokemonIds,
    getPokemonIdsForOwner,
    randomPokemonType,
    removePokemonFromOwner,
    pokemonById
} from './helpers'

/*******************/
/* CHANGE METHODS */
/*****************/

/**
 * Creates a pokemon with a specified nickname and assigns its owner as the transaction sender.
 * @param nickname
 */
export function createPokemon(nickname: string): SerializedPokemon {
    const id = base64.encode(math.randomBuffer(16))
    const pokemon = new Pokemon(id, nickname, randomPokemonType())
    addPokemon(pokemon, context.sender, true)
    return pokemon.serialized
}

/**
 * Deletes a pokemon with a specified id.
 * @param id
 */
export function deletePokemon(id: string): void {
    const pokemon = pokemonById(id)
    assert(
        pokemon.owner == context.sender,
        'This pokemon does not belong to ' + context.sender
    )
    removePokemonFromOwner(pokemon.owner, id)
    deleteFromOrderedPokemonList(id)
    pokemonMap.delete(base64.decode(id))
}

/**
 * Transfers a pokemon with specified id from the sender to a newOwner.
 * @param newOwner
 * @param id
 */
export function transferPokemon(newOwner: string, id: string): void {
    const pokemon = pokemonById(id)
    assert(
        pokemon.owner == context.sender,
        'This pokemon does not belong to ' + context.sender
    )
    removePokemonFromOwner(pokemon.owner, id)
    pokemon.owner = newOwner
    addPokemon(pokemon, newOwner, false)
}

/**
 * Heals a pokemon with a specified id to full health.
 * @param id
 */
export function healPokemon(id: string): void {
    const pokemon = pokemonById(id)
    assert(
        pokemon.owner == context.sender,
        'This pokemon does not belong to ' + context.sender
    )
    pokemon.heal()
    pokemonMap.set(base64.decode(pokemon.id), pokemon)
}

/**
 *
 */
export function trainPokemon(id: string) {}

/*****************/
/* VIEW METHODS */
/****************/

/**
 * Gets the list of pokemon for a specified account.
 * @param owner
 * @returns
 */
export function getPokemonByOwner(owner: string): SerializedPokemon[] {
    const pokemonIds = getPokemonIdsForOwner(owner)
    let pokemonList = new Array<SerializedPokemon>()
    for (let i = 0; i < pokemonIds.length; i++) {
        const id = base64.decode(pokemonIds[i])
        if (pokemonMap.contains(id)) {
            pokemonList.push(pokemonMap.getSome(id).serialized)
        }
    }
    return pokemonList
}

/**
 * Gets a pokemon by a specified id.
 * @param id
 * @returns
 */
export function getPokemonById(id: string): SerializedPokemon {
    return pokemonMap.getSome(base64.decode(id)).serialized
}

/**
 * Gets all pokemon.
 * @returns
 */
export function getAllPokemon(): SerializedPokemon[] {
    const allPokemonIds = getAllPokemonIds().reverse()
    const numberOfPokemon = allPokemonIds.length
    const result = new Array<SerializedPokemon>(numberOfPokemon)
    for (let i = 0; i < numberOfPokemon; i++) {
        result[i] = pokemonById(allPokemonIds[i]).serialized
    }
    return result
}
