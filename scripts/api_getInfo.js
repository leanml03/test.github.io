//Const, Variables used to get the data, flags or storage data.
let offset = 0; //Current position in scroll
const limit = 20; //Limit of number Pokemon to show
let isLoading = false; //State of Loading (flag)

// Function to load more pokemon after the limit (20) when we are scrolling.
async function loadMorePokemon() {
  //Not load if the system is loading
  if (isLoading) {
    return;
  }
  isLoading = true;
  //Connection with the API (PokeAPI)
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const data = await response.json(); //Storage the data in JSON format.
    const pokemonList = document.getElementById('pokemon-list');
    data.results.forEach(async (pokemon) => {
      const pokemonData = await fetchPokemonData(pokemon.url); //Get the single pokemon data URL
      const pokemonButton = createPokemonButton(pokemonData); //Go to the Function to create the button
      pokemonList.appendChild(pokemonButton); //Add the button to the Nav
    });

    offset += limit; //Increase the limit
  } catch (error) {
    console.log('Error:', error);
  } finally {
    isLoading = false; //Set that the function is currently is not loading.
  }
}

// Detect the scroll and load more pokemons
function handleScroll() {
  const pokemonNav = document.getElementById('pokemon-nav'); //get the nav
  const scrollTop = pokemonNav.scrollTop;
  const scrollHeight = pokemonNav.scrollHeight;
  const clientHeight = pokemonNav.clientHeight;
  
  if (scrollTop + clientHeight >= scrollHeight - 100) { //Do the calcules to get the position of scroll
    loadMorePokemon();
  }
}

// Initial Data Load - The initial data is determined, the process of adding the first 20 pokemon to the Pokemon-List in the nav is started.
export async function loadPokemonData() {
  try {
    //Load elements from HTML
    const pokemonList = document.getElementById('pokemon-list'); 
    const spinner = document.getElementById('spinner');
    //Show the spinner meanwhile is loading
    spinner.style.display = 'block';

    //Do the connection with the API and set the limit (20)
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    const data = await response.json(); //Get the response and storage in the const

    pokemonList.innerHTML = '';// Clean the Pokemon List to set the new data.
    data.results.forEach(async (pokemon) => { //Here the route is made, the call to the fetchPokemonData is made to obtain the url of the Pokemon in particular, 
      const pokemonData = await fetchPokemonData(pokemon.url);
      const pokemonButton = createPokemonButton(pokemonData); //and then the function createPokemonButton is called so that it returns the button of the pokemon.
      pokemonList.appendChild(pokemonButton);
    });

    offset = limit; //Set the limit

    //Add the scroll event to the pokemon-nav (nav)
    const pokemonNav = document.getElementById('pokemon-nav');
    pokemonNav.addEventListener('scroll', handleScroll);
  } catch (error) {
    console.log('Error:', error);
  } finally {
    const spinner = document.getElementById('spinner'); 
    spinner.style.display = 'none';//Hide the spinner
  }
}

//We proceed to obtain the information of a specific pokemon.
async function fetchPokemonData(url) {
  const response = await fetch(url); //Do the fetch to the URL (It's the single pokemon URL)
  return response.json();//Return the single pokemon data.
}

//Alternative function to search for the requested Pokémon via Input. 
export async function searchPokemon(){
  /*Unlike the other method, all the pokemon are loaded here, but only to search for the specific pokemon 
  among all the available ones.*/
  try{
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=898`);
    const data = await response.json();
    const searchInput = document.querySelector('.search_input'); // Search Input and button elements
    const searchButton = document.getElementById('btn-search');
    const pokemonListElement = document.getElementById('pokemon-list');
    searchInput.addEventListener('input', () => { // Event to get the current string in the input
      const searchTerm = searchInput.value.toLowerCase();
      if(searchTerm===''){
        pokemonListElement.innerHTML = ''; 
        loadPokemonData();
      }
      else{
        const matchedPokemons = data.results.filter(pokemon => pokemon.name.toLowerCase().startsWith(searchTerm));
        displaySearchResults(matchedPokemons);
      }

    });
  } catch{
    console.log("ERROR All Pokemon API Fetch");
  }
  
  
}
//The buttons of pokémon that meet the similarity filter with the input are added.
function displaySearchResults(pokemons) {
  const pokemonListElement = document.getElementById('pokemon-list');
  pokemonListElement.innerHTML = ''; // Clear the existing Pokémon list
  const pokemonPromises = pokemons.map(pokemon => {
    // Fetch data for each Pokemon using its URL
    return fetch(pokemon.url)
      .then(response => response.json())
      .then(pokemonData => createPokemonButton(pokemonData)); // Create Pokemon buttons based on fetched data
  });
  Promise.all(pokemonPromises)
  .then(pokemonButtons => {
    // Add each Pokemon button to the list element
    pokemonButtons.forEach(pokemonButton => {
      pokemonListElement.appendChild(pokemonButton);
    });
  })
  .catch(error => {
    console.log('Error:', error);
  });
    
}


let selectedButton = null; //The selected button is indicated as null to show the button that is pressed. If left inside the function it will mark all those selected.
// Function to create a Pokemon button element
function createPokemonButton(pokemonData) {
  const pokemonButton = document.createElement('button');
  const pokemonIcon = getPokemonIcon(pokemonData);
  const pokemonName = capitalizeFirstLetter(pokemonData.name);
  const pokemonNumber = getPokemonNumber(pokemonData);

  pokemonButton.classList.add('button-style');
  pokemonButton.addEventListener('click', () => {
    if (selectedButton) {
      selectedButton.classList.remove('clicked'); // Remove previous button's color
    }
    showPokemonInfo(pokemonData);
    pokemonButton.classList.add('clicked'); // Add color to the current button
    selectedButton = pokemonButton; // Update the selected button
  });

  pokemonButton.insertAdjacentHTML('beforeend', `<img src="${pokemonIcon}" class="pokemon-icon" alt="${pokemonName}">`);
  pokemonButton.insertAdjacentHTML('beforeend', `<span>${pokemonName}</span>`);
  pokemonButton.insertAdjacentHTML('beforeend', `<span class="pokemon-number">#${pokemonNumber}</span>`);

  return pokemonButton;
}

// Function to get the Pokemon icon URL
function getPokemonIcon(pokemonData) {
  const generation = 'viii'; // Generation VIII
  const iconKey = `generation-${generation}`;
  if (pokemonData.sprites.versions.hasOwnProperty(iconKey)) {
    return pokemonData.sprites.versions[iconKey].icons.front_default;
  } else {
    return '';
  }
}

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to get the Pokemon number
function getPokemonNumber(pokemonData) {
  return pokemonData.id.toString().padStart(3, '0');
}

// Function to display Pokémon information
function showPokemonInfo(pokemonData) {
  // Select necessary HTML elements
  const pokemonEvolutionElement = document.querySelector('.pokemon-evolution');
  const evolutionTitleElement = document.querySelector('.evolution-title');
  const pokemonDataElement = document.querySelector('.pokemon-data');
  const pokemonDetailsElement = document.querySelector('.pokemon-details');

  // Extract information from the pokemonData object
  const types = pokemonData.types.map(type => capitalizeFirstLetter(type.type.name)).join(' ');
  const weight = (pokemonData.weight / 10).toLocaleString();
  const height = (pokemonData.height / 10).toLocaleString();
  const species = capitalizeFirstLetter(pokemonData.species.name);

  // Fetch species data using the provided URL
  fetch(pokemonData.species.url)
    .then(response => response.json())
    .then(speciesData => {
      // Extract egg groups from speciesData
      const eggGroups = speciesData.egg_groups.map(group => capitalizeFirstLetter(group.name)).join(', ');

      // Fetch abilities data using Promise.all to fetch multiple URLs concurrently
      const abilitiesPromises = pokemonData.abilities.map(ability => fetch(ability.ability.url).then(response => response.json()));
      Promise.all(abilitiesPromises)
        .then(abilitiesData => {
          // Extract abilities from abilitiesData
          const abilities = abilitiesData.map(data => capitalizeFirstLetter(data.name)).join(', ');

          // Update HTML elements with Pokémon information
          pokemonDataElement.innerHTML = `
            <img src="${pokemonData.sprites.other['official-artwork'].front_default}" alt="${pokemonData.name}" class="pokemon-image">
            <h1>${capitalizeFirstLetter(pokemonData.name)}</h1>
            <p>${types}</p>
          `;
          pokemonDetailsElement.innerHTML = `
            <h2 style="font-weight: bold;">Information</h2>
            <p><strong>Weight:</strong> ${weight} kg</p>
            <p><strong>Height:</strong> ${height} cm's</p>
            <p><strong>Species:</strong> ${species}</p>
            <p><strong>Egg Groups:</strong> ${eggGroups}</p>
            <p><strong>Abilities:</strong> ${abilities}</p>
          `;

          // Fetch evolution chain data using the speciesData URL
          fetch(speciesData.evolution_chain.url)
            .then(response => response.json())
            .then(evolutionChainData => {
              // Generate the evolution chain HTML
              const evolutionChain = getEvolutionChain(evolutionChainData);

              // Update evolution title and element with the generated HTML
              evolutionTitleElement.innerHTML = `Evolution Chart`;
              pokemonEvolutionElement.innerHTML = `
                ${evolutionChain}
              `;
            })
            .catch(error => {
              console.log('Error:', error);
            });
        })
        .catch(error => {
          console.log('Error:', error);
        });
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

// Function to generate the evolution chain HTML
function getEvolutionChain(evolutionChainData) {
  const pokemonListElement = document.getElementById('pokemon-list');
  let evolutionChain = '';

  // Recursive function to process each evolution stage
  const processEvolution = (evolutionData) => {
    const pokemonName = capitalizeFirstLetter(evolutionData.species.name);
    const pokemonImageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolutionData.species.url.split('/').slice(-2, -1)}.png`;

    // Add HTML for the current evolution stage
    evolutionChain += `
      <div class="evolution-stage">
        <img src="${pokemonImageUrl}" alt="${pokemonName}" class="evolution-image">
        <p>${pokemonName}</p>
      </div>
    `;

    // Check if there are further evolutions
    if (evolutionData.evolves_to.length > 0) {
      evolutionChain += '<div class="evolution-arrow"></div>';

      // Process each further evolution
      evolutionData.evolves_to.forEach(evolution => {
        processEvolution(evolution);
      });
    }
  };

  // Start processing the evolution chain from the initial data
  processEvolution(evolutionChainData.chain);

  return evolutionChain;
}

