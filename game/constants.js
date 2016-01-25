var MINIMAP_STYLE = {
	stroke: PALETTE.primary[0],
	bg: PALETTE.primary[3],
	border: PALETTE.primary[0],
	lineWidth: 0.12,
	dotRadius: 0.33,
	outerRadius: 0.58
};

var MAP_STYLE = {
	road: PALETTE.primary[1],
	bg: PALETTE.primary[2],
	border: PALETTE.primary[1],
	rasterLineWidth: 0.002
};

var PLAYER_STYLE = {
	fill: PALETTE.secondary[3],
	stroke: PALETTE.secondary[0]
};

var PLAYER2_STYLE = {
	fill: PALETTE.tertiary[3],
	stroke: PALETTE.tertiary[0]
};

var PLAYER_GEOMETRY = {
	size: 0.1,
	assymetry: 2,
	lineWidth: 0.0125
};

var SPEED_BAR_STYLE = {
	fill: PALETTE.primary[3]
};

var WIN_BG_STYLE = {
	fill: PALETTE.primary[3],
	stroke: PALETTE.primary[0],
	lineWidth: 5
};

var KEY_DISPLAY_STYLE = {
	fill: PALETTE.primary[3],
	highlighted: PALETTE.tertiary[1],
	stroke: PALETTE.primary[0],
	lineWidth: 5,
	size: 50,
	margin: 10,
	relativeTextSize: 0.7
};

var MAIN_FONT = 'Verdana';

var MINIMAP_CELL_SIZE = 15;
var MAP_CELL_SIZE = 400;
var MAP_ROAD_SIZE = 200;

var VIEW_BORDER = 10;

var PLAYER_BASE_SPEED = 0.7;
var PLAYER_SPEED_SCALE = 0.3;
var PLAYER_ACCELERATION = 10;

var MAX_PLAYER_SPEED = 10;

var TURN_TIME = 0.4;

var WIN_MESSAGE_FONT_SIZE = 90;

var START_MESSAGE_BOX_STYLE = {
	titleFontSize: 90,
	messageFontSize: 30,
	textColor: PALETTE.primary[0]
};

var BUTTON_STYLE = {
	default: PALETTE.primary[0],
	highlighted: PALETTE.secondary[0],
	pressed: PALETTE.tertiary[0]
};

var SPEED_TOKEN_STYLE = {
	stroke: PALETTE.primary[0],
	active: PALETTE.supplemental[2],
	inactive: PALETTE.primary[2],
	bg: PALETTE.primary[3],
	lineWidth: 5,
	width: 10,
	height: 50,
	margin: 10
};

var TITLE_BG_COLOR = PALETTE.primary[2];