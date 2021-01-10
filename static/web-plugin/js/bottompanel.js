const ERROR_NO_SELECTION = 'Veuillez sélectionner la Frame de la pioche, ou le tapis des résultats.'
const minHeight = 45
const maxHeight = 200
const minWidth = 100
let currentHeight = minHeight

function help(){
   miro.board.ui.openModal('web-plugin/help.html', { width: 500, height: 550 })
}


function expandPanel(height, width) {
  if (height) {
    currentHeight = height
    currentWidth = width
  } else {
    currentHeight = currentHeight <= maxHeight ? maxHeight : currentHeight
  }

  miro.board.ui.resizeTo({
    height: currentHeight,
    width: width
  })
}

function menuDrawCard(widget) {
  let parent = document.querySelector('#draw_cards')
  let container = document.querySelector('#menu_draw_card')
  if (parent.classList.contains('icon-selected') && !widget) {
    parent.classList.remove('icon-selected')
    container.innerHTML = ''
    container.classList.add('d-none')
    expandPanel(minHeight, minWidth)
  } else {
    let btn = `
    <img id="add_deck" class="icon" src="svg/draw_cards/settings.svg" alt="Decks" title="Decks" onclick="openNewDeck()" />
    <img id="init_deck" class="icon" src="svg/draw_cards/init.svg" alt="Initialiser le deck" title="Initialiser le deck" onclick="btnMenuDraw('init')" />
    <img id="activer_pioche" class="icon" src="svg/draw_cards/active.svg" alt="Activer le deck" title="Activer le deck" onclick="btnMenuDraw('active')" />
    <img id="reset_deck" class="icon" src="svg/draw_cards/reset.svg" alt="Reconstruire le deck" title="Reconstruire le deck" onclick="btnMenuDraw('reset')" />
    `
    expandPanel(93, 175)
    parent.classList.add('icon-selected')
    container.classList.remove('d-none')
    container.insertAdjacentHTML('afterbegin', btn)
  }
}

async function checkWidgetDraw() {
  let state = true
  let widget = await miro.board.selection.get()
  if (widget.length === 0) {
    state = false
  } else if (widget.length > 1) {
    state = false
  } else if (widget.length === 1) {
    let deckWidgets = widget.filter(
    t => GetMetadata(t).type === "deck_id" || GetMetadata(t).type === "deck_res"
    )
    if (deckWidgets.length !== 1) {
      state = false
    }
  }
  return state
}

async function btnMenuDraw(action) {
  let state = await checkWidgetDraw()
  switch (state) {
    case false:
      miro.showErrorNotification(ERROR_NO_SELECTION)
      break;
    case true:
      let widget = await miro.board.selection.get()
      let id = widget[0].id
      if (action === 'active') {
        deckActive(id)
      } else if (action === 'reset') {
        deckReset(id)
      } else if (action === 'init') {
        deckInit(id)
      }
      break;
  }
}


function openNewDeck() {
  miro.board.ui.openModal('web-plugin/new_deck.html', {width: 500, height: 500})
}

async function bottomPanelDeck() {
  let container = document.querySelector('#btn_bp_container')
  let board = await miro.board.info.get()
  let owner = board.owner.id
  let currentUser = await miro.currentUser.getId()
  // Owner only
  if (owner === currentUser) {
    let btn = `<img id="draw_cards" class="icon" src="svg/bottom_panel/card-random.svg" alt="Tirage aléatoire" title="Tirage aléatoire" onclick="menuDrawCard()" />`
    container.insertAdjacentHTML('afterbegin', btn)
  }
}


miro.onReady(bottomPanelDeck)
