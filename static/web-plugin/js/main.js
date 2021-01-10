let icon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height:24px;width:24px" fill="blue">
<path d="M94.09 57L33 209.7V327h174V217h-87c-23.75 0-41-23-41-49s17.25-49 41-49h50.7l-24.8-62zm272.01 0L305 209.7V489h174V209.7L417.9 57zm25.9 62c23.8 0 41 23 41 49s-17.2 49-41 49-41-23-41-49 17.2-49 41-49zm-272 18c-11.6 0-23 12.8-23 31s11.4 31 23 31h169.9l24.8-62zm272 0c-11.6 0-23 12.8-23 31s11.4 31 23 31 23-12.8 23-31-11.4-31-23-31zM33 345v144h254V345z"/>
</svg>
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

  console.log(unique)

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
