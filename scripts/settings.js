var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

var VERTICES_PER_ROW = 25,
    GRID_OFFSET_X = 250,
    GRID_OFFSET_Y = 50;
    VERTEX_MARGIN = (g_canvas.width - (2 * GRID_OFFSET_X)) / (VERTICES_PER_ROW - 1);