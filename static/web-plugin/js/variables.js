const APP_ID = ''

// ==============================================
//              Miro Tools
// ==============================================

const getWidget = (obj) => {
    return miro.board.widgets.get(obj)
}


function getAppWidget(obj) {
    return {
        metadata: {
            [APP_ID]: obj
        }
    }
}


function GetMetadata(widget) {
  let metadata = widget.metadata;

  if (!metadata) {
    metadata = {};
  }

  if (!metadata[APP_ID]) {
    metadata[APP_ID] = {};
  }

  return metadata[APP_ID];
}

async function viewport() {
    const viewport = await miro.board.viewport.get();
    const x = viewport.x + (viewport.width / 2);
    const y = viewport.y + (viewport.height / 2);
    const obj = {x: x, y: y}
    return obj
}

// ==============================================
//              Widgets
// ==============================================

async function copySticker(obj, x, y) {
  await miro.board.widgets.create({
    metadata: obj.metadata,
    plainText: obj.plainText,
    scale: obj.scale,
    style: obj.style,
    text: obj.text,
    type: obj.type,
    x: x,
    y: y
  })
}

async function copyShape(obj, x, y) {
  await miro.board.widgets.create({
    height: obj.height,
    width: obj.width,
    metadata: obj.metadata,
    plainText: obj.plainText,
    style: obj.style,
    text: obj.text,
    type: obj.type,
    x: x,
    y: y
  })
}

async function copyText(obj, x, y) {
  await miro.board.widgets.create({
    metadata: obj.metadata,
    plainText: obj.plainText,
    scale: obj.scale,
    width: obj.width,
    rotation: obj.rotation,
    style: obj.style,
    text: obj.text,
    type: obj.type,
    x: x,
    y: y
  })
}

async function copyCard(obj, x, y) {
  await miro.board.widgets.create({
    metadata: obj.metadata,
    card: obj.card,
    description: obj.description,
    scale: obj.scale,
    width: obj.width,
    rotation: obj.rotation,
    style: obj.style,
    title: obj.title,
    type: obj.type,
    x: x,
    y: y
  })
}


// ==============================================
//              Set Deck
// ==============================================




async function deckInit(id) {
    let deck = await getWidget({id: id})
    deck = deck[0]
    let deckId = deck.metadata[APP_ID].deck_id
    let deckFrame = await getWidget(getAppWidget({type: 'deck_id', deck_id: deckId}))
    let ids = deckFrame[0].childrenIds
    let metadata = deckFrame[0].metadata[APP_ID]
    metadata['deck_participants'] = ids.slice()
    metadata['deck_reset'] = ids.slice()
    await miro.board.widgets.update({
        id: deckFrame[0].id,
        title: deckFrame[0].title,
        metadata: {
        [APP_ID]:  metadata
        }
    })
    await miro.showNotification('La pioche a été initialisée.')
    // await miro.board.ui.closeModal()
}


async function deckActive(id) {
    let deck = await getWidget({id: id})
    deck = deck[0]
    let deckId = deck.metadata[APP_ID].deck_id
    let deckFrame = await getWidget(getAppWidget({type: 'deck_id', deck_id: deckId}))
    let deckBtn = await getWidget(getAppWidget({type: 'deck_btn', deck_id: deckId}))
    let metadata = deckFrame[0].metadata[APP_ID]
    let status
    if (metadata.available === false ) {
        await miro.board.widgets.update({
          id: deckBtn[0].id,
          text: '' + metadata.deck_name + ' : Tirage aléatoire'
        })
        metadata.available = true
        status = "Le bouton Tirage aléatoire est activé."
    } else {
        await miro.board.widgets.update({
          id: deckBtn[0].id,
          text: '' + metadata.deck_name + ' : Tirage aléatoire - Bouton inactif'
        })
        metadata.available = false
        status = "Le bouton Tirage aléatoire est désactivé."
    }

    await miro.board.widgets.update({
        id: deckFrame[0].id,
        title: deckFrame[0].title,
        metadata: {
            [APP_ID]: metadata
        }
    })

    await miro.showNotification(status)
}

async function deckReset(id) {
    let deck = await getWidget({id: id})
    deck = deck[0]
    let deckId = deck.metadata[APP_ID].deck_id
    let deckFrame = await getWidget(getAppWidget({type: 'deck_id', deck_id: deckId}))
    let metadata = deckFrame[0].metadata[APP_ID]
    metadata.deck_participants = metadata.deck_reset.slice()

    await miro.board.widgets.update({
        id: deckFrame[0].id,
        title: deckFrame[0].title,
        metadata: {
            [APP_ID]: metadata
        }
    })

    metadata.deck_participants.forEach(async card => {
        let widget = await getWidget({id: card})
        console.log(widget[0].id)
        await miro.board.widgets.transformDelta(
            {id: widget[0].id},
            deckFrame[0].x - widget[0].x,
            deckFrame[0].y - widget[0].y
        )
    })

    await miro.showNotification('La pioche est reconstruite.')
}
