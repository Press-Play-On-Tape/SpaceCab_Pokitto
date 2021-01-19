var activeTile = 0;
var name = "";
var levelWidth = 16;
var levelHeight = 11;
var fuel = 200;
var faresRequired = 1;
var gateInterval = 150;
var levelData = new Uint8Array(60*60);
var showGrid = false;
var hasErrors = true;
var playerX = 1;
var playerY = 1;
var signCount = 0;
let tilesImage = document.getElementById("tiles");
let view = document.getElementById("view");
let content = document.getElementById("content");

const TILE_EMPTY = 0x0;
const TILE_PLAT1 = 0x1;
const TILE_EDGE1 = 0x2;
const TILE_WATER = 0x3;
const TILE_SIGN1 = 0x4;
const TILE_GATE1 = 0x5;
const TILE_METAL = 0x6;
const TILE_SHADE = 0x7;
const TILE_ROCKS = 0x8;
const TILE_BRICK = 0x9;
const TILE_GRASS = 0xA;
const TILE_FUEL1 = 0xB;
const TILE_SAND1 = 0xC;
const TILE_SPIKU = 0xD;
const TILE_SPIKD = 0xE;
const TILE_LEVE1 = 0xF;
const TILE_PLAYER = 16;

view.addEventListener("mousedown", viewMouseDown, false);
view.addEventListener("mousemove", viewMouseMove, false);


// Prevent default drag behaviors
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  content.addEventListener(eventName, preventDefaults, false)   
  document.body.addEventListener(eventName, preventDefaults, false)
})

// Highlight drop area when item is dragged over it
;['dragenter', 'dragover'].forEach(eventName => {
  content.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
  content.addEventListener(eventName, unhighlight, false)
})

// Handle dropped files
content.addEventListener('drop', loadLevel, false);

function preventDefaults (e)
{
  e.preventDefault()
  e.stopPropagation()
}

function highlight(e)
{
  dropArea.classList.add('highlight')
}

function unhighlight(e)
{
  dropArea.classList.remove('highlight')
}

function loadLevel(e)
{
  var file = e.target.files[0];
  var reader = new FileReader();
  if (!file)
    return;
  reader.onload = function(e) {
    var dataView = new DataView(e.target.result);
    var i = 32;
    var width = dataView.getUint8(i++);
    var height = dataView.getUint8(i++);
    var count = 0;
    var levelOffsetX, levelOffsetY, playerOffsetX, playerOffsetY;
    document.getElementById("levelName").value = String.fromCharCode.apply(null, new Uint8Array(e.target.result.slice(0, 32)));
    if (width < 12 || width > 60 || height < 11 || height > 60)
    {
      alert("ERROR: Invalid level");
      return;
    }
    document.getElementById("levelWidth").value = width;
    document.getElementById("levelHeight").value = height;
    levelWidth = width;
    levelHeight = height;
    view.width = width * 8;
    view.height = height * 8;
    for (var y = 0; y < height; ++y)
    {
      for (var x = 0; x < width / 2; ++x)
      {
        setTile(x * 2, y, (dataView.getUint8(i) / 16) & 0xF);
        setTile(x * 2 + 1, y, dataView.getUint8(i++) & 0xF);
      }
    }
    count = dataView.getUint8(i++); //skip over start positions
    i += count;
    count = dataView.getUint8(i++); //skip over end positions
    i += count;
    levelOffsetX = dataView.getInt16(i, true);
    levelOffsetY = dataView.getInt16(i + 2, true);
    playerOffsetX = dataView.getInt16(i + 4, true);
    playerOffsetY = dataView.getInt16(i + 6, true);
    i += 8;
    playerX = ~~((playerOffsetX - levelOffsetX) / 8);
    playerY = ~~((playerOffsetY - levelOffsetY) / 8);
    document.getElementById("levelFuel").value = dataView.getUint8(i++) * 10;
    document.getElementById("levelFares").value = dataView.getUint8(i++);
    i += 4; //skip levelNameOffset, positions, gateLeft, gateRight
    document.getElementById("levelGates").value = dataView.getUint8(i++) * 10;
    updateView();
  };
  reader.readAsArrayBuffer(file);
}

function isValidFilenameChar(code)
{
  if (code >= 48 && code <= 57)
    return true;
  else if (code >= 65 && code <= 90)
    return true;
  else if (code == 95)
    return true;
  else if (code >= 97 && code <= 122)
    return true;
  return false;
}

function saveLevel()
{
  var levelData = new ArrayBuffer(32 + 2 + ~~(levelWidth * levelHeight / 2) + 2 + signCount * 4 + 8 + 7);
  var dataView = new DataView(levelData);
  var i = 0;
  var levelName = document.getElementById("levelName").value.padEnd(32, ' ');
  var fileName = "";
  if (hasErrors)
  {
    alert("There are errors that need to be corrected before you can save this level.");
    return;
  }
  for (i = 0; i < 32; ++i)
  {
    dataView.setUint8(i, levelName.charCodeAt(i) & 0xFF);
    if (!isValidFilenameChar(levelName.charCodeAt(i)))
      fileName += "_";
    else
      fileName += levelName[i];
  }
  while (fileName[fileName.length - 1] == "_")
    fileName = fileName.slice(0, fileName.length - 2);
  fileName += ".raw";
  dataView.setUint8(i++, levelWidth);
  dataView.setUint8(i++, levelHeight);
  for (var y = 0; y < levelHeight; ++y)
  {
    for (var x = 0; x < levelWidth; x += 2)
    {
      var tile1 = getTile(x, y);
      var tile2 = getTile(x + 1, y);
      dataView.setUint8(i++, (tile1 * 16) + tile2);
    }
  }
  dataView.setUint8(i++, signCount * 2);
  for (var y = 0; y < levelHeight; ++y)
  {
    for (var x = 0; x < levelWidth; ++x)
    {
      if (getTile(x, y) == TILE_SIGN1)
      {
        dataView.setUint8(i++, x + determineCustomerPosition(x, y));
        dataView.setUint8(i++, y);
      }
    }
  }
  dataView.setUint8(i++, signCount * 2);
  for (var y = 0; y < levelHeight; ++y)
  {
    for (var x = 0; x < levelWidth; ++x)
    {
      if (getTile(x, y) == TILE_SIGN1)
      {
        dataView.setUint8(i++, x);
        dataView.setUint8(i++, y);
      }
    }
  }
  var dif = 47;
  var levelOffsetX = playerX * 8 - 47;
  var levelOffsetY = playerY * 8 - 40;
  var playerOffsetX, playerOffsetY;
  if (levelOffsetX < 0)
    levelOffsetX = 0;
  else if (levelOffsetX + 110 > levelWidth * 8)
    levelOffsetX = levelWidth * 8 - 110;
  if (levelOffsetY < 0)
    levelOffsetY = 0;
  else if (levelOffsetY + 88 > levelHeight * 8)
    levelOffsetY = levelHeight * 8 - 88;
  levelOffsetX *= -1;
  levelOffsetY *= -1;
  playerOffsetX = playerX * 8 + levelOffsetX;
  playerOffsetY = playerY * 8 + levelOffsetY + 5;
  console.log("Level Offset: (" + levelOffsetX + ", " + levelOffsetY + ")");
  console.log("Player Offset: (" + playerOffsetX + ", " + playerOffsetY + ")");
  dataView.setInt16(i, levelOffsetX, true);
  dataView.setInt16(i + 2, levelOffsetY, true);
  dataView.setUint16(i + 4, playerOffsetX, true);
  dataView.setUint16(i + 6, playerOffsetY, true);
  i += 8;
  dataView.setUint8(i++, ~~(document.getElementById("levelFuel").value / 10));
  dataView.setUint8(i++, document.getElementById("levelFares").value);
  dataView.setUint8(i++, 2);
  dataView.setUint8(i++, signCount);
  var gateLeft = 255;
  var gateRight = 0;
  for (var x = 0; x < levelWidth; ++x)
  {
    if (getTile(x, 0) == TILE_GATE1)
    {
      if (gateLeft == 255)
        gateLeft = x;
      gateRight = x;
    }
  }
  dataView.setUint8(i++, gateLeft);
  dataView.setUint8(i++, gateRight);
  dataView.setUint8(i++, ~~(document.getElementById("levelGates").value / 10));
  downloadBlob(new Blob([levelData]), fileName);
}

function setActiveTile(id)
{
  let oldA = document.getElementById("tile" + activeTile);
  let newA = document.getElementById("tile" + id);
  oldA.classList.toggle("active");
  newA.classList.toggle("active");
  activeTile = id;
}

function changeWidth(val)
{
  if (val % 2 == 1)
  {
    alert("Level width must be an even number.");
    return;
  }
  levelWidth = val;
  view.width = levelWidth * 8;
  updateView();
}

function changeHeight(val)
{
  levelHeight = val;
  view.height = levelHeight * 8;
  updateView();
}

function toggleGrid()
{
  showGrid = !showGrid;
  updateView();
}

function viewMouseDown(e)
{
  var rect = view.getBoundingClientRect();
  var x = ~~((e.x - rect.x) / 8);
  var y = ~~((e.y - rect.y) / 8);
  if (e.buttons != 1)
    return;
  if (activeTile == TILE_PLAYER)
  {
    playerX = x;
    playerY = y;
    updateView();
  }
  else if (getTile(x, y) != activeTile)
  {
    setTile(x, y, activeTile);
    updateView();
  }
}

function viewMouseMove(e)
{
  var rect = view.getBoundingClientRect();
  var x = ~~((e.x - rect.x) / 8);
  var y = ~~((e.y - rect.y) / 8);
  if (e.buttons != 1)
    return;
  if (activeTile == TILE_PLAYER)
  {
    playerX = x;
    playerY = y;
    updateView();
  }
  else if (getTile(x, y) != activeTile)
  {
    setTile(x, y, activeTile);
    updateView();
  }
}

function updateView()
{
  //var c = document.getElementById("view");
  var ctx = view.getContext("2d");
  var sign = 0;
  ctx.fillStyle = "#ffec27";
  for (var y = 0; y < levelHeight; ++y)
  {
    for (var x = 0; x < levelWidth; ++x)
    {
      var tile = getTile(x, y);
      var srcX = tile * 8;
      var srcY = 0;
      var srcW = 8;
      var srcH = 8;
      var dstX = x * 8;
      var dstY = y * 8;
      if (tile == TILE_SIGN1)
      {
        if (sign >= 9)
          srcX = 120;
        else
          srcX = sign * 8;
        srcY = 8;
        srcH = 16;
        dstY -= 8;
        ++sign;
      }
      else if (tile == TILE_GATE1)
      {
        if (getTile(x, y - 1) == TILE_GATE1)
        {
          srcX = 72;
          srcY = 8;
        }
        else if (getTile(x, y + 1) == TILE_GATE1)
        {
          srcX = 72;
          srcY = 8;
        }
      }
      ctx.drawImage(tilesImage, srcX, srcY, srcW, srcH, dstX, dstY, srcW, srcH);
      if (showGrid)
        ctx.fillRect(x * 8 + 7, 0, 1, levelHeight * 8);
    }
    if (showGrid)
      ctx.fillRect(0, y * 8 + 7, levelWidth * 8, 1);
  }
  ctx.drawImage(tilesImage, 80, 8, 17, 11, playerX * 8, playerY * 8 + 5, 17, 11);
  checkErrors();
}

function getTile(x, y)
{
  if (x < 0 || x >= 60)
    return TILE_BRICK;
  else if (y < 0 || y >= 60)
    return TILE_BRICK;
  return levelData[y * 60 + x];
}

function setTile(x, y, tile)
{
  if (x < 0 || x >= 60)
    return;
  else if (y < 0 || y >= 60)
    return;
  if (tile < 0 || tile >= 16)
    return;
  levelData[y * 60 + x] = tile;
}

function isBlankTile(x, y)
{
  var tile = getTile(x, y);
  if (tile == TILE_EMPTY)
    return true;
  else if (tile == TILE_EDGE1)
    return true;
  else if (tile == TILE_GRASS)
    return true;
  else if (tile == TILE_LEVE1)
    return true;
  return false;
}

function isGroundTile(x, y)
{
  var tile = getTile(x, y);
  if (tile == TILE_BRICK)
    return true;
  else if (tile == TILE_PLAT1)
    return true;
  else if (tile == TILE_SHADE)
    return true;
  else if (tile == TILE_ROCKS)
    return true;
  else if (tile == TILE_METAL)
    return true;
  else if (tile == TILE_SAND1)
    return true;
  return false;
}

function checkErrors()
{
  //Check number of signs are between 2 and 9
  var errors = "";
  var count = 0;
  var hasInternalGate = false;
  var hasLever = false;
  for (var y = 0; y < levelHeight; ++y)
  {
    for (var x = 0; x < levelWidth; ++x)
    {
      if (getTile(x, y) == TILE_SIGN1)
      {
        ++count;
        if (count <= 9 && determineCustomerPosition(x, y) == 0)
          errors += "Sign " + count + " prevents customers<br/>";
      }
      else if (getTile(x, y) == TILE_LEVE1)
        hasLever = true;
      else if (getTile(x, y) == TILE_GATE1 && y > 0)
        hasInternalGate = true;
    }
  }
  if (count < 2)
    errors += "Min 2 signs needed<br/>";
  else if (count > 9)
    errors += "Max 9 signs exceeded<br/>";
  signCount = count;
  
  //Check if there is 1 and only 1 exit gate (continuous line of gate tiles at top of level)
  count = 0;
  var solidTop = true;
  var solidBottom = true;
  for (var x = 0; x < levelWidth; ++x)
  {
    if (getTile(x, 0) == TILE_GATE1 && getTile(x - 1, 0) != TILE_GATE1)
      ++count;
    if (!isGroundTile(x, 0) && getTile(x, 0) != TILE_GATE1)
      solidTop = false;
    if (!isGroundTile(x, levelHeight - 1))
      solidBottom = false;
  }
  console.log("solid: " + solidTop + " " + solidBottom);
  if (count == 0)
    errors += "Missing exit gate<br/>";
  else if (count > 1)
    errors += "Multiple exit gates<br/>";
  if (!solidTop)
    errors += "Top row must be solid tiles<br/>";
  if (!solidBottom)
    errors += "Bottom row must be solid tiles<br/>";
  var emptyPlayer = true;
  if (!isBlankTile(playerX, playerY) || !isBlankTile(playerX + 1, playerY) || !isBlankTile(playerX, playerY + 1) || !isBlankTile(playerX + 1, playerY + 1))
    errors += "Player must be in empty space<br/>";
  
  //Check internal gates and levers (error if one but not the other)
  if (hasInternalGate && !hasLever)
    errors += "Internal gate without any levers<br/>";
  else if (!hasInternalGate && hasLever)
    errors += "Levers with no internal gates<br/>";
  
  //Report errors
  if (errors == "")
  {
    var errorTitle = document.getElementById("errorTitle");
    errorTitle.style.color = "green";
    errorTitle.innerHTML = "NO ERRORS";
    hasErrors = false;
  }
  else
  {
    var errorTitle = document.getElementById("errorTitle");
    errorTitle.style.color = "red";
    errorTitle.innerHTML = "ERRORS";
    hasErrors = true;
  }
  document.getElementById("errors").innerHTML = errors;
}

function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min) + min);
}

function determineCustomerPosition(x, y)
{
  var bl3 = isBlankTile(x - 3, y);
  var bl2 = isBlankTile(x - 2, y);
  var bl1 = isBlankTile(x - 1, y);
  var br1 = isBlankTile(x + 1, y);
  var br2 = isBlankTile(x + 2, y);
  var br3 = isBlankTile(x + 3, y);
  
  var gl3 = isGroundTile(x - 3, y + 1);
  var gl2 = isGroundTile(x - 2, y + 1);
  var gl1 = isGroundTile(x - 1, y + 1);
  var gr1 = isGroundTile(x + 1, y + 1);
  var gr2 = isGroundTile(x + 2, y + 1);
  var gr3 = isGroundTile(x + 3, y + 1);
  
  if (!gl1 && gr1 && gr2 && br1 && br2)
    return 1;
  else if (gl2 && gl1 && !gr1 && bl2 && bl1)
    return -1;
  else if (!gl2 && gl1 && gr1 && gr2 && bl1 && br1 && br2)
    return -1;
  else if (gl2 && gl1 && gr1 && !gr2 && bl2 && bl1 && br1)
    return 1;
  else if (gl2 && gl1 && gr1 && gr2 && !bl2 && bl1 && br1 && br2)
    return -1;
  else if (gl2 && gl1 && gr1 && gr2 && bl2 && bl1 && br1 && !br2)
    return 1;
  else if (gl3 && gl2 && gl1 && bl3 && bl2 && bl1)
    return -1;
  else if (gr1 && gr2 && gr3 && br1 && br2 && br3)
    return 1;
  else if (gl2 && gl1 && gr1 && gr2 && bl2 && bl1 && br1 && br2)
    return (getRandomInt(0, 2) == 0) ? -1:1;
  return 0;
}

function downloadBlob(blob, filename)
{
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  a.style.display = "hidden";
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      this.removeEventListener('click', clickHandler);
    }, 150);
  };
  a.addEventListener('click', clickHandler, false);
  a.click();
}
