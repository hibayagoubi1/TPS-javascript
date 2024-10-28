const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Simuler une attaque
function attack(attacker, defender, move) {
  const hitChance = Math.random() * 100;

  if (hitChance <= move.accuracy) {
    const damage = Math.floor(move.power * (0.85 + Math.random() * 0.15));
    defender.hp -= damage;
    move.pp -= 1; // Réduit les PP du mouvement

    console.log(
      `${attacker.pokemon.name} utilise ${move.name} ! Il inflige ${damage} dégâts.`
    );
  } else {
    console.log(`${attacker.pokemon.name} a raté son attaque !`);
  }
}

// Fonction pour demander au joueur de choisir un mouvement
function chooseMove(character) {
  return new Promise((resolve) => {
    console.log(`\nChoisissez un mouvement pour ${character.pokemon.name} :`);
    
    character.pokemon.moves.forEach((move, index) => {
      if (move.pp > 0) { // Affiche uniquement les mouvements disponibles
        console.log(`${index + 1}: ${move.name} (PP: ${move.pp}, Power: ${move.power}, Accuracy: ${move.accuracy})`);
      }
    });

    rl.question('Votre choix : ', (answer) => {
      const moveIndex = parseInt(answer) - 1;

      if (character.pokemon.moves[moveIndex] && character.pokemon.moves[moveIndex].pp > 0) {
        resolve(character.pokemon.moves[moveIndex]);
      } else {
        console.log('Ce mouvement n\'est plus disponible ou choix invalide !');
        resolve(chooseMove(character)); // Redemande le choix si le mouvement est épuisé ou invalide
      }
    });
  });
}

// Fonction pour choisir un mouvement pour le bot
function chooseBotMove(bot) {
  const availableMoves = bot.pokemon.moves.filter(move => move.pp > 0);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Logique principale du jeu
async function playGame() {
  player.hp = 300; // Initialisation des HP du joueur
  bot.hp = 300;    // Initialisation des HP du bot

  // Le joueur choisit un Pokémon
  player.pokemon = await getPokemon('pikachu'); // Changez le nom pour choisir un autre Pokémon
  bot.pokemon = await getPokemon('bulbasaur');  // Pokémon aléatoire pour le bot

  console.log(`\nLe Pokémon du joueur : ${player.pokemon.name}`);
  console.log(`Le Pokémon du bot : ${bot.pokemon.name}`);

  while (player.hp > 0 && bot.hp > 0) {
    // Tour du joueur
    const playerMove = await chooseMove(player);
    console.log(`Le joueur utilise le mouvement ${playerMove.name}`);
    attack(player, bot, playerMove);

    if (bot.hp <= 0) {
      console.log('Le bot a été vaincu ! Vous gagnez !');
      break;
    }

    // Tour du bot (choisit un mouvement automatiquement)
    const botMove = chooseBotMove(bot);
    console.log(`Le bot utilise le mouvement ${botMove.name}`);
    attack(bot, player, botMove);

    if (player.hp <= 0) {
      console.log('Le joueur a été vaincu ! Vous perdez !');
      break;
    }

    console.log(`\nHP du joueur : ${player.hp}`);
    console.log(`HP du bot : ${bot.hp}`);
  }

  rl.close();
}

// Fonction factice pour obtenir les données d'un Pokémon
const axios = require('axios');

async function getPokemon(pokemonName) {
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    const pokemonData = response.data;

    const moves = pokemonData.moves.slice(0, 4).map((moveEntry) => {
      return {
        name: moveEntry.move.name,
        power: moveEntry.power || 50,
        accuracy: moveEntry.accuracy || 100,
        pp: moveEntry.pp || 10,
      };
    });

    return {
      name: pokemonData.name,
      moves,
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des données de ${pokemonName}:`, error);
    return null;
  }
}

// Initialisation du joueur et du bot
const player = { pokemon: null, hp: 0 };
const bot = { pokemon: null, hp: 0 };

// Lancement du jeu
playGame();
