window.addEventListener("keydown", move);

const graviteSpeed = -9.81 / 10;
let graviteInterval; // Pour pouvoir animer les chutes dûes à la gravité

let jumpInterval;
const microJump = 100;

// en pourcent
const pas = 0.01;
const jump = 0.25;
const ordreDeGrandeurY = 0.003;
const ordreDeGrandeurX = 0.0001;


let isJumping = false;

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

window.onresize = newLength;

function newLength() {

    let posX = actualPositionXOfCharacter();
    let posY = actualPositionYOfCharacter();

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    document.getElementById("columnCharacter").style.left = `${posX * windowWidth}px`;
    document.getElementById("character").style.bottom = `${posY * windowHeight}px`;
}












// setTimeout(function,temps en ms);

// retourne l'espace en bas du personnage en %
function actualPositionYOfCharacter() {

    let charac = document.getElementById("character")

    // utilise window.etc car dans css et pas directement dans html ou js
    let characterYPosition = (parseFloat(window.getComputedStyle(charac).bottom) / windowHeight);


    // console.log("Perso Y ", characterYPosition);

    return characterYPosition
}

// retourne l'espace à gauche du personnage en %
function actualPositionXOfCharacter() {
    let charac = document.getElementById("columnCharacter");

    // passe la valeur en px à en % de la taille de la page
    let characterXPosition = (parseFloat(window.getComputedStyle(charac).left) / windowWidth);

    // console.log("Perso X ", characterXPosition);

    return characterXPosition
}

function blocSousPerso() {

    let characPosX = actualPositionXOfCharacter();

    let blocks = document.querySelectorAll('.block');

    let columnCharacter = document.getElementById("columnCharacter");
    // Longueur peronnage
    let columnCharacterWidth = parseFloat(window.getComputedStyle(columnCharacter).width);

    for (let block of blocks) {

        let dim = block.getBoundingClientRect();

        // debut et fin du bloc en X en %
        let start = dim.left / windowWidth;
        let end = dim.right / windowWidth;

        // console.log("Debut du bloc", start)
        // console.log("Perso", characPosX + (columnCharacterWidth / windowWidth))
        // console.log("Fin du bloc", end)


        // si le personnage n'est pas au dessus du bloc, on cherche le prochain bloc
        if (characPosX + (columnCharacterWidth / windowWidth) < start || characPosX > end) {
            continue;
        }

        return dim;
    }

    // sur le bas de l'écran
    return null;
}

function surUnBloc() {

    let bloc = blocSousPerso();

    // sur le bas de l'écran
    if (bloc == null) {
        return false;
    }

    let characPosY = actualPositionYOfCharacter();

    let blocHeight = bloc.height / windowHeight;

    if (characPosY + ordreDeGrandeurY >= blocHeight && characPosY - ordreDeGrandeurY <= blocHeight) {
        return true;
    }
}

function fall() {
    let character = document.getElementById("character");

    // utilise window.etc car dans css et pas directement dans html ou js
    let characterPosition = window.getComputedStyle(character).bottom;

    let newY = parseFloat(characterPosition) + graviteSpeed;

    if (newY < 0) {
        newY = 0;
    }

    document.getElementById("character").style.bottom = newY;
}

function gravite() {

    clearInterval(graviteInterval); // éviter de lancer plusieurs gravités en même temps

    graviteInterval = setInterval(() => {

        if (!surUnBloc() && actualPositionYOfCharacter() > 0) {
            fall();
        }
        else {
            clearInterval(graviteInterval);
            isJumping = false; // remet à zéro quand il retouche le sol
        }
    }, 5) // 50 ms

}

function sameBloc(b1, b2) {

    if (b1 == null || b2 == null) {
        return false;
    }

    return (b1.top === b2.top &&
        b1.bottom === b2.bottom &&
        b1.left === b2.left &&
        b1.right === b2.right &&
        b1.width === b2.width &&
        b1.height === b2.height);
}

function left() {

    // position du perso en X et Y en %
    let actualX = actualPositionXOfCharacter();
    let characYPos = actualPositionYOfCharacter();

    // position du perso potentiel apres un pas en %
    let newX = actualX - pas;

    // si le perso depasse pas le bord gauche de l'écran, on le colle au bord gauche de l'ecran
    if (newX < 0) {
        document.getElementById("columnCharacter").style.left = 0;
        return;
    }

    let blocks = document.querySelectorAll('.block');

    let actualBlocDim = blocSousPerso();

    for (let block of blocks) {

        let dim = block.getBoundingClientRect();

        // si le perso est en dehors d'un bloc ou si le bloc qu'on test est le meme bloc
        if (sameBloc(actualBlocDim, dim)) {
            continue;
        }

        // espace à droite du bloc en %
        let endOfBloc = dim.right / windowWidth;

        // si le bloc est sur le chemin du perso
        if (newX < endOfBloc && actualX >= endOfBloc) {

            // haut et bas du bloc en %
            let botOfBloc = (windowHeight - dim.bottom) / windowHeight;
            let topOfBloc = botOfBloc + dim.height / windowHeight;

            // si le perso se trouve entre le haut et la bas du bloc, on le colle au bloc en X
            if (characYPos >= botOfBloc && characYPos < topOfBloc) {
                newX = endOfBloc + ordreDeGrandeurX;

                document.getElementById("columnCharacter").style.left = `${newX * windowWidth}px`;
                return;
            }
        }
    }
    document.getElementById("columnCharacter").style.left = `${newX * windowWidth}px`;
}

function right() {

    // position du perso en X et Y en %
    let actualX = actualPositionXOfCharacter();
    let characYPos = actualPositionYOfCharacter();

    // Epaisseur du personnage en %
    let columnCharacter = document.getElementById("columnCharacter");
    let columnCharacterWidth = parseFloat(window.getComputedStyle(columnCharacter).width);

    // position du perso potentiel apres un pas en %
    let newX = actualX + pas;

    // si le perso depasse le bord droit de l'écran en prennant en compte sa largeur, on le colle au bord droit de la page
    if (newX > (windowWidth - columnCharacterWidth) / windowWidth) {
        document.getElementById("columnCharacter").style.left = `${windowWidth - columnCharacterWidth}px`;
        return;
    }

    let blocks = document.querySelectorAll('.block');

    let actualBlocDim = blocSousPerso();

    for (let block of blocks) {

        let dim = block.getBoundingClientRect();

        // si le perso est en dehors d'un bloc ou si le bloc qu'on test est le meme bloc
        if (sameBloc(actualBlocDim, dim)) {
            continue;
        }

        // espace à gauche du bloc en %
        let startOfBloc = dim.left / windowWidth;

        // si le bloc est sur le chemin du perso
        if (newX > startOfBloc - (columnCharacterWidth / windowWidth) && actualX <= startOfBloc) {

            // haut et bas du bloc en %
            let botOfBloc = (windowHeight - dim.bottom) / windowHeight;
            let topOfBloc = botOfBloc + dim.height / windowHeight;

            // si le perso se trouve entre le haut et la bas du bloc, on le colle au bloc en X
            if (characYPos >= botOfBloc && characYPos < topOfBloc) {
                newX = startOfBloc - (columnCharacterWidth / windowWidth) - ordreDeGrandeurX;

                document.getElementById("columnCharacter").style.left = `${newX * windowWidth}px`;
                return;
            }
        }
    }
    document.getElementById("columnCharacter").style.left = `${newX * windowWidth}px`;
}

// PROBLEME SI PERSO SAUTE SANS RIEN AU DESSUS MAIS BOUGE PENDANT LE SAUT POUR RENTRER DANS UN BLOC -> LE PERSO SAUTE DANS LE BLOC
function jumpUp() {

    // si le personnage est deja en train de sauter ou si il n'est pas sur un bloc, il ne peux pas sauter
    if ((isJumping || !surUnBloc()) && window.getComputedStyle(character).bottom != "0px") { return }

    clearInterval(jumpInterval);
    clearInterval(graviteInterval); // on coupe la gravité pendant la montée

    let microJumpHeight = jump / microJump;

    // hauteur max du saut en %
    let startY = parseFloat(window.getComputedStyle(character).bottom) / windowHeight;
    let maxY = startY + jump;

    let actualY = startY;

    if (maxY > 1) {
        maxY = 1;
    }

    let blocks = document.querySelectorAll('.block');

    let actualX = actualPositionXOfCharacter();

    // on verifie qu'il n'y a pas de bloc au dessus du perso qui peut lui bloquer son saut
    for (let block of blocks) {

        let dim = block.getBoundingClientRect();

        let startOfBloc = dim.left / windowWidth;
        let endOfBloc = dim.right / windowWidth;

        // si le personnage se trouve au niveau du bloc en X, on verifie que le bloc ne gene pas le saut
        if (actualX >= startOfBloc && actualX <= endOfBloc) {

            let botOfBloc = (windowHeight - dim.bottom) / windowHeight;
            let topOfBloc = botOfBloc + dim.height / windowHeight;

            // taille du perso en %
            let characterHeight = document.getElementById("character").height / windowHeight;

            // si le perso est censé se cogné, c'est e nouveau max du saut
            if (actualY + ordreDeGrandeurY < topOfBloc && botOfBloc < maxY + characterHeight) {
                maxY = botOfBloc - characterHeight;
            }
        }
    }

    jumpInterval = setInterval(() => {

        let newY = actualY + microJumpHeight;

        // Tant qu'on n’a pas atteint la hauteur max
        if (newY < maxY) {
            document.getElementById("character").style.bottom = `${newY * windowHeight}px`;
            actualY = newY;
        } else {
            document.getElementById("character").style.bottom = `${maxY * windowHeight}px`;
            // Arrêt du saut au sommet
            clearInterval(jumpInterval);
            gravite(); // redémarre la gravité naturelle
        }
    }, 5);

    isJumping = false;
}


// idée : le perso peut traverser les blocs d'une certaine couleur
function jumpDown() { }

function move(event) {

    switch (event.key) {
        case "ArrowLeft":
            left();
            break;
        case "ArrowRight":
            right();
            break;
        case "ArrowUp":
            jumpUp();
        default:
            return;
    }
    gravite();
}
