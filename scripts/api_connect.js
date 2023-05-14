import { loadPokemonData, searchPokemon } from './api_getInfo.js';

//Code Modules
function connectAPI() {
    loadPokemonData(); //Module dedicated to export all the information to the HTML. Uses another functions to get the results.
    searchPokemon(); //Module dedicated to search the Pokemon with the input text
}
connectAPI(); //Function Call
export{connectAPI}; //Export the module function


