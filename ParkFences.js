// ParkFences.js By Willby. This is an OpenRCT2 Plugin.

var restore = false;

var downCoord = void 0;
var currentCoord = void 0;

function selectTheMap() { // Display Selection
    var left = Math.min(downCoord.x, currentCoord.x);
    var right = Math.max(downCoord.x, currentCoord.x);
    var top = Math.min(downCoord.y, currentCoord.y);
    var bottom = Math.max(downCoord.y, currentCoord.y);
    ui.tileSelection.range = {
        leftTop: { x: left, y: top },
        rightBottom: { x: right, y: bottom }
    };
}

function get_surface_ownership(xsurget,ysurget) {
  var tile = map.getTile(xsurget, ysurget);
  for (var i = 0; i < tile.numElements; i++) {
    var element = tile.getElement(i);
    if (element.type=="surface") {
      return element.hasOwnership;
    }
  }
}

function finishSelection() { // Modify tiles in the selected area once the mouseUp has activated
  var left = Math.floor(Math.min(downCoord.x, currentCoord.x) / 32);
  var right = Math.floor(Math.max(downCoord.x, currentCoord.x) / 32);
  var top = Math.floor(Math.min(downCoord.y, currentCoord.y) / 32);
  var bottom = Math.floor(Math.max(downCoord.y, currentCoord.y) / 32);


  for (var x = left; x <= right; x++) {
    for (var y = top; y <= bottom; y++) {
      var tile = map.getTile(x, y);

      for (var i = 0; i < tile.numElements; i++) {
        var element = tile.getElement(i);

        if (element.type=="surface") { // Only do surfaces because surfaces are all I care about in this plugin
          if (restore) {
            if (element.hasOwnership==false) { // I also only care if the tile is outside the park
              up_own = get_surface_ownership(x,y+1)
              down_own = get_surface_ownership(x,y-1)
              right_own = get_surface_ownership(x+1,y)
              left_own = get_surface_ownership(x-1,y)
              if (up_own+down_own+right_own+left_own!=0) { // Exclude tiles that will not have any fences at all
                element.parkFences = get_tile_fence(up_own,right_own,down_own,left_own);
              }
            }
          } else {
            element.parkFences = 0; // This is so much easier than the restore method, *pain sounds*
          }
        }
      }
    }
  }
}

function get_tile_fence(u_o,r_o,d_o,l_o) { // This system uses the binary addition of the fences with the order being: up, right, down, left and it gets the 4 neighbour tiles to the current's ownership value
  if (u_o==1&&d_o+r_o+l_o==0) { return 1;         // U - up only
  } else if (r_o==1&&u_o+l_o+d_o==0) { return 2;  // R - right only
  } else if (u_o+r_o==2&&l_o+d_o==0) { return 3;  // UR - up and right
  } else if (d_o==1&&u_o+r_o+l_o==0) { return 4;  // D - down only
  } else if (u_o+d_o==2&&r_o+l_o==0) { return 5;  // UD - up and down
  } else if (r_o+d_o==2&&u_o+l_o==0) { return 6;  // RD - right and down
  } else if (u_o+r_o+d_o==3&&l_o==0) { return 7;  // URD - up and right and down
  } else if (l_o==1&&u_o+r_o+d_o==0) { return 8;  // L - left only
  } else if (u_o+l_o==2&&r_o+d_o==0) { return 9;  // UL - up and left
  } else if (r_o+l_o==2&&u_o+d_o==0) { return 10; // RL - right and left
  } else if (u_o+r_o+l_o==3&&d_o==0) { return 11; // URL - up and right and left
  } else if (d_o+l_o==2&&u_o+r_o==0) { return 12; // DL - down and left
  } else if (u_o+d_o+l_o==3&&r_o==0) { return 13; // UDL - up and down and left
  } else if (r_o+d_o+l_o==3&&u_o==0) { return 14; // RDL - right and down and left
  } else if (l_o+u_o+r_o+d_o==4) { return 15;     // URDL - up and right and down and left
  }
  return 0;
}

function restore_all() {
  for (var y = 0; y < map.size.y; y++) {
    for (var x = 0; x < map.size.x; x++) {
      var tile = map.getTile(x, y);
      for (var i = 0; i < tile.numElements; i++) {
        var element = tile.getElement(i);
        if (element.type=="surface"&&element.hasOwnership==false) {
          up_own = get_surface_ownership(x,y+1)
          down_own = get_surface_ownership(x,y-1)
          right_own = get_surface_ownership(x+1,y)
          left_own = get_surface_ownership(x-1,y)
          if (up_own+down_own+right_own+left_own!=0) { // Exclude tiles with no owned land near by
            element.parkFences = get_tile_fence(up_own,right_own,down_own,left_own);
          }
        }
      }
    }
  }
}

function remove_all() {
  for (var y = 0; y < map.size.y; y++) {
    for (var x = 0; x < map.size.x; x++) {
      var tile = map.getTile(x, y);
      for (var i = 0; i < tile.numElements; i++) {
        var element = tile.getElement(i);
        if (element.type=="surface") {
          element.parkFences = 0;
        }
      }
    }
  }
}

function pf_window() {
  window = ui.openWindow({
      classification: 'park',
      title: "Park Fence Manager",
      colours: [3,4],
      width: 250,
      height: 95,
      x: 20,
      y: 50,
      widgets: [{
          type: 'label',
          name: 'label-description',
          x: 3,
          y: 20,
          width: 300,
          height: 60,
          text: "Affect the entire park or a selected area."
      },{
          type: 'groupbox',
          name: 'all-box',
          x: 5,
          y: 30,
          width: 240,
          height: 30
      },{
          type: 'groupbox',
          name: 'select-box',
          x: 5,
          y: 60,
          width: 240,
          height: 30
      },{
          type: 'label',
          name: 'label-description',
          x: 10,
          y: 72,
          width: 300,
          height: 60,
          text: "Restore:"
      },{
          type: "checkbox",
          x: 65,
          y: 70,
          width: 50,
          height: 15,
          isChecked: restore,
          name: "restore-remove-toggle",
          text: "",
          onChange: function onChange(e) {
              restore = e;
          }
      },{
          type: "button",
          x: 128,
          y: 70,
          width: 110,
          height: 15,
          name: "select-area-button",
          text: "Select Area",
          onClick: function onChange(e) {
              activate_tool()
          }
      },{
          type: "button",
          x: 10,
          y: 40,
          width: 110,
          height: 15,
          name: "remove-all-button",
          text: "Remove All",
          onClick: function onChange(e) {
              remove_all()
          }
      },{
          type: "button",
          x: 128,
          y: 40,
          width: 110,
          height: 15,
          name: "restore-all-button",
          text: "Restore All",
          onClick: function onChange(e) {
              restore_all()
          }
      },],
      onClose: function onClose() { // Stop selection tool when the window closes
        window = null;
        if (ui.tool && ui.tool.id == "park-fences-tool") {
          ui.tool.cancel();
        }
      }
  });
}

function activate_tool() {
  ui.activateTool({ // Create tool for selecting area
      id: "park-fences-tool",
      cursor: "cross_hair",
      onStart: function onStart(e) {
          ui.mainViewport.visibilityFlags |= 1 << 7;
      },
      onDown: function onDown(e) {
          if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
              return;
          }
          downCoord = e.mapCoords;
          currentCoord = e.mapCoords;
      },
      onMove: function onMove(e) {
          if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
              return;
          }
          if (e.isDown) {
              currentCoord = e.mapCoords;
              selectTheMap();
          } else {
              downCoord = e.mapCoords;
              currentCoord = e.mapCoords;
              selectTheMap();
          }
      },
      onUp: function onUp(e) {
          finishSelection();
          ui.tileSelection.range = null;
      },
      onFinish: function onFinish() {
          ui.tileSelection.range = null;
          ui.mainViewport.visibilityFlags &= ~(1 << 7);
          if (window != null) window.close();
      }
  });
}


function main() {
  ui.registerMenuItem("Park Fence Manager", function() {
    pf_window()
  });
}

registerPlugin({
    name: 'Park Fence Manager',
    version: '1.0',
    licence: 'MIT',
    authors: ['Willby'],
    type: 'local',
    main: main
});
