async function deckList() {
    let decks = await getWidget(getAppWidget({type: 'deck_id'}))
    let container = document.querySelector('#deck_list')
    if (decks.length > 0) {
        decks.forEach(deck => {
            let status = 'Activer'
            if (deck.metadata[APP_ID].available) {
                status = 'Désactiver'
            }
            let reset = ''
            if (deck.metadata[APP_ID].deck_reset.length > 0) {
                reset = `<a href="#" onclick="deckReset('${deck.id}')">Reconstruire la pioche</a> <small class="text-italic text-muted">Réintègre les cartes piochées, dans la pioche.</small><br /><br />`
            }
            container.innerHTML += `
            <div class="d-block w-100 py-2">
                <h5 class="d-inline">${deck.metadata[APP_ID].deck_name}</h5> 
                <a class="ml-3" data-toggle="collapse" href="#settingsDeck${deck.metadata[APP_ID].deck_id}" aria-expanded="false" aria-controls="settingsDeck${deck.metadata[APP_ID].deck_id}">
                     Configuration <i class="fas fa-sort-down"></i>
                </a>
                <div class="collapse mt-2" id="settingsDeck${deck.metadata[APP_ID].deck_id}">
                    <a href="#" onclick="deckActive('${deck.id}')">${status} la pioche</a> <small class="text-italic text-muted">Active / Désactive le bouton de pioche.</small><br />
                    ${reset}
                    <a href="#" onclick="deckInit('${deck.id}')">Initialisation de la pioche</a> <small class="text-italic text-muted">Crée la base de données de la pioche, à partir des objets dans la Frame.</small><br />
                    <small class="text-danger">Attention, si vous aviez déjà initialisé la pioche, l'ancienne base de données sera perdue, remplacée par les nouveaux objets de la Frame.</small><br />
                </div>
            </div>
            `
        })
    }
}

async function newDeck(e) {
    e.preventDefault()
    const deck_name = document.querySelector('#new_deck_name').value
    const tirageUnique = document.querySelector('#tirageUniqueOui').checked
    const pos = await viewport()

    const getAllDecks = await getWidget(getAppWidget({type: 'deck_id'}))
    let deckId, metaId
    let deckArr = []
    if (getAllDecks.length === 0) {
        deckId = 1
    } else {
        getAllDecks.forEach(obj => {
        metaId = obj.metadata[APP_ID].deck_id
        deckArr.push(metaId)
        })
        deckArr.sort((a, b) => b - a)
        deckId = deckArr[0] + 1
    }

    const deckWidget = await miro.board.widgets.create({
        type: 'FRAME',
        title: 'Deck : ' + deck_name,
        x: pos.x,
        y: pos.y,
        width: 895,
        height: 1015,
        style: {
          backgroundColor: "#efc98a"
        },
        metadata: {
            [APP_ID]: {
            type: 'deck_id',
            deck_id: deckId,
            deck_name: deck_name,
            available: false,
            unique: tirageUnique,
            deck_participants: [],
            deck_reset: []
            }
        }
    })

    const deckBtnWidget = await miro.board.widgets.create({
        type: 'shape',
        text: '' + deck_name + ' : Tirage aléatoire - Bouton inactif',
        x: deckWidget[0].x + deckWidget[0].width / 2 + 555 / 2  + 10,
        y: deckWidget[0].y - deckWidget[0].height / 2 + 120 / 2 + 10,
        width: 555,
        height: 120,
        style: {
            backgroundColor: "#efc98a",
            backgroundOpacity: 1,
            bold: 0,
            borderColor: "#c8a008",
            borderOpacity: 1,
            borderStyle: 2,
            borderWidth: 12,
            fontFamily: 0,
            fontSize: 36,
            highlighting: "",
            italic: 0,
            shapeType: 7,
            strike: 0,
            textAlign: "c",
            textAlignVertical: "m",
            textColor: "#a70e14",
            underline: 0
        },
        metadata: {
        [APP_ID]: {
            type: 'deck_btn',
            deck_id: deckId,
            deck_name: deck_name
        }
        }
    })

    const deckResWidget = await miro.board.widgets.create({
        type: 'shape',
        text: '<p>' + deck_name + '</p><p>Zone Résultat</p>',
        x: deckBtnWidget[0].x + deckBtnWidget[0].width / 2 + 320 / 2 + 10,
        y: deckBtnWidget[0].y - deckBtnWidget[0].height / 2 + 510 / 2,
        width: 320,
        height: 510,
        style: {
            backgroundColor: "#efc98a",
            backgroundOpacity: 1,
            bold: 0,
            borderColor: "transparent",
            borderOpacity: 1,
            borderStyle: 2,
            borderWidth: 12,
            fontFamily: 0,
            fontSize: 36,
            highlighting: 0,
            italic: 0,
            shapeType: 3,
            strike: 0,
            textAlign: "c",
            textAlignVertical: "m",
            textColor: "#a70e14",
            underline: 0
        },
        metadata: {
        [APP_ID]: {
            type: 'deck_res',
            deck_id: deckId,
            deck_name: deck_name
        }
        }
    })

    const deckSticker = await miro.board.widgets.create({
        type: "STICKER",
        style: {
            stickerBackgroundColor: "#fff9b1",
            fontSize: 10,
            fontFamily: 10,
            textAlign: "l",
            textAlignVertical: "m",
            stickerType: 0
        },
        x: deckWidget[0].x - deckWidget[0].width / 2 - 420 / 2  - 10,
        y: deckWidget[0].y - deckWidget[0].height / 2 + 481 / 2 + 10,
        scale: 2,
        text: "<p>Le mode d'emploi est disponible dans le panel en bas, via le bouton \"? encerclé\".</p><p>Section :</p><p>Tirage aléatoire</p>",
        
    })

      await miro.board.ui.closeModal()

}

miro.onReady(deckList)
