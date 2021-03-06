let icon = `
<path d="M19.76,26l-6.17-2.87a.81.81,0,0,1-.39-1.08l4.36-9.38a.81.81,0,0,1,1.08-.4l6.16,2.87a.81.81,0,0,1,.4,1.08l-4.36,9.38a.81.81,0,0,1-1.08.4ZM4.88,25,.79,15.48a.81.81,0,0,1,.43-1.07l2-.87,2.53,9.51a1.71,1.71,0,0,0,2.09,1.21l2-.54L6,25.41A.81.81,0,0,1,4.88,25Zm1.75-2.17L4,12.82a.83.83,0,0,1,.58-1l1.76-.47L6.1,12.93a1.71,1.71,0,0,0,1.46,1.92l4.13.55L10,21.06a1.69,1.69,0,0,0,.35,1.61l-2.73.73a.82.82,0,0,1-1-.58Zm5.61-.24-.83-.25a.82.82,0,0,1-.55-1l2.94-9.92a.83.83,0,0,1,1-.55l2.54.76h0a1.67,1.67,0,0,0-.61.7l-4.36,9.39a1.62,1.62,0,0,0-.15.89Zm-.3-8L7.68,14a.82.82,0,0,1-.7-.92L8.36,2.79a.82.82,0,0,1,.92-.7L16,3a.81.81,0,0,1,.69.92l-.85,6.31L15.07,10A1.71,1.71,0,0,0,13,11.14l-1,3.4Zm-.27-1.63a1,1,0,0,0,.24-1.45,1.13,1.13,0,0,0-.76-.42,1.19,1.19,0,0,0-.86.15,1,1,0,0,0-.45.67.94.94,0,0,0,.21.78,1.21,1.21,0,0,0,.76.43A1.18,1.18,0,0,0,11.67,12.91ZM13,8.71a7.35,7.35,0,0,0,.65-.42,2.4,2.4,0,0,0,.5-.45,2.28,2.28,0,0,0,.34-.53,2.13,2.13,0,0,0,.2-.66,2.28,2.28,0,0,0,0-1.05,2,2,0,0,0-.46-.79,2.51,2.51,0,0,0-.79-.54,4.81,4.81,0,0,0-2.22-.35,4.08,4.08,0,0,0-1.11.25L9.79,6a3.52,3.52,0,0,1,1.08-.44,2.58,2.58,0,0,1,1,0,1,1,0,0,1,.45,1.76,6.35,6.35,0,0,1-.82.58,2.26,2.26,0,0,0-1.16,2.34l1.61.26c-.37-.91.61-1.52,1-1.78Z" transform="translate(-0.72 -2.08)"/>
` 


miro.onReady(() => {
  miro.addListener(miro.enums.event.SELECTION_UPDATED, getWidget2)
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: "la caisse à outils",
        svgIcon: icon,
        positionPriority: 1,
        onClick: async () => {
          const authorized = await miro.isAuthorized();
          if (authorized) {
            openPanel();
          } else {
            miro.board.ui.openModal("web-plugin/not-authorized.html").then(res => {
              if (res === "success") {
                openPanel();
              }
            });
          }
        }
      }
    }
  });
});

function openPanel() {
  miro.board.ui.openBottomPanel("web-plugin/bottompanel.html", {
    width: 100,
    height: 51
  })
}

async function getWidget2() {
  let widgets = await miro.board.selection.get();

  if (widgets.length === 0) {
    return;
  }

  let deckWidgets = widgets.filter(
    t => GetMetadata(t).type === "deck_btn"
  )


  if (deckWidgets.length > 0) {
    let frame = await getWidget(getAppWidget({type: 'deck_id', deck_id: deckWidgets[0].metadata[APP_ID].deck_id, available: true}))
    if (frame.length > 0) {
      drawBtn(deckWidgets[0])
    }
  }

}

async function drawBtn(deck) {
  let deckId = deck.metadata[APP_ID].deck_id
  let deckFrame = await getWidget(getAppWidget({type: 'deck_id', deck_id: deckId}))
  let deckRes = await getWidget(getAppWidget({type: 'deck_res', deck_id: deckId}))

  let widgets = []
  
  let frameMetadata = deckFrame[0].metadata[APP_ID]
  let unique = frameMetadata.unique
  let ids = deckFrame[0].metadata[APP_ID].deck_participants

  if (ids.length === 0) {
    await miro.showNotification('Le Deck est vide !')
  } else {


    let allWidgets = await miro.board.widgets.get()
    widgets = allWidgets.filter(w => ids.indexOf(w.id) != -1);
    

    let participants = []
    let groupIds = []

    for (let id in widgets) {
      let widget = widgets[id]

      if (widget.groupId) {
        if(groupIds.indexOf(widget.groupId) == -1) {
          participants.push(widget)
          groupIds.push(widget.groupId)
        }
      } else {
        participants.push(widget)
      }
    }

    let jet = Math.floor(Math.random() * Math.floor(participants.length))
    ids = {}
    let bound

    if (participants[jet].groupId) {
      let groupId = participants[jet].groupId;
      let gd = await miro.board.widgets.get({ groupId: groupId });
      ids = gd.map(w => w.id);
      let bounds = gd.map(w => ({ bounds: w.bounds }));
      bound = await miro.board.utils.unionWidgetBounds(bounds);
    } else {
      ids = { id: participants[jet].id };
      bound = participants[jet].bounds;
    }

    miro.showNotification('' + (jet+1) + ' / ' + participants.length)

    if (unique === true) {
      await miro.board.widgets.bringForward(ids)

      await miro.board.widgets.transformDelta(
        ids,
        deckRes[0].x - bound.x,
        deckRes[0].y - bound.y
      )

      let imgIndex = frameMetadata.deck_participants.indexOf(ids.id)
      frameMetadata.deck_participants.splice(imgIndex, 1)
      
      await miro.board.widgets.update({
        id: deckFrame[0].id,
        title: deckFrame[0].title,
        metadata: {
          [APP_ID]:  frameMetadata
        }
      })
    } else {
      await miro.board.widgets.bringForward(ids)
      let obj = await miro.board.widgets.get({id: ids.id})
      switch (obj[0].type) {
        case 'STICKER':
          await copySticker(obj[0], deckRes[0].x, deckRes[0].y)
          break
        case 'SHAPE':
          await copyShape(obj[0], deckRes[0].x, deckRes[0].y)
          break
        case 'TEXT':
          await copyText(obj[0], deckRes[0].x, deckRes[0].y)
          break
        case 'CARD':
          await copyCard(obj[0], deckRes[0].x, deckRes[0].y)
          break
        case 'IMAGE':
          miro.showErrorNotification('Les images ne sont pas supportées.')
          break
      }
      
    }
    await miro.board.selection.clear()
  }

}
