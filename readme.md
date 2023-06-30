# WIP

Looks like this atm and is able to expand:

![](./screenshot.png)

## notes

- It features 3 slots for putting content into (top row, bottom row, bottom left).
- The card isn't aware about the content - it makes no assumptions about what it is.
- It's just responsible for positioning it in the card: a row below the subtitle.
- It expands relative to the HTML element targetted via the "anchor" attribute.

## example

    <div>
      <chart-card id="myCard" anchor="anchorExpandedCard"> 
        <div slot="slotTop" style="height:50px; display:flex; justify-content: space-evenly; flex-grow:1;">
          <a>some content</a>
          <a>more content</a>
        </div>
      </chart-card>`
    </div>

    <div id="anchorExpandedCard"></div>
